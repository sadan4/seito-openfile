

import {writeFileSync, writeFile, unlink, unlinkSync, mkdirSync, rmdirSync} from 'fs';

let filename = "d:\\Temp\\test.ts";
let filename2 = "d:/Temp/test/hans.txt";
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
			rmdirSync(dirname);
			resolve();
		}
		catch(error)
		{
			reject();
		}
	});
}
