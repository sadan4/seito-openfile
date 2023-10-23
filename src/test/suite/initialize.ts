import {
  writeFileSync,
  unlinkSync,
  mkdirSync,
  rmdirSync,
  existsSync,
} from "fs";

let WS_ROOT = process.env.WS_ROOT;
if (WS_ROOT === undefined) {
  WS_ROOT = "./";
}
const dirnames = [
  WS_ROOT + "/Unittests-tmp",
  WS_ROOT + "/Unittests-tmp/test",
  WS_ROOT + "/Unittests-tmp/test/dir1",
  WS_ROOT + "/Unittests-tmp/src",
  WS_ROOT + "/Unittests-common",
  WS_ROOT + "/Unittests-common/test",
];
const files = [
  { name: WS_ROOT + "/Unittests-tmp/test.ts", content: "" },
  {
    name: WS_ROOT + "/Unittests-tmp/Unicode.txt",
    content: "lorem ipsum\r\n😀😀😀dmfmg d ssd 😀😀😀d😀😀😀😀",
  },
  { name: WS_ROOT + "/Unittests-tmp/.DS_Store", content: "" },
  { name: WS_ROOT + "/Unittests-tmp/test/hans.txt", content: "" },
  { name: WS_ROOT + "/Unittests-tmp/test/test.scss", content: "" },
  { name: WS_ROOT + "/Unittests-tmp/test/_test2.scss", content: "" },
  { name: WS_ROOT + "/Unittests-tmp/test/_test3.scss", content: "" },
  {
    name: WS_ROOT + "/Unittests-tmp/test/testcase.txt",
    content:
      "the first line\r\nthe second line\r\n\r\nthe forth line\r\n\r\nthe sixth line",
  },
  { name: WS_ROOT + "/Unittests-common/test.ts", content: "" },
  {
    name: WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts",
    content: "line 1",
  },
  { name: WS_ROOT + "/Unittests-tmp/src/Class1.ts", content: "" },
  { name: WS_ROOT + "/Unittests-tmp/src/Class12", content: "bla" },
];

export async function envSetup(): Promise<any> {
  console.log("Initialize!");
  try {
    dirnames.forEach((dirname) => {
      console.log(`Try creating directory: ${dirname}`);
      if (!existsSync(dirname)) {
        console.log(`Creating dir ${dirname}`);
        mkdirSync(dirname);
      }
    });
  } catch (error: any) {
    console.error(`Error mkdir: ${error}`);
    throw new Error(error);
  }
  try {
    files.forEach((file) => {
      console.log(`Creating file ${file.name}`);
      writeFileSync(file.name, file.content);
    });
  } catch (error: any) {
    console.error("Error create file: ", error);
    throw new Error(error);
  }
  Promise.resolve();
}

export async function envTeardown(): Promise<any> {
  console.log("Teardown!");
  try {
    files.forEach((file) => {
      unlinkSync(file.name);
    });
    rmdirSync(dirnames[0], { recursive: true });
    Promise.resolve();
  } catch (error: any) {
    throw new Error(error);
  }
}
