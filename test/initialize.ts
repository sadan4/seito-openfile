import {writeFileSync, writeFile, unlink, unlinkSync, mkdirSync, rmdirSync, existsSync} from 'fs';

let WS_ROOT = process.env.WS_ROOT;
let dirnames = [WS_ROOT + "/Unittests-tmp", WS_ROOT + "/Unittests-tmp/test", WS_ROOT + "/Unittests-tmp/test/dir1", WS_ROOT + "/Unittests-tmp/src", WS_ROOT + "/Unittests-common"];
let files = [
	{"name": WS_ROOT + "/Unittests-tmp/test.ts", "content": ""},
	{"name": WS_ROOT + "/Unittests-tmp/test/hans.txt", "content": ""},
	{"name": WS_ROOT + "/Unittests-tmp/test/test.scss", "content": ""},
	{"name": WS_ROOT + "/Unittests-tmp/test/_test2.scss", "content": ""},
	{"name": WS_ROOT + "/Unittests-tmp/test/_test3.scss", "content": ""},
	{"name": WS_ROOT + "/Unittests-tmp/test/testcase.txt", "content": "the first line\r\nthe second line\r\n\r\nthe forth line\r\n\r\nthe sixth line"},
	{"name": WS_ROOT + "/Unittests-common/test.ts", "content": ""},
	{"name": WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts", "content": "line 1"},
	{"name": WS_ROOT + "/Unittests-tmp/src/Class1.ts", "content": ""},
];

export function envSetup(): Promise<any>
{
	return new Promise<any>((resolve, reject) => {
		console.log("Initialize!")
		try{
			dirnames.forEach(dirname => {
				if(!existsSync(dirname))
					mkdirSync(dirname);
			});
		}
		catch(error)
		{
			console.error("Error mkdir: ", error);
			reject();
		}
		try{
			files.forEach(file => {
				writeFileSync(file.name, file.content);
			});
		}
		catch(error)
		{
			console.error("Error create file: ", error);
			reject();
		}
		resolve();
	});
}

export function envTeardown(): Promise<any>
{
	return new Promise<any>((resolve, reject) => {
		console.log("Teardown!");
		try{
			files.forEach(file => {
				unlinkSync(file.name);
			});
			for(let i=dirnames.length-1; i>=0; i--){
				rmdirSync(dirnames[i]);
			};
			resolve();
		}
		catch(error)
		{
			reject();
		}
	});
}