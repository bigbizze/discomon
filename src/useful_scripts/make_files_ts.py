import os

root_dir = "../"
for root, dirs, files in os.walk(root_dir):
    path = root.split(os.sep)
    for file in files:
        if not file.endswith(".js"):
            continue
        # with open(f"{root}/{file}", "r", encoding="utf-8") as fp:
        #     code = fp.read()
        # stripped_fn = file.rstrip(".js")
        # with open(f"{root}/{stripped_fn}.ts", "w", encoding="utf-8") as fp:
        #     fp.write(code)
        os.remove(f"{root}/{file}")


