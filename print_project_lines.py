import os
import threading

##########################################################

def main():
    new_root = os.path.abspath("designing/competitive")
    java_script_paths = []
    css_paths = []
    tests_paths = []

    for root, dirs, files in os.walk(new_root):
        path = root.split(os.sep)
        for file in files:
            if file.endswith(".tsx") or file.endswith(".ts"):
                java_script_paths.append(root + "\\" + file) if not root.endswith("_") else tests_paths.append(root + "\\" + file)
            elif file.endswith(".css") or file.endswith(".less") or file.endswith(".scss") or file.endswith("sass"):
                css_paths.append(root + "\\" + file)

    ##########################################################

    def count_lines(paths):
        num_lines = 0
        for file in paths:
            with open(file, "r", encoding="utf-8") as fp:
                data = fp.read()
            num_lines += len([x for x in data.strip().split("\n") if x.strip()])
        return num_lines

    num_js_lines = count_lines(java_script_paths)
    num_css_lines = count_lines(css_paths)
    num_test_lines = count_lines(tests_paths)

    ##########################################################

    def get_dashes(op="-"):
        return "\n" + op * 48

    print("{4}{3}\nCounted Lines in /src/: {3}\n# Lines of TypeScript (tests excluded) -- {0}{3}\n# Lines of Stylesheets                 -- {1}{3}\n# Lines of Tests                       -- {2}{3}{4}\n\n".format(num_js_lines, num_css_lines, num_test_lines, get_dashes(), get_dashes("#")))


if __name__ == '__main__':
    thread = threading.Thread(target=main)
    thread.start()
    thread.join()

