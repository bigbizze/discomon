import subprocess
import os
import re
import shutil
import argparse
from dotenv import dotenv_values

config = dotenv_values(".env")

def get_token(_server):
    return {
        "live": config["BOT_TOKEN_LIVE"],
        "private_test": config["BOT_TOKEN_PRIVATE_TEST"],
        "public_test": config["BOT_TOKEN_PUBLIC_TEST"]
    }[_server]


def split_all(path):
    all_parts = []
    while 1:
        parts = os.path.split(path)
        if parts[0] == path:  # sentinel for absolute paths
            all_parts.insert(0, parts[0])
            break
        elif parts[1] == path:  # sentinel for relative paths
            all_parts.insert(0, parts[1])
            break
        else:
            path = parts[0]
            all_parts.insert(0, parts[1])
    return all_parts


def create_sub_dirs(path):
    path_segments = [x for x in split_all(path) if x != "."]
    written_segment = "./"
    for subdir in path_segments:
        next_to_write = f"{written_segment}{subdir}/"
        if not os.path.exists(next_to_write):
            os.mkdir(next_to_write)
        written_segment = next_to_write


def write_rust_stuff():
    rust_path_from = "./src/tools/discomon/cell-generator/rust-cells/pkg"
    rust_path_to = "./prod/src/tools/discomon/cell-generator/rust-cells/pkg"
    create_sub_dirs(rust_path_to)
    for path, subdir, files in os.walk(rust_path_from):
        for file in files:
            is_wasm = file.endswith(".wasm")
            if not file.endswith(".js") and not is_wasm and not file.endswith(".json"):
                continue
            with open(f"{rust_path_to}/{file}", "w" if not is_wasm else "wb", encoding="utf-8" if not is_wasm else None) as out, \
                    open(f"{rust_path_from}/{file}", "r" if not file.endswith(".wasm") else "rb", encoding="utf-8" if not is_wasm else None) as in_:
                out.write(in_.read())


def write_fonts():
    with open("./Imagine_Font.ttf", "rb") as out, open("./prod/Imagine_Font.ttf", "wb") as _in:
        _in.write(out.read())

#"695132258453028864"
def update_do_roles_with_id():
    with open("./prod/tools/misc/do_role.js", "r", encoding="utf-8") as f:
        script = f.read()
    script = script.replace("#INSERT_GUILD_ID", "694030682254475315" if server in ["public_test", "private_test"] else "694030682254475315")
    with open("./prod/tools/misc/do_role.js", "w", encoding="utf-8") as f:
        f.write(script)


parser = argparse.ArgumentParser()

parser.add_argument("-s", help="server to target, options are public_test, private_test & live")

args = parser.parse_args()

arg_types = {
    "public_test",
    "private_test",
    "live"
}

if args.s and args.s in arg_types:
    server = args.s
else:
    server = "private_test"


def recursive_remove(depth=0, last_error=None):
    if depth == 6:
        raise Exception(last_error)
    try:
        if os.path.exists("./prod"):
            shutil.rmtree("./prod")
    except PermissionError as e:
        recursive_remove(depth + 1, e)


recursive_remove()
os.mkdir("./prod")

webpack_process = subprocess.Popen("tsc", shell=True)

webpack_process.wait()

with open("./prod/package.json", "w") as fp:
    fp.write("""
{
    "name": "prod",
    "version": "1.0.0",
    "description": "",
    "main": "discord.js",
    "author": "",
    "license": "ISC"
}
             """.strip())

with open("./prod/.env", "w") as fp:
    fp.write("""
DBL_TOKEN={dbl_token}
DBL_TEST_TOKEN={dbl_test_token}
WEBHOOK_USERNAME={webhook_username}
WEBHOOK_SERVERNAME=httpServer
BOT_TOKEN={bot_token}
COEFFICIENT_DEPRECATION=1593057600000
MAX_EXP=3213
BOT_PREFIX={bot_prefix}
DBL_API=0
CACHE_COMMANDS=0
""".strip()
.format(
    bot_token=get_token(server),
    dbl_token=config["DBL_TOKEN"],
    dbl_test_token=config["DBL_TEST_TOKEN"],
    webhook_username=config["WEBHOOK_USERNAME"],
    bot_prefix=config["BOT_PREFIX"]
))


write_rust_stuff()

write_fonts()

update_do_roles_with_id()
