'use strict';

import * as vscode from 'vscode';
import {dirname,join,isAbsolute} from 'path';
import {existsSync,statSync} from 'fs';
import { ConfigHandler } from '../configuration/confighandler';
import { Configuration } from '../configuration/configuration';


export class FileOperations
{
	public static getAbsoluteFromRelativePath(iPath:string, iCurrPath:string, baseMustBeDir = false): string
	{
		if( iPath === undefined || iPath === "" || iCurrPath === undefined )
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
			else if( iCurrPath === "" ) // fault tolerant: only fail when not absolute or relative-to-home path, if iCurrPath is blank (fix some test case when activeTextEditor is null)
				return "";
			else if( !baseMustBeDir && statSync(iCurrPath).isFile() )
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

	/**
	 * Allow iPath to be like "/sth", but append it to iCurrPath, not treating it as absolute path.
	 */
	public static getAbsoluteFromAlwaysRelativePath(iPath:string, iCurrPath:string, baseMustBeDir = false): string
	{
		if( iPath === undefined || iPath === "" || iCurrPath === undefined || iCurrPath === "" )
			return "";

		try
		{
			if( !baseMustBeDir && statSync(iCurrPath).isFile() )
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

	/**
	 * Only return a matched path if the file actually exists.
	 */
	public static getAbsolutePathFromFuzzyPath(iPath:string, iCurrPath:string, iSuffix: string, baseMustBeDir = false): string
	{
		if( iPath === undefined || iPath === "" || iCurrPath === undefined || iCurrPath === "" )
			return "";
		// extract file name
		let rightPos = iPath.lastIndexOf("/");
		if( rightPos === -1 )
			rightPos = iPath.lastIndexOf("\\");
		let fileName = iPath;
		let path = "./";
		if( rightPos > -1 && rightPos < (iPath.length-1))
		{
			fileName = iPath.substr(rightPos+1);
			path = iPath.substr(0, rightPos+1);
		}
		let retVal = "";
		let f = fileName;
		let p = path;
		if( fileName.lastIndexOf(".") == -1 )
		{
			if (iSuffix !== '') {	// iSuffix may be empty now
				f += "." + iSuffix;
			}
			p += f;
		}
		else
		{
			p += f;
		}
		retVal = this.getAbsoluteFromRelativePath(p, iCurrPath, baseMustBeDir);
		if(!existsSync(retVal))
		{
			if( fileName.indexOf("_") == -1 || fileName.indexOf("_") > 0 )
			{
				f = "_" + f;
				p = path + f;
				retVal = this.getAbsoluteFromRelativePath(p, iCurrPath, baseMustBeDir);
			}
		}
		if(existsSync(retVal))
			return retVal;
		return "";
	}

	public static getAbsoluteHomePath(): string
	{
		let prof = (process.platform === 'win32') ? 'USERPROFILE' : 'HOME';
		let p = process.env[prof];
		if( p === undefined ) 
			return "";
		return p;
	}
}