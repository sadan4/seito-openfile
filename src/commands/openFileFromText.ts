'use strict';

import * as vscode from "vscode";
import { dirname, extname, join, isAbsolute, basename } from 'path';
import { existsSync, lstatSync, readlinkSync, accessSync, constants } from 'fs';
import { ConfigHandler } from '../configuration/confighandler';
import { TextOperations } from '../common/textoperations';
import { FileOperations } from '../common/fileoperations';
import { isArray } from 'util';
import { Suffix } from "../types/suffix.type";
var glob = require('glob-all');
var trueCasePathSync = require('true-case-path');

export class OpenFileFromText {
	// private m_currFile: vscode.Uri;	// Just use this.editor.document.uri.  vscode.TextEditor's document will never be null.

	public constructor(private editor: vscode.TextEditor|undefined,
		private configHandler: ConfigHandler) {
		/* if (editor &&
			editor.document &&
			editor.document.uri) {
			this.m_currFile = editor.document.uri;
		} */
	}

	public onChangeEditor() {
		this.editor = vscode.window.activeTextEditor;
	}

	public trimPathSeparator(path : string) {
		return path.replace(/^[\/\\\\]+|[\/\\\\]+$/g, '');
	}

	public execute() {
		if( this.editor === undefined )
			return;
		let numSelections = this.editor.selections.length;
		let isOpeningMultipleFiles = numSelections > 1;	// if there are more than 1 file to open, open in new tab for all.
		for (let i: number = 0; i < numSelections; i++) {
			let words = this.getWordRanges(this.editor.selections[i]);
			if( words === undefined )
				continue;
			if (!isOpeningMultipleFiles && words.length > 1)
				isOpeningMultipleFiles = true;
			let openForceNewTab = isOpeningMultipleFiles || this.configHandler.Configuration.OpenNewTab;
			for (let word of words) {
				this.openDocument(word, openForceNewTab).then(path => {
					console.log("Execute command", word + ': Path found:', path);
				}).catch(error => {
					console.log("Execute command", word + ':', error);
					if (!isOpeningMultipleFiles && this.configHandler.Configuration.NotFoundTriggerQuickOpen) {
						// Note it is safe below to cut prefix '/' to make the absolute path relative, because if it is an absolute path and file exists, it should have opened directly.
						let newWord = this.rewritePathWithLeadingPathMapping(word.replace(/\\/g, '/'), !!word.match(/^[\/\\][^\/\\]/));
						vscode.commands.executeCommand(
							'workbench.action.quickOpen',
							this.trimPathSeparator(newWord !== null ? newWord : word) 	// trim / and \ from both ends of file string
						);
					}
				});
			}
		}
	}

	// Input: [ [1, 2, 3], [101, 2, 1, 10], [2, 1] ]
	// Output: [1, 2, 3, 101, 10]
	public mergeDeduplicate(...valuesArrays:any[]) {
		return [...new Set([].concat(...valuesArrays))];
	}

	public rewritePathWithLeadingPathMapping(inputPath: string, isSlashAbsolutePath : boolean) : string|null {
		let tempInputPathWithoutLeadingSlash = isSlashAbsolutePath ? inputPath.substr(1) : inputPath;	// for temporary match with leadingPaths only
		let leadingPathMapping = this.configHandler.Configuration.LeadingPathMapping;
		let leadingPaths = Object.keys(leadingPathMapping);
		let i = leadingPaths.length;
		for (; i-- > 0; ) {	    // need to loop backward
			let leadingPath = leadingPaths[i].replace(/\*\?$/, '*');	// allow leadingPathMapping = { "$*": "*", "$*?": "" } to work.  Since a key "$*" cannot appear twice.
			let isEndWithStar = leadingPath.endsWith('*');
			let isPrefix = tempInputPathWithoutLeadingSlash.startsWith(isEndWithStar ? leadingPath.substr(0, leadingPath.length - 1) : leadingPath);
			let isMatchedLeadingPath = false;
			let lengthOfMatch = leadingPath.length;
			let stringStarExpandTo : string = "";
			if (isPrefix) {
				if (isEndWithStar) {
					isMatchedLeadingPath = true;
					lengthOfMatch -= 1;	// decrement for the tailing '*'
					let i = lengthOfMatch;
					while (i < tempInputPathWithoutLeadingSlash.length && tempInputPathWithoutLeadingSlash[i] != '/') {
						++i;
					}
					stringStarExpandTo = tempInputPathWithoutLeadingSlash.substr(lengthOfMatch, i - lengthOfMatch);
					lengthOfMatch = i;
				} else {
					isMatchedLeadingPath = (tempInputPathWithoutLeadingSlash.length == lengthOfMatch || tempInputPathWithoutLeadingSlash[lengthOfMatch] == '/');
				}
			}
			if (isMatchedLeadingPath) {
				let mappedPath = this.trimPathSeparator(leadingPathMapping[leadingPaths[i]]);
				let remainPath = tempInputPathWithoutLeadingSlash.substr(lengthOfMatch);	// cut the match to leadingPath
				if (mappedPath == '')	// delete folder levels
					remainPath = this.trimPathSeparator(remainPath);
				else if (isEndWithStar)
					mappedPath = mappedPath.replace('*', stringStarExpandTo);	// expand a '*' if it exists.
				let newPath = (isSlashAbsolutePath ? '/' : '') + mappedPath + remainPath;		// remainPath must either be empty or start with '/', as checked above
				if (newPath !== '') {
					return newPath;		// improvement: if whole path is translated to empty string (may be deletion), such as "$variable" for leadingPathMapping = { "$*": "" }, it is better not accepted for this case to translated.  But continue the search.
				}
			}
		}
		return null;
	}

	/**
	 * Resolve path from the text at cursor.
	 * @param inputPath text to deduce path from
	 * @return empty string if not found
	 */
	public resolvePath(inputPath: string, iCurrentDocFileName?: string): string {
		let currentDocUri : vscode.Uri|null = this.editor ? this.editor.document.uri : null;
		if (iCurrentDocFileName !== undefined)
			currentDocUri = vscode.Uri.file(iCurrentDocFileName);
		let currentDocFileName = currentDocUri ? currentDocUri.fsPath : '';
		let basePath = dirname(currentDocFileName);

		// Normalize \ to / in the file string (\ not work for existsSync on linux-like), to support e.g. "use namespace\Class;" with path path/to/class/namespace/Class.php in PHP.
		inputPath = inputPath.replace(/\\/g, '/');
		let isAbsolutePath = isAbsolute(inputPath);
		let isSlashAbsolutePath = isAbsolutePath && inputPath.match(/^[\/\\][^\/\\]/);

		// translate path inputPath with "leadingPathMapping"
		let newPath = this.rewritePathWithLeadingPathMapping(inputPath, !!isSlashAbsolutePath);
		if (newPath !== null) {
			inputPath = newPath;
		}

		// First, try relative to current document's folder, or absolute path, or relative to "~"
		let p = FileOperations.getAbsoluteFromRelativePath(inputPath, basePath, true);
		if ( existsSync(p) && lstatSync(p).isFile() )
			return p;
		try{
			accessSync(p, constants.R_OK);
			if( lstatSync(p).isSymbolicLink() )
				return p;
		} catch(e) {
			;
		}

		let isHomePath = inputPath[0] === "~";
		let tryWorkspaceHomePath = false;
		if (isHomePath && this.configHandler.Configuration.LookupTildePathAlsoFromWorkspace)
			tryWorkspaceHomePath = true;
		if ( (isHomePath && !tryWorkspaceHomePath) ||
				(isAbsolutePath && !isSlashAbsolutePath) ) { // only relative path (or absolute path start with single slash/backslash, not C: drive) can continue to lookup from other folders
			return '';
		}

		let finalConditionRe = new RegExp('^$|[/\\\\:][/\\\\]?$');
		let assumeExt = '';
		let assumeExtWithoutDot: string = "";
		if (extname(inputPath) === '') {
			// assume file extension follow current document's file extension, if any.  extname either start with "." or is empty
			assumeExt = extname(currentDocFileName);
			assumeExtWithoutDot = assumeExt.replace('.', '');	// remove leading dot (if have extension) from extname
		}
		let extensions = [assumeExtWithoutDot];
		if (assumeExt !== '') {	// lookup path has no extension
			let extensionsMap: Suffix[] = this.configHandler.Configuration.ExtraExtensionsForTypes as Suffix[];
			let extraExtensions: string[] = [];
			let suffix = extensionsMap.find((va:Suffix) => va.name === assumeExtWithoutDot);
			if( suffix !== undefined )
				extraExtensions = [...suffix.suffixes];
			extensions = this.mergeDeduplicate(assumeExtWithoutDot, extraExtensions, this.configHandler.Configuration.Extensions);
		}

		// Find which workspace folder current editing document is in.  only lookup parents folders if isWithinAWorkspaceFolder
		let isWithinAWorkspaceFolder = false;
		let currentWorkspaceFolderObj: vscode.WorkspaceFolder|undefined;
		let currentWorkspaceFolder = null;
		if (currentDocUri && currentDocUri.scheme === 'file') {
			currentWorkspaceFolderObj = vscode.workspace.getWorkspaceFolder(currentDocUri);
			if (currentWorkspaceFolderObj !== undefined) {
				isWithinAWorkspaceFolder = true;
				currentWorkspaceFolder = currentWorkspaceFolderObj.uri.fsPath;
			}
		}
		// Try fuzzy for single leading slash/backslash absolute path
		if (isAbsolutePath || tryWorkspaceHomePath) {
			p = this.getAbsolutePathFromFuzzyPathWithMultipleExtensions(inputPath, basePath, extensions, true);
			if (p != '')
				return "";

			if (isAbsolutePath) {
				// From now on, treat even '/path/to/something' as relative path.  Thus, cut the leading slash/backslash
				if (inputPath.match(/^[\/\\]/)) {
					inputPath = inputPath.substr(1);
				}
			} else {
				inputPath = inputPath.replace(/^~[\/\\]/, '');
			}
		}

		// Lookup from current document's folder up to its corresponding workspace folder (if none match, just search current document's folder fuzzily)
		if (!tryWorkspaceHomePath) {
			while (true) {
				p = this.getAbsolutePathFromFuzzyPathWithMultipleExtensions(inputPath, basePath, extensions, true);
				if (p != '') {
					return p;
				}
				if (finalConditionRe.test(basePath) || !isWithinAWorkspaceFolder || join(basePath) === currentWorkspaceFolder) // break at workspace folder, or root path of system (finalConditionRe)
					break;
				basePath = dirname(basePath); // go up one folder level
			}
		}

		// Search workspace folders and some subfolders under them.  Not fuzzily, only default to current document's file extension if none (+ assumeExt).
		let workspaceFolders: vscode.WorkspaceFolder[] = [];
		if (isWithinAWorkspaceFolder && currentWorkspaceFolderObj !== undefined)
			workspaceFolders.push(currentWorkspaceFolderObj);
		workspaceFolders = this.mergeDeduplicate(workspaceFolders, vscode.workspace.workspaceFolders || []);
		for (let workspaceFolderObj of workspaceFolders) {
			let workspaceFolder = workspaceFolderObj.uri.fsPath;

			// Search a workspace folder
			if (workspaceFolder !== currentWorkspaceFolder || tryWorkspaceHomePath) {
				let p = FileOperations.getAbsoluteFromAlwaysRelativePath(inputPath, join(workspaceFolder), true);
				if (existsSync(p)) {
					return p;
				} else {
					p = FileOperations.getAbsoluteFromAlwaysRelativePath(inputPath + assumeExt, join(workspaceFolder), true);
					if (existsSync(p))
						return p;
				}
			}

			// Search some subfolders under the workspace folder
			// let workspaceSubFolders = ["lib", "src", "app", "class", "module", "inc", "vendor", "public"]; // "class*", "module*", "inc*"
			let subFoldersPattern = this.configHandler.Configuration.SearchSubFoldersOfWorkspaceFolders;
			let workspaceSubFolders = glob.sync(subFoldersPattern, { cwd: workspaceFolder });

			for (let folder of workspaceSubFolders) {
				let p = FileOperations.getAbsoluteFromAlwaysRelativePath(inputPath, join(workspaceFolder, folder), true);
				if (existsSync(p)) {
					return p;
				} else {
					p = FileOperations.getAbsoluteFromAlwaysRelativePath(inputPath + assumeExt, join(workspaceFolder, folder), true);
					if (existsSync(p))
						return p;
				}
			}
		}

		// Addition search paths
		let searchPaths = tryWorkspaceHomePath ? [] : this.configHandler.Configuration.SearchPaths;
		for (let folder of searchPaths) {
			let p = FileOperations.getAbsoluteFromAlwaysRelativePath(inputPath, join(folder), true);
			if (existsSync(p) && lstatSync(p).isFile()) {
				return p;
			} else {
				p = FileOperations.getAbsoluteFromAlwaysRelativePath(inputPath + assumeExt, join(folder), true);
				if (existsSync(p) && lstatSync(p).isFile())
					return p;
			}
		}
		return '';
	}

	public openDocument(iWord: string, iForceNewTab: boolean = false): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			if (iWord === undefined || iWord === "")
				reject("Path is empty");

			let fileAndLine = TextOperations.getPathAndPosition(iWord);
			let p = this.resolvePath(fileAndLine.file);
			if (p !== '') {
				p = trueCasePathSync(p); // Avoid open document as non-matching case.  E.g. input text is "Extension.js" but real file name is extension.js, without this code, file opened and shown as "Extension.js" on Windows because file name are case insensitive.
				vscode.workspace.openTextDocument(p).then((iDoc) => {
					if (iDoc !== undefined) {
						let showOptions = {"preview": false, "selection": new vscode.Selection(0,0,0,0)};
						if (iForceNewTab)
							showOptions['preview'] = false;
						let targetSelection = new vscode.Selection(0, 0, 0, 0);
						if (fileAndLine.line > 0) {
							let pos = new vscode.Position(fileAndLine.line - 1, fileAndLine.column > 0 ? fileAndLine.column - 1 : 0);
							targetSelection = new vscode.Selection(pos, pos);
							if (fileAndLine.column < 0) {
								// Optional: this preserve old plug-in's behavior that whole line is selected
								let range = iDoc.lineAt(fileAndLine.line - 1).range;
								targetSelection = new vscode.Selection(range.start, range.end);
							}
							showOptions['selection'] = targetSelection;
						}
						vscode.window.showTextDocument(iDoc, showOptions).then((iEditor) => {
							if (fileAndLine.line > 0) {
								// Commented.  Let showOptions['selection'] do the following.
								/* if (fileAndLine.line <= iDoc.lineCount) {
									iEditor.selection = targetSelection;
									iEditor.revealRange(targetSelection, vscode.TextEditorRevealType.InCenter);
								} */
								resolve(p + ":" + fileAndLine.line + (fileAndLine.column > 0 ? ":" + fileAndLine.column : ""));
							} else {
								resolve(p);
							}
						}, (reason: Error) => {
							reject("Something went wrong with showTextDocument: " + reason.message);
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

	public getAbsolutePathFromFuzzyPathWithMultipleExtensions(iPath:string, iCurrPath:string, iSuffixes: string[], baseMustBeDir = false): string {
		let p;
		for (let extension of iSuffixes) {
			p = FileOperations.getAbsolutePathFromFuzzyPath(iPath, iCurrPath, extension, baseMustBeDir);
			if (p != '') {
				return p;
			}
		}
		return '';
	}

	public getWordRanges(selection: vscode.Selection, iDocument?: vscode.TextDocument) {
		let line: string;
		let start: vscode.Position;
		let document = iDocument !== undefined ? iDocument : this.editor?.document;
		if( document === undefined )
			return;

		if (selection.isEmpty) {
			line = document.lineAt(selection.active.line).text;
			start = selection.active;
			return [TextOperations.getWordBetweenBounds(line, start, this.configHandler.Configuration.Bound)];
		}
		else {
			let multiLinesText = document.getText(selection);
			let lines = multiLinesText.split(/\r\n?|\n/);
			if (lines.length > 1 && lines[lines.length - 1] === '') {	// pop last extra empty line after the last newline char
				lines.pop();
			}
			lines = lines.map(line => line.replace(/((:\d+){1,2}):.*/, '$1'));	// remove ":..." from ":line[:column]:..."
			return lines;
		}
	}

}