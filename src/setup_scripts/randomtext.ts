const random = require('./tools/misc/random.js');
let out = 0;
while (out < 99.8) {
    out = random(0, 99, false);
    console.log(out);
}
console.log(out);
