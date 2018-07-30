'use strict';

import * as vscode from 'vscode';
import { dirname, extname, join, isAbsolute, basename } from 'path';
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
			this.openDocument(word).then(path => {
				console.log("Execute command", word + ': Path found:', path);
			}).catch(error => {
				console.log("Execute command", word + ':', error);
			});
		}
	}

	// Input: [ [1, 2, 3], [101, 2, 1, 10], [2, 1] ]
	// Output: [1, 2, 3, 101, 10]
	public mergeDeduplicate(...valuesArrays) {
		return [...new Set([].concat(...valuesArrays))];
	}

	/**
	 * Resolve path from the text at cursor.
	 * @param inputPath text to deduce path from
	 * @return empty string if not found
	 */
	public resolvePath(inputPath: string): string {
		let debug = (...args) => {
			// console.debug(...args);		// un-comment this to debug
		};
		let currentDocFileName = this.editor ? this.editor.document.fileName : '';
		let basePath = dirname(currentDocFileName);

		// First, try relative to current document's folder, or absolute path, or relative to "~"
		let p = FileOperations.getAbsoluteFromRelativePath(inputPath, basePath, true);
		if (existsSync(p))
			return p;

		let isHomePath = inputPath[0] === "~";
		if (isHomePath || (isAbsolute(inputPath) && !inputPath.match(/^[/\\][^/\\]/))) // only relative path (or absolute path start with single slash/backslash, not C: drive) can continue to lookup from other folders
			return '';

		let finalConditionRe = new RegExp('^$|[/\\\\:][/\\\\]?$');
		let assumeExt = '';
		let assumeExtWithoutDot = '';
		if (extname(inputPath) === '') {
			// assume file extension follow current document's file extension, if any.  extname either start with "." or is empty
			assumeExt = extname(currentDocFileName);
			assumeExtWithoutDot = assumeExt.replace('.', '');	// remove leading dot (if have extension) from extname
		}
		let extensions = [assumeExtWithoutDot];
		if (assumeExt !== '') {	// lookup path has no extension
			extensions = this.mergeDeduplicate(extensions, ConfigHandler.Instance.Configuration.Extensions);
		}

		// Find which workspace folder current editing document is in.  only lookup parents folders if isWithinAWorkspaceFolder
		let isWithinAWorkspaceFolder = false;
		let currentWorkspaceFolderObj = null;
		let currentWorkspaceFolder = null;
		if (this.m_currFile && this.m_currFile.scheme === 'file') {
			currentWorkspaceFolderObj = vscode.workspace.getWorkspaceFolder(this.m_currFile);
			if (currentWorkspaceFolderObj) {
				isWithinAWorkspaceFolder = true;
				currentWorkspaceFolder = currentWorkspaceFolderObj.uri.fsPath;
			}
		}
		debug('Current workspace folder is', currentWorkspaceFolder);
		debug('Possible extensions are', extensions.join(','));

		// Lookup from current document's folder up to its corresponding workspace folder (if none match, just search current document's folder fuzzily)
		while (true) {
			debug('basePath is', basePath);
			for (let extension of extensions) {
				p = FileOperations.getAbsolutePathFromFuzzyPath(inputPath, basePath, extension, true);
				if (p != '') {
					return p;
				}
			}
			if (finalConditionRe.test(basePath) || !isWithinAWorkspaceFolder || join(basePath) === currentWorkspaceFolder) // break at workspace folder, or root path of system (finalConditionRe)
				break;
			basePath = dirname(basePath); // go up one folder level
		}

		debug('No more match folders to lookup');
		return '';
	}

	public openDocument(iWord: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			if (iWord === undefined || iWord === "")
				reject("Something went wrong");

			let fileAndLine = TextOperations.getPathAndLineNumber(iWord);
			let p = this.resolvePath(fileAndLine.file);
			if (p !== '') {
				vscode.workspace.openTextDocument(p).then((iDoc) => {
					if (iDoc !== undefined) {
						vscode.window.showTextDocument(iDoc).then((iEditor) => {
							if (fileAndLine.line !== -1) {
								let range = iEditor.document.lineAt(fileAndLine.line - 1).range;
								iEditor.selection = new vscode.Selection(range.start, range.end);
								iEditor.revealRange(range, vscode.TextEditorRevealType.InCenter);
								resolve(p + ":" + fileAndLine.line);
							} else {
								resolve(p);
							}
						});
					} else {
						reject("Something went wrong with openTextDocument"); // impossible?
					}
				}, (reason: Error) => {
					reject("Cannot open file: " + reason.message);
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