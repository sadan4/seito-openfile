'use strict';

import * as vscode from 'vscode';
import {dirname,join,isAbsolute} from 'path';
import {existsSync,statSync} from 'fs';


export class FileOperations
{
	public static getAbsoluteFromRelativePath(iPath:string, iCurrPath:string): string
	{
		if( iPath === undefined || iPath === "" || iCurrPath === undefined || iCurrPath === "" )
			return "";

		try
		{
			if( iPath[0] === "~" )
			{
				iCurrPath = this.getAbsoluteHomePath();
				iPath = iPath.substr(1);
			}
			else if( isAbsolute(iPath) )
				return join(iPath);
			else if( statSync(iCurrPath).isFile )
			{
				iCurrPath = dirname(iCurrPath);
			}

			return join(iCurrPath, iPath);
		}
		catch(error)
		{
			return "";
		}
	}

	public static getAbsoluteHomePath(): string
	{
		let prof = (process.platform === 'win32') ? 'USERPROFILE' : 'HOME';
		return process.env[prof];
	}
}