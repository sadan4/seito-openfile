import {writeFileSync, writeFile, unlink, unlinkSync, mkdirSync, rmdirSync, existsSync} from 'fs';

let dirnames = ["d:\\Unittests", "d:\\Unittests\\test", "d:\\Unittests\\test\\dir1", "d:\\Unittests\\src", "d:/common"];
let files = [
	{"name": "d:\\Unittests\\test.ts", "content": ""},
	{"name": "d:/Unittests/test/hans.txt", "content": ""},
	{"name": "d:/Unittests/test/test.scss", "content": ""},
	{"name": "d:/Unittests/test/_test2.scss", "content": ""},
	{"name": "d:/Unittests/test/_test3.scss", "content": ""},
	{"name": "d:/Unittests/test/testcase.txt", "content": "the first line\r\nthe second line\r\n\r\nthe forth line\r\n\r\nthe sixth line"},
	{"name": "d:\\common\\test.ts", "content": ""},
	{"name": "d:/Unittests/test/dir1/testcase2.ts", "content": "line 1"},
	{"name": "d:/Unittests/src/Class1.ts", "content": ""},
];

export function initialize(): Promise<any>
{
	return new Promise<any>((resolve, reject) => {
		try{
			dirnames.forEach(dirname => {
				if(!existsSync(dirname))
					mkdirSync(dirname);
			});
			resolve();
		}
		catch(error)
		{
			console.error("Fehler: ", error);
			reject();
		}
		try{
			files.forEach(file => {
				writeFileSync(file.name, file.content);
			});
			resolve();
		}
		catch(error)
		{
			//reject();
		}
	});
}

export function teardown(): Promise<any>
{
	return new Promise<any>((resolve, reject) => {
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