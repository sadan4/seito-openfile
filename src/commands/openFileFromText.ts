'use strict';

import * as vscode from 'vscode';
import { dirname } from 'path';
import { existsSync } from 'fs';
import { ConfigHandler } from '../configuration/confighandler';
import { TextOperations } from '../common/textoperations';
import { FileOperations } from '../common/fileoperations';


export class OpenFileFromText {
	private m_currFile: vscode.Uri;

	public constructor(private editor: vscode.TextEditor,
		private configHandler: ConfigHandler) {
		if (editor &&
			editor.document &&
			editor.document.uri) {
			this.m_currFile = editor.document.uri;
		}
	}

	public onChangeEditor() {
		this.editor = vscode.window.activeTextEditor;
	}

	public execute() {
		for (let i: number = 0; i < this.editor.selections.length; i++) {
			let word = this.getWordRange(this.editor.selections[i]);
			this.openDocument(word);
			console.log("Execute command", word);
		}
	}

	public openDocument(iWord: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			if (iWord === undefined || iWord === "")
				reject("Something went wrong");

			let fileAndLine = TextOperations.getPathAndLineNumber(iWord);
			let p = FileOperations.getAbsoluteFromRelativePath(fileAndLine.file, this.editor.document.fileName);
			if (!existsSync(p)) {
				let suffixes = ConfigHandler.Instance.Configuration.Suffixes;
				for (let suffix of suffixes) {
					p = FileOperations.getAbsolutePathFromFuzzyPath(fileAndLine.file, this.editor.document.fileName, suffix);
					if (p != "") {
						break;
					}
				}
			}

			if (existsSync(p)) {
				vscode.workspace.openTextDocument(p).then((iDoc) => {
					if (iDoc !== undefined) {
						vscode.window.showTextDocument(iDoc).then((iEditor) => {
							if (fileAndLine.line !== -1) {
								let range = iEditor.document.lineAt(fileAndLine.line - 1).range;
								iEditor.selection = new vscode.Selection(range.start, range.end);
								iEditor.revealRange(range, vscode.TextEditorRevealType.InCenter);
								resolve("");
							}
						});
					}
				});
			}
			else {
				reject("File not found");
			}
		});
	}

	public getWordRange(selection: vscode.Selection) {
		let line: string;
		let start: vscode.Position;
		if (this.editor.selection.isEmpty) {
			line = TextOperations.getCurrentLine(this.editor.document.getText(),
				selection.active.line);
			start = selection.active;
		}
		else {
			line = TextOperations.getCurrentLine(this.editor.document.getText(),
				selection.start.line);
			return TextOperations.getWordOfSelection(line, selection);
		}
		return TextOperations.getWordBetweenBounds(line, start, this.configHandler.Configuration.Bound);
	}

}