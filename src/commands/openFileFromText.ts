'use strict';

import * as vscode from 'vscode';
import {dirname} from 'path';
import {existsSync} from 'fs';
import {ConfigHandler} from '../configuration/confighandler';
import {TextOperations} from '../common/textoperations';
import {FileOperations} from '../common/fileoperations';


export class OpenFileFromText
{
	private m_currFile: vscode.Uri;

	public constructor(private editor: vscode.TextEditor,
										 private configHandler: ConfigHandler)
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

		let p = FileOperations.getAbsoluteFromRelativePath(iWord, this.editor.document.fileName);

		if( existsSync(p) )
		{
			vscode.workspace.openTextDocument(p).then((iDoc) => {
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
		let start: vscode.Position;
		if( this.editor.selection.isEmpty )
		{
			line = TextOperations.getCurrentLine(this.editor.document.getText(),
																					 selection.active.line);
			start = selection.active;
		}
		else
		{
			line = TextOperations.getCurrentLine(this.editor.document.getText(),
																					 selection.start.line);
			start = selection.start;
		}
		return TextOperations.getWordBetweenBounds(line, start, this.configHandler.Configuration.Bound);
	}

}