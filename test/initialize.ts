import {writeFileSync, writeFile, unlink, unlinkSync, mkdirSync, rmdirSync} from 'fs';

let filename = "d:\\Temp\\test.ts";
let filename2 = "d:/Temp/test/hans.txt";
let filename5 = "d:/Temp/test/test.scss";
let filename3 = "d:/Temp/test/_test2.scss";
let filename4 = "d:/Temp/test/_test3.scss";
let dirname = "d:\\Temp\\test\\";

export function initialize(): Promise<any>
{
	return new Promise<any>((resolve, reject) => {
		try{
			mkdirSync(dirname);
			resolve();
		}
		catch(error)
		{
			//reject();
		}
		try{
			writeFileSync(filename, "");
			resolve();
		}
		catch(error)
		{
			//reject();
		}
		try{
			writeFileSync(filename2, "");
			writeFileSync(filename3, "");
			writeFileSync(filename4, "");
			writeFileSync(filename5, "");
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
			unlinkSync(filename);
			unlinkSync(filename2);
			unlinkSync(filename3);
			unlinkSync(filename4);
			unlinkSync(filename5);
			rmdirSync(dirname);
			resolve();
		}
		catch(error)
		{
			reject();
		}
	});
}