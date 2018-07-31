'use strict';

import * as vscode from 'vscode';
import { dirname, extname, join, isAbsolute, basename } from 'path';
import { existsSync } from 'fs';
import { ConfigHandler } from '../configuration/confighandler';
import { TextOperations } from '../common/textoperations';
import { FileOperations } from '../common/fileoperations';
import { isArray } from 'util';
var glob = require('glob-all');
var trueCasePathSync = require('true-case-path');


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
		let isAbsolutePath = isAbsolute(inputPath);
		if (isHomePath || (isAbsolutePath && !inputPath.match(/^[\/\\][^\/\\]/))) // only relative path (or absolute path start with single slash/backslash, not C: drive) can continue to lookup from other folders
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
			let extensionsMap = this.configHandler.Configuration.ExtraExtensionsForTypes;
			debug(extensionsMap, assumeExtWithoutDot, extensionsMap[assumeExtWithoutDot], isArray(extensionsMap[assumeExtWithoutDot]));
			let extraExtensions = [];
			if (assumeExtWithoutDot in extensionsMap && isArray(extensionsMap[assumeExtWithoutDot]))
				extraExtensions = [...extensionsMap[assumeExtWithoutDot]];
			extensions = this.mergeDeduplicate(extensions, extraExtensions, ConfigHandler.Instance.Configuration.Extensions);
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
		debug('Implicit extensions are', extensions.join(','));

		// Try fuzzy for single leading slash/backslash absolute path
		if (isAbsolutePath) {
			p = this.getAbsolutePathFromFuzzyPathWithMultipleExtensions(inputPath, basePath, extensions, true);
			if (p != '')
				return;

			// From now on, treat even '/path/to/something' as relative path.  Thus, cut the leading slash/backslash
			if (inputPath.match(/^[\/\\]/)) {
				inputPath = inputPath.substr(1);
			}
		}

		// Lookup from current document's folder up to its corresponding workspace folder (if none match, just search current document's folder fuzzily)
		while (true) {
			debug('basePath is', basePath);
			p = this.getAbsolutePathFromFuzzyPathWithMultipleExtensions(inputPath, basePath, extensions, true);
			if (p != '') {
				return p;
			}
			if (finalConditionRe.test(basePath) || !isWithinAWorkspaceFolder || join(basePath) === currentWorkspaceFolder) // break at workspace folder, or root path of system (finalConditionRe)
				break;
			basePath = dirname(basePath); // go up one folder level
		}

		// Search workspace folders and some subfolders under them.  Not fuzzily, only default to current document's file extension if none (+ assumeExt).
		let workspaceFolders = [];
		if (isWithinAWorkspaceFolder)
			workspaceFolders.push(currentWorkspaceFolderObj);
		workspaceFolders = this.mergeDeduplicate(vscode.workspace.workspaceFolders);
		for (let workspaceFolderObj of workspaceFolders) {
			let workspaceFolder = workspaceFolderObj.uri.fsPath;

			// Search a workspace folder
			if (workspaceFolder !== currentWorkspaceFolder) {
				debug('Search workspaceFolder', workspaceFolder);
				let p = FileOperations.getAbsoluteFromAlwaysRelativePath(inputPath + assumeExt, join(workspaceFolder), true);
				if (existsSync(p))
					return p;
			}

			// Search some subfolders under the workspace folder
			// let workspaceSubFolders = ["lib", "src", "app", "class", "module", "inc", "vendor", "public"]; // "class*", "module*", "inc*"
			let subFoldersPattern = this.configHandler.Configuration.SearchSubFoldersOfWorkspaceFolders; // default: "@(lib*|src|app|class*|module*|inc*|vendor?(s)|public)";
			let workspaceSubFolders = glob.sync(subFoldersPattern, { cwd: workspaceFolder });

			debug('Searching sub-folders of workspaceFolder', workspaceFolder, 'are', workspaceSubFolders.join(','));
			for (let folder of workspaceSubFolders) {
				debug('workspaceFolder/folder is', join(workspaceFolder, folder));
				let p = FileOperations.getAbsoluteFromAlwaysRelativePath(inputPath + assumeExt, join(workspaceFolder, folder), true);
				if (existsSync(p))
					return p;
			}
		}

		// Addition search paths
		let searchPaths = this.configHandler.Configuration.SearchPaths;
		for (let folder of searchPaths) {
			debug('searchPath is', join(folder));
			let p = FileOperations.getAbsoluteFromAlwaysRelativePath(inputPath + assumeExt, join(folder), true);
			if (existsSync(p))
				return p;
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
				p = trueCasePathSync(p); // Avoid open document as non-matching case.  E.g. input text is "Extension.js" but real file name is extension.js, without this code, file opened and shown as "Extension.js" on Windows because file name are case insensitive.
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

	public getAbsolutePathFromFuzzyPathWithMultipleExtensions(iPath:string, iCurrPath:string, iSuffixes, baseMustBeDir = false): string {
		let p;
		for (let extension of iSuffixes) {
			p = FileOperations.getAbsolutePathFromFuzzyPath(iPath, iCurrPath, extension, baseMustBeDir);
			if (p != '') {
				return p;
			}
		}
		return '';
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