import * as vscode from "vscode";
import { dirname, extname, join, isAbsolute } from "path";
import { existsSync, lstatSync, accessSync, constants, statSync } from "fs";
import { type ConfigHandler } from "../configuration/confighandler";
import { TextOperations } from "../common/textoperations";
import { FileOperations } from "../common/fileoperations";
import { type Suffix } from "../types/suffix.type";
import { exec } from "child_process";
import { globSync } from "glob";
// var glob = require('glob-all')
import { trueCasePathSync } from "true-case-path";

export class OpenFileFromText {
  // private m_currFile: vscode.Uri;
  // Just use this.editor.document.uri.  vscode.TextEditor's document will never be null.

  public constructor(
    private editor: vscode.TextEditor | undefined,
    private readonly configHandler: ConfigHandler
  ) {
    /* if (editor &&
            editor.document &&
            editor.document.uri) {
            this.m_currFile = editor.document.uri;
        } */
  }

  public onChangeEditor(): void {
    this.editor = vscode.window.activeTextEditor;
  }

  public trimPathSeparator(path: string): string {
    return path.replace(/^[/\\\\]+|[/\\\\]+$/g, "");
  }

  public execute(): void {
    if (this.editor === undefined) {
      return;
    }
    const numSelections = this.editor.selections.length;
    let isOpeningMultipleFiles = numSelections > 1; // if there are more than 1 file to open, open in new tab for all.
    for (let i: number = 0; i < numSelections; i++) {
      const words = this.getWordRanges(this.editor.selections[i]);
      if (words === undefined) {
        continue;
      }
      if (!isOpeningMultipleFiles && words.length > 1) {
        isOpeningMultipleFiles = true;
      }
      const openForceNewTab =
        isOpeningMultipleFiles || this.configHandler.Configuration.OpenNewTab;
      for (const word of words) {
        this.openDocument(word, openForceNewTab)
          .then((path) => {
            console.log("Execute command", word + ": Path found:", path);
          })
          .catch((error) => {
            console.log("Execute command", word + ":", error);
            if (
              !isOpeningMultipleFiles &&
              this.configHandler.Configuration.NotFoundTriggerQuickOpen
            ) {
              // Note it is safe below to cut prefix '/' to make the absolute path relative, because if it is an absolute path and file exists, it should have opened directly.
              const newWord = this.rewritePathWithLeadingPathMapping(
                word.replace(/\\/g, "/"),
                word.match(/^[/\\][^/\\]/) !== null
              );
              vscode.commands.executeCommand(
                "workbench.action.quickOpen",
                this.trimPathSeparator(newWord ?? word) // trim / and \ from both ends of file string
              );
            }
          });
      }
    }
  }

  public executeExtern(): void {
    if (this.editor === undefined) {
      return;
    }
    const numSelections = this.editor.selections.length;
    let isOpeningMultipleFiles = numSelections > 1; // if there are more than 1 file to open, open in new tab for all.
    for (let i: number = 0; i < numSelections; i++) {
      const words = this.getWordRanges(this.editor.selections[i]);
      if (words === undefined) {
        continue;
      }
      if (!isOpeningMultipleFiles && words.length > 1) {
        isOpeningMultipleFiles = true;
      }
      for (const word of words) {
        this.openDocumentExternal(word);
      }
    }
  }

  // Input: [ [1, 2, 3], [101, 2, 1, 10], [2, 1] ]
  // Output: [1, 2, 3, 101, 10]
  public mergeDeduplicate(...valuesArrays: any[]): any[] {
    return [...new Set([].concat(...valuesArrays))];
  }

  public rewritePathWithLeadingPathMapping(
    inputPath: string,
    isSlashAbsolutePath: boolean
  ): string | null {
    const tempInputPathWithoutLeadingSlash = isSlashAbsolutePath
      ? inputPath.substr(1)
      : inputPath; // for temporary match with leadingPaths only
    const leadingPathMapping =
      this.configHandler.Configuration.LeadingPathMapping;
    const leadingPaths = Object.keys(leadingPathMapping);
    let i = leadingPaths.length;
    for (; i-- > 0; ) {
      // need to loop backward
      const leadingPath = leadingPaths[i].replace(/\*\?$/, "*"); // allow leadingPathMapping = { "$*": "*", "$*?": "" } to work.  Since a key "$*" cannot appear twice.
      const isEndWithStar = leadingPath.endsWith("*");
      const isPrefix = tempInputPathWithoutLeadingSlash.startsWith(
        isEndWithStar
          ? leadingPath.substr(0, leadingPath.length - 1)
          : leadingPath
      );
      let isMatchedLeadingPath = false;
      let lengthOfMatch = leadingPath.length;
      let stringStarExpandTo: string = "";
      if (isPrefix) {
        if (isEndWithStar) {
          isMatchedLeadingPath = true;
          lengthOfMatch -= 1; // decrement for the tailing '*'
          let i = lengthOfMatch;
          while (
            i < tempInputPathWithoutLeadingSlash.length &&
            tempInputPathWithoutLeadingSlash[i] !== "/"
          ) {
            ++i;
          }
          stringStarExpandTo = tempInputPathWithoutLeadingSlash.substr(
            lengthOfMatch,
            i - lengthOfMatch
          );
          lengthOfMatch = i;
        } else {
          isMatchedLeadingPath =
            tempInputPathWithoutLeadingSlash.length === lengthOfMatch ||
            tempInputPathWithoutLeadingSlash[lengthOfMatch] === "/";
        }
      }
      if (isMatchedLeadingPath) {
        let mappedPath = this.trimPathSeparator(
          leadingPathMapping[leadingPaths[i]]
        );
        let remainPath = tempInputPathWithoutLeadingSlash.substr(lengthOfMatch); // cut the match to leadingPath
        if (mappedPath === "") {
          // delete folder levels
          remainPath = this.trimPathSeparator(remainPath);
        } else if (isEndWithStar) {
          mappedPath = mappedPath.replace("*", stringStarExpandTo); // expand a '*' if it exists.
        }
        const newPath =
          (isSlashAbsolutePath ? "/" : "") + mappedPath + remainPath; // remainPath must either be empty or start with '/', as checked above
        if (newPath !== "") {
          return newPath; // improvement: if whole path is translated to empty string (may be deletion), such as "$variable" for leadingPathMapping = { "$*": "" }, it is better not accepted for this case to translated.  But continue the search.
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
    inputPath = this.resolveEnvironmentVariableInPath(inputPath);

    let currentDocUri: vscode.Uri | undefined = this.editor?.document.uri;
    if (iCurrentDocFileName !== undefined) {
      currentDocUri = vscode.Uri.file(iCurrentDocFileName);
    }
    const currentDocFileName =
      currentDocUri !== undefined ? currentDocUri.fsPath : "";
    let basePath = dirname(currentDocFileName);

    // Normalize \ to / in the file string (\ not work for existsSync on linux-like), to support e.g. "use namespace\Class;" with path path/to/class/namespace/Class.php in PHP.
    inputPath = inputPath.replace(/\\/g, "/");
    // in case of spaces in file path, mask them with back
    // inputPath = inputPath.replace(/[\s]+/g, "\\ ");

    const isAbsolutePath = isAbsolute(inputPath);
    const isSlashAbsolutePath =
      isAbsolutePath && inputPath.match(/^[/\\][^/\\]/) !== null;

    // translate path inputPath with "leadingPathMapping"
    const newPath = this.rewritePathWithLeadingPathMapping(
      inputPath,
      isSlashAbsolutePath
    );
    if (newPath !== null) {
      inputPath = newPath;
    }

    // First, try relative to current document's folder, or absolute path, or relative to "~"
    let p = FileOperations.getAbsoluteFromRelativePath(
      inputPath,
      basePath,
      true
    );
    const prefOpenFile = this.configHandler.Configuration.PreferOpenFile;
    if (
      existsSync(p) &&
      (lstatSync(p).isFile() || (!prefOpenFile && lstatSync(p).isDirectory()))
    ) {
      return p;
    }
    try {
      accessSync(p, constants.R_OK);
      if (lstatSync(p).isSymbolicLink()) {
        return p;
      }
    } catch (e) {}

    const isHomePath = inputPath[0] === "~";
    let tryWorkspaceHomePath = false;
    if (
      isHomePath &&
      this.configHandler.Configuration.LookupTildePathAlsoFromWorkspace
    ) {
      tryWorkspaceHomePath = true;
    }
    if (
      (isHomePath && !tryWorkspaceHomePath) ||
      (isAbsolutePath && !isSlashAbsolutePath)
    ) {
      // only relative path (or absolute path start with single slash/backslash, not C: drive) can continue to lookup from other folders
      return "";
    }

    const finalConditionRe = /^$|[/\\\\:][/\\\\]?$/;
    let assumeExt = "";
    let assumeExtWithoutDot: string = "";
    if (extname(inputPath) === "") {
      // assume file extension follow current document's file extension, if any.  extname either start with "." or is empty
      assumeExt = extname(currentDocFileName);
      assumeExtWithoutDot = assumeExt.replace(".", ""); // remove leading dot (if have extension) from extname
    }
    let extensions = [assumeExtWithoutDot];
    if (assumeExt !== "") {
      // lookup path has no extension
      const extensionsMap: Suffix[] = this.configHandler.Configuration
        .ExtraExtensionsForTypes as Suffix[];
      let extraExtensions: string[] = [];
      const suffix = extensionsMap.find(
        (va: Suffix) => va.name === assumeExtWithoutDot
      );
      if (suffix !== undefined) {
        extraExtensions = [...suffix.suffixes];
      }
      extensions = this.mergeDeduplicate(
        assumeExtWithoutDot,
        extraExtensions,
        this.configHandler.Configuration.Extensions
      );
    }

    // Find which workspace folder current editing document is in.  only lookup parents folders if isWithinAWorkspaceFolder
    let isWithinAWorkspaceFolder = false;
    let currentWorkspaceFolderObj: vscode.WorkspaceFolder | undefined;
    let currentWorkspaceFolder = null;
    if (currentDocUri !== undefined && currentDocUri.scheme === "file") {
      currentWorkspaceFolderObj =
        vscode.workspace.getWorkspaceFolder(currentDocUri);
      if (currentWorkspaceFolderObj !== undefined) {
        isWithinAWorkspaceFolder = true;
        currentWorkspaceFolder = currentWorkspaceFolderObj.uri.fsPath;
      }
    }
    // Try fuzzy for single leading slash/backslash absolute path
    if (isAbsolutePath || tryWorkspaceHomePath) {
      p = this.getAbsolutePathFromFuzzyPathWithMultipleExtensions(
        inputPath,
        basePath,
        extensions,
        true
      );
      if (p !== "") {
        return p;
      }

      if (isAbsolutePath) {
        // From now on, treat even '/path/to/something' as relative path.  Thus, cut the leading slash/backslash
        if (inputPath.match(/^[/\\]/) !== null) {
          inputPath = inputPath.substring(1);
        }
      } else {
        inputPath = inputPath.replace(/^~[/\\]/, "");
      }
    }

    // Lookup from current document's folder up to its corresponding workspace folder (if none match, just search current document's folder fuzzily)
    if (!tryWorkspaceHomePath) {
      while (true) {
        p = this.getAbsolutePathFromFuzzyPathWithMultipleExtensions(
          inputPath,
          basePath,
          extensions,
          true
        );
        if (p !== "") {
          return p;
        } else {
          // no file found, path exists within the workspace, so open it
          const _p = join(basePath,inputPath);
          if( existsSync(_p) && lstatSync(_p).isDirectory() ) {
            return _p;
          }
        }
        if (
          finalConditionRe.test(basePath) ||
          !isWithinAWorkspaceFolder ||
          join(basePath) === currentWorkspaceFolder
        ) {
          // break at workspace folder, or root path of system (finalConditionRe)
          break;
        }
        basePath = dirname(basePath); // go up one folder level
      }
    }

    // Search workspace folders and some subfolders under them.  Not fuzzily, only default to current document's file extension if none (+ assumeExt).
    let workspaceFolders: vscode.WorkspaceFolder[] = [];
    if (isWithinAWorkspaceFolder && currentWorkspaceFolderObj !== undefined) {
      workspaceFolders.push(currentWorkspaceFolderObj);
    }
    workspaceFolders = this.mergeDeduplicate(
      workspaceFolders,
      vscode.workspace.workspaceFolders ?? []
    );
    for (const workspaceFolderObj of workspaceFolders) {
      const workspaceFolder = workspaceFolderObj.uri.fsPath;

      // Search a workspace folder
      if (workspaceFolder !== currentWorkspaceFolder || tryWorkspaceHomePath) {
        let p = FileOperations.getAbsoluteFromAlwaysRelativePath(
          inputPath,
          join(workspaceFolder),
          true
        );
        if (existsSync(p)) {
          return p;
        } else {
          p = FileOperations.getAbsoluteFromAlwaysRelativePath(
            inputPath + assumeExt,
            join(workspaceFolder),
            true
          );
          if (existsSync(p)) {
            return p;
          }
        }
      }

      // Search some subfolders under the workspace folder
      // let workspaceSubFolders = ["lib", "src", "app", "class", "module", "inc", "vendor", "public"]; // "class*", "module*", "inc*"
      const subFoldersPattern =
        this.configHandler.Configuration.SearchSubFoldersOfWorkspaceFolders;
      const workspaceSubFolders = globSync(subFoldersPattern, {
        cwd: workspaceFolder,
      });

      for (const folder of workspaceSubFolders) {
        let p = FileOperations.getAbsoluteFromAlwaysRelativePath(
          inputPath,
          join(workspaceFolder, folder),
          true
        );
        if (existsSync(p)) {
          return p;
        } else {
          p = FileOperations.getAbsoluteFromAlwaysRelativePath(
            inputPath + assumeExt,
            join(workspaceFolder, folder),
            true
          );
          if (existsSync(p)) {
            return p;
          }
        }
      }
    }

    // Addition search paths
    const searchPaths = tryWorkspaceHomePath
      ? []
      : this.configHandler.Configuration.SearchPaths;
    for (const folder of searchPaths) {
      const p = FileOperations.getAbsoluteFromAlwaysRelativePath(
        inputPath,
        join(folder),
        true
      );
      if (existsSync(p) && lstatSync(p).isFile()) {
        return p;
      } else {
        const pNew = FileOperations.getAbsoluteFromAlwaysRelativePath(
          inputPath + assumeExt,
          join(folder),
          true
        );
        if (existsSync(pNew) && lstatSync(pNew).isFile()) {
          return pNew;
        }
        if (existsSync(p) && lstatSync(p).isDirectory()) {
          return p;
        }
      }
    }
    return "";
  }

  public async openDocument(
    iWord: string,
    iForceNewTab: boolean = false
  ): Promise<string> {
    if (iWord === undefined || iWord === "") {
      throw new Error("Path is empty");
    }

    const fileAndLine = TextOperations.getPathAndPosition(iWord);
    let p = this.resolvePath(fileAndLine.file);
    if (this.checkIfPathIsFolder(p)) {
      this.executeAsExternalCmd(p);
      return await Promise.resolve(p);
    }
    if (p !== "") {
      p = trueCasePathSync(p); // Avoid open document as non-matching case.  E.g. input text is "Extension.js" but real file name is extension.js, without this code, file opened and shown as "Extension.js" on Windows because file name are case insensitive.
      try {
        const openDoc = await vscode.workspace.openTextDocument(p);

        const showOptions = {
          preview: false,
          selection: new vscode.Selection(0, 0, 0, 0),
        };
        if (iForceNewTab) {
          showOptions.preview = false;
        }
        let targetSelection = new vscode.Selection(0, 0, 0, 0);
        let realCharPos = 0;
        if (fileAndLine.line > 0) {
          // iterate to position in line, check for unicode to get to the right position
          if (fileAndLine.column > 0) {
            const _l = openDoc.lineAt(fileAndLine.line - 1).text;
            for (let i = 0; i < fileAndLine.column; i++) {
              const _sub = _l.substring(realCharPos, realCharPos + 2);
              let _res: boolean | number = false;
              try {
                _res =
                  TextOperations.fixedCharCodeAt(_sub, 0) !== false &&
                  TextOperations.fixedCharCodeAt(_sub, 1) === false;
              } catch (error) {
                _res = false;
              }
              if (_res) {
                realCharPos += 2;
              } else {
                realCharPos += 1;
              }
            }
          }
          const pos = new vscode.Position(
            fileAndLine.line - 1,
            realCharPos > 0 ? realCharPos - 1 : 0
          );
          targetSelection = new vscode.Selection(pos, pos);
          if (fileAndLine.column < 0) {
            // Optional: this preserve old plug-in's behavior that whole line is selected
            const range = openDoc.lineAt(fileAndLine.line - 1).range;
            targetSelection = new vscode.Selection(range.start, range.end);
          }
          showOptions.selection = targetSelection;
        }
        try {
          await vscode.window.showTextDocument(openDoc, showOptions);
          if (fileAndLine.line > 0) {
            // Commented.  Let showOptions['selection'] do the following.
            /* if (fileAndLine.line <= iDoc.lineCount) {
                                iEditor.selection = targetSelection;
                                iEditor.revealRange(targetSelection, vscode.TextEditorRevealType.InCenter);
                            } */
            return await Promise.resolve(
              `${p}:${fileAndLine.line}` +
                (fileAndLine.column > 0 ? ":" + fileAndLine.column : "")
            );
          } else {
            return await Promise.resolve(p);
          }
        } catch (e: any) {
          throw new Error(
            `Something went wrong with showTextDocument: ${e.message}`
          );
        }
      } catch (e: any) {
        throw new Error(`Something went wrong with openDocument: ${e.message}`);
      }
    } else {
      throw new Error("File not found");
    }
  }

  public async openDocumentExternal(iWord: string): Promise<string | boolean> {
    if (iWord === undefined || iWord === "") {
      throw new Error("Path is empty");
    }

    const fileAndLine = TextOperations.getPathAndPosition(iWord);
    const p = this.resolvePath(fileAndLine.file);
    this.executeAsExternalCmd(p);
    return await Promise.resolve(true);
  }

  private executeAsExternalCmd(p: string): void {
    if (p !== "") {
      switch (process.platform) {
        case "win32":
          exec(`start ${p}`);
          break;
        case "darwin":
          p = p.replace(/(\s+)/g, "\\$1");
          exec(`open ${p}`);
          break;
        default:
          p = p.replace(/(\s+)/g, "\\$1");
          exec(
            `${this.configHandler.Configuration.DefaultLinuxOpenCommand} ${p}`
          );
      }
    }
  }

  public getAbsolutePathFromFuzzyPathWithMultipleExtensions(
    iPath: string,
    iCurrPath: string,
    iSuffixes: string[],
    baseMustBeDir = false
  ): string {
    let p;
    for (const extension of iSuffixes) {
      p = FileOperations.getAbsolutePathFromFuzzyPath(
        iPath,
        iCurrPath,
        extension,
        baseMustBeDir
      );
      if (p !== "") {
        return p;
      }
    }
    return "";
  }

  public getWordRanges(
    selection: vscode.Selection,
    iDocument?: vscode.TextDocument
  ): string[] | undefined {
    let line: string;
    let start: vscode.Position;
    const document = iDocument ?? this.editor?.document;
    if (document === undefined) {
      return;
    }

    if (selection.isEmpty) {
      line = document.lineAt(selection.active.line).text;
      start = selection.active;
      return [
        TextOperations.getWordBetweenBounds(
          line,
          start,
          this.configHandler.Configuration.Bound
        ),
      ];
    } else {
      const multiLinesText = document.getText(selection);
      let lines = multiLinesText.split(/\r\n?|\n/);
      if (lines.length > 1 && lines[lines.length - 1] === "") {
        // pop last extra empty line after the last newline char
        lines.pop();
      }
      lines = lines.map((line) => line.replace(/((:\d+){1,2}):.*/, "$1")); // remove ":..." from ":line[:column]:..."
      return lines;
    }
  }

  public resolveEnvironmentVariableInPath(inputPath: string): string {
    let newPath = inputPath;
    // find environment variable
    // const matches = newPath.matchAll(/(\$|\$\{|%)([a-z0-9_]+)([%}]?)/gi);
    const matches = newPath.matchAll(/(\$([a-z0-9_]+)|\${([a-z0-9_]+)\}|%([a-z0-9_]+)%)/gi);
    for (const match of matches) {
      // match string
      let envVarName;
      // three possible matching groups
      let i=3;
      while(i>0) {
        if( envVarName === undefined ) {
          envVarName = match[5-i];
          i--;
        } else {
          break;
        }
      }
      if( envVarName !== undefined ) {
        const m = process.env[envVarName];
        if (m !== undefined) {
          newPath = newPath.replace(`${match[1]}`, m);
       }
      }
    }
    return newPath;
  }

  public checkIfPathIsFolder(inputPath: string): boolean {
    if (inputPath !== undefined && inputPath !== "") {
      try {
        const fsStats = statSync(inputPath);
        return fsStats.isDirectory();
      } catch (error) {
        return false;
      }
    }
    return false;
  }
}
