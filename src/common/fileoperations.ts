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

	public static getAbsolutePathFromFuzzyPath(iPath:string, iCurrPath:string): string
	{
		if( iPath === undefined || iPath === "" || iCurrPath === undefined || iCurrPath === "" )
			return "";
		// extract file name
		let rightPos = iPath.lastIndexOf("/");
		if( rightPos === -1 )
			rightPos = iPath.lastIndexOf("\\");
		if( rightPos > -1 && rightPos < (iPath.length-1))
		{
			let suffix = "scss";
			let fileName = iPath.substr(rightPos+1);
			if( fileName.indexOf("_") == -1 || fileName.indexOf("_") > 0 )
				fileName = "_" + fileName;
			if( fileName.lastIndexOf(".") == -1 )
				fileName += ".scss";
			let path = iPath.substr(0, rightPos+1);
			path += fileName;
			return this.getAbsoluteFromRelativePath(path, iCurrPath);
		}
		return "";
	}

	public static getAbsoluteHomePath(): string
	{
		let prof = (process.platform === 'win32') ? 'USERPROFILE' : 'HOME';
		return process.env[prof];
	}
}