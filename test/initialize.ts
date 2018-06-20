import {writeFileSync, writeFile, unlink, unlinkSync, mkdirSync, rmdirSync, existsSync} from 'fs';

let dirnames = ["d:\\Temp\\test", "d:/common"];
let files = [
	{"name": "d:\\Temp\\test.ts", "content": ""},
	{"name": "d:/Temp/test/hans.txt", "content": ""},
	{"name": "d:/Temp/test/test.scss", "content": ""},
	{"name": "d:/Temp/test/_test2.scss", "content": ""},
	{"name": "d:/Temp/test/_test3.scss", "content": ""},
	{"name": "d:/Temp/test/testcase.txt", "content": "the first line\r\nthe second line\r\n\r\nthe forth line\r\n\r\nthe sixth line"},
	{"name": "d:\\common\\test.ts", "content": ""},
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
			dirnames.forEach(dirname => {
				rmdirSync(dirname);
			});
			resolve();
		}
		catch(error)
		{
			reject();
		}
	});
}