import * as cluster from 'cluster';
import { Worker } from 'cluster';
import { cpus } from 'os';
import { get_db_info } from "../tools/discomon/image-generator/utils";
import { existsSync, readFileSync, writeFileSync } from "fs";
import get_alphamon from "../tools/discomon/alpha_seed";
import { sleep } from "../helpers/general_helpers";
import { get_alpha_from_seed } from "../tools/discomon/alpha_seed/utils";

const numCPUs = cpus().length - 2;
// const numCPUs = 2;
type ColourItem = [
    number,
    number,
    number
];

export type ColourStore = {
    b1: ColourItem,
    b2: ColourItem,
    o: ColourItem,
    seed: number
};

function mine_colours(seed: number): ColourStore {
    const _seed = get_alpha_from_seed(seed);
    const db_props = get_db_info(_seed, 1, 3600);
    const mon = get_alphamon(db_props, "user");
    return {
        b1: [ mon.colours.body_colour_one.hue, mon.colours.body_colour_one.sat, mon.colours.body_colour_one.lum ],
        b2: [ mon.colours.body_colour_two.hue, mon.colours.body_colour_two.sat, mon.colours.body_colour_two.lum ],
        o: [ mon.colours.outline_colour.hue, mon.colours.outline_colour.sat, mon.colours.outline_colour.lum ],
        seed
    };
}

interface WorkerResponse {
    id: number,
    data: ColourStore[]
}

type SeedRange = {
    min: number
    max: number
};

interface WorkerRequest {
    id: number,
    seed_range: SeedRange
}

const num_seeds_spaced = `60,466,176`;
const num_seeds = Number(num_seeds_spaced.split(",").join(""));
const num_seeds_per_batch = 10000;

class ParallelProcess {
    current_seed: number;
    colour_store: ColourStore[];
    workers: Worker[];
    idle_workers: Worker[];
    file_path: string;
    num_iters: number;
    file_num: number;

    constructor(file_path: string) {
        this.file_num = 1;
        this.file_path = file_path;
        this.current_seed = 0;
        this.colour_store = [];
        this.workers = [];
        this.idle_workers = [];
        this.num_iters = num_seeds / num_seeds_per_batch;
        this.setup();
    }

    on_message = (self: ParallelProcess) => {
        return (message: WorkerResponse) => {
            if (!self.idle_workers.some(x => x.id === message.id)) {
                self.idle_workers.push(self.workers.reduce((a: Worker, b: Worker) => a.id === message.id ? a : b));
            }
            self.colour_store = self.colour_store.concat(message.data);
            self.write();
        };
    };

    setup() {
        for (let i = 0; i < numCPUs; i++) {
            const worker = cluster.fork();
            worker.on('message', this.on_message(this));
            this.workers.push(worker);
        }
        this.idle_workers = this.workers;
    }

    write() {
        if (existsSync(`${ this.file_path }_${ this.file_num }.json`)) {
            const existing_data = JSON.parse(readFileSync(`${ this.file_path }_${ this.file_num }.json`, "utf-8"));
            if ("colour_store" in existing_data && existing_data.colour_store.length < 1000000) {
                this.colour_store = this.colour_store.concat(existing_data.colour_store);
            } else {
                this.file_num++;
            }
        }
        writeFileSync(`${ this.file_path }_${ this.file_num }.json`, JSON.stringify({ colour_store: this.colour_store }), {
            encoding: "utf-8",
            flag: "w"
        });
        this.colour_store = [];
    }

    async run() {
        while (true) {
            while (this.idle_workers.length !== 0 && this.current_seed < num_seeds) {
                const worker = this.idle_workers[0];
                if (this.current_seed >= num_seeds && this.idle_workers.length === this.workers.length) {
                    break;
                }
                const maybe_max = this.current_seed + num_seeds_per_batch;
                const max = maybe_max <= num_seeds ? maybe_max : num_seeds;
                worker.send({
                    id: worker.id,
                    seed_range: {
                        min: this.current_seed,
                        max
                    }
                } as WorkerRequest);
                this.current_seed = max;
                this.idle_workers = this.idle_workers.filter((x: Worker) => x.id !== worker.id);
                await sleep(50);
                if ((this.current_seed / num_seeds_per_batch) % Math.ceil(this.num_iters / 100) === 0) {
                    console.log(`${ Math.round(this.current_seed / num_seeds_per_batch / this.num_iters * 100) }%`);
                }
            }
            if (this.current_seed >= num_seeds && this.idle_workers.length === this.workers.length) {
                this.kill();
                break;
            }
            await sleep(50);
        }
    }

    kill() {
        this.workers.forEach(worker => {
            worker.send({
                id: worker.id,
                seed_range: {
                    min: -1,
                    max: -1
                }
            });
            worker.kill('SIGTERM');
        });
    }
}

class ClusterChild {
    current_colour_store: ColourStore[];
    current_seed_range: SeedRange | null;
    current_seed: number | null;
    should_die: boolean;
    id: number | null;

    constructor() {
        this.current_colour_store = [];
        this.current_seed_range = null;
        this.current_seed = null;
        this.should_die = false;
        this.id = null;
        this.setup();
    }

    setup() {
        process.on('message', (message: WorkerRequest) => {
            if (message.seed_range.min < 0) {
                this.should_die = true;
            }
            this.current_seed_range = message.seed_range;
            this.id = message.id;
        });
    }

    async run() {
        while (!this.should_die) {
            if (process.send && this.current_seed_range && this.id) {
                for (let seed = this.current_seed_range.min; seed < this.current_seed_range.max; seed++) {
                    if (seed !== 0) {
                        this.current_colour_store.push(mine_colours(seed));
                    }
                }
                // if (this.current_colour_store.length !== 0) {
                //     console.log({
                //         id: this.id,
                //         store: this.current_colour_store
                //     });
                // }
                process.send({
                    id: this.id,
                    data: this.current_colour_store
                } as WorkerResponse);
                this.current_colour_store = [];
                this.id = null;
                this.current_seed_range = null;
            }
            await sleep(50);
        }
    }
}

// async function cluster_child() {
//     let should_die = false;
//     let proc_state: {
//         id: null | number,
//         seed_range: null | SeedRange
//     } = {
//         id: null,
//         seed_range: null
//     };
//     process.on('message', (message: WorkerRequest) => {
//         if (message.seed_range.min < 0) {
//             should_die = true;
//         }
//         proc_state.seed_range = message.seed_range;
//         proc_state.id = message.id;
//     });
//     while (!should_die) {
//         if (process.send && proc_state.seed_range && proc_state.id) {
//             process.send({
//                 id: proc_state.id,
//                 data: mine_colours(proc_state.seed_range)
//             });
//             proc_state.id = null;
//             proc_state.seed_range = null;
//         }
//         await new Promise(resolve => setTimeout(resolve, 50));
//     }
// }

if (cluster.isMaster) {
    let parallel = new ParallelProcess("X:\\source\\Webstorm Projects\\Discomon_03\\data\\seed_colours");
    parallel.run().then().catch(err => console.log(err));
} else {
    let child = new ClusterChild();
    child.run().then().catch(err => console.log(err));
}
