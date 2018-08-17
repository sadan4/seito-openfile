'use strict';

import * as vscode from 'vscode';
import { parse, join } from 'path';


/**
 * May just keep the logic simple (relative path, cut extension). For advanced similar feature, there is already
 * an VSCode extension like "Quick Open Related Files".
 */
export class OpenFileLikeThisFile {
    public static execute() {
        let editor = vscode.window.activeTextEditor;
        if (!(editor &&
                editor.document &&
                editor.document.uri)) {
            return;
        }
        let uri = editor.document.uri;
        let path = parse(vscode.workspace.asRelativePath(uri.fsPath, false));

        vscode.commands.executeCommand(
            'workbench.action.quickOpen',
            join(path.dir, path.name)  // only cut file extension
        );
    }
};