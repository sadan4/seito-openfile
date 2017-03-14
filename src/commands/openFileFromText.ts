'use strict';

import * as vscode from 'vscode';
import {dirname} from 'path';
import {existsSync} from 'fs';


export class OpenFileFromText
{
	private m_currFile: vscode.Uri;

	public constructor(private editor: vscode.TextEditor)
	{
		if( editor.document &&
				editor.document.uri )
		{
			this.m_currFile = editor.document.uri;
		}
	}

	public onChangeEditor()
	{
		this.editor = vscode.window.activeTextEditor;
	}

	public execute()
	{
		let word = this.getWordRange(this.editor.selection);
		this.openDocument(word);
		console.log("Execute command", word);
	}

	public openDocument(iWord:string)
	{
		if( iWord === undefined || iWord === "" )
			return;
		if( existsSync(iWord) )
		{
			vscode.workspace.openTextDocument(iWord).then((iDoc) => {
				if( iDoc !== undefined )
				{
					vscode.window.showTextDocument(iDoc).then((iEditor) => {

					});
				}
			});
		}
	}

	public getWordRange(selection: vscode.Selection)
	{
		let line: string;
		let start: number = 0;
		if( this.editor.selection.isEmpty )
		{
			line = this.getCurrentLine(selection.active.line);
			start = selection.active.character;
		}
		else
		{
			line = this.getCurrentLine(selection.start.line);
			start = selection.start.character;
		}
		let end = line.length;
		let i = start;
		let j = start;
		for(; i>=0; i--)
		{
			let t = line[i];
			if( t.match(/[\s\"\'\>\<#]/) !== null )
			{
				i++;
				break;
			}
		}
		for(; j<end; j++)
		{
			let t = line[j];
			if( t.match(/[\s\"\'\>\<#]/) !== null )
				break;
		}
		return line.substring(i,j);
	}

	public getCurrentLine(iLine: number)
	{
		let raw = this.editor.document.getText();
		let end = raw.length;
		let start = 0;
		let tmp = "";
		let newLine = false;
		let txt: string[] = [];
		while(start<end)
		{
			if( raw[start] === '\n' || raw[start] === '\r' )
			{
				txt.push(tmp);
				if( txt.length > iLine )
					break;
				tmp = "";
				if( start+1 < end )
				{
					if( raw[start] === '\r' && raw[start+1] === '\n' )
						start++;
				}
			}
			else
			{
				tmp += raw[start];
			}
			start++;
		}
		if( txt && txt.length > iLine )
		{
			return txt[iLine];
		}
		return "";
	}
}