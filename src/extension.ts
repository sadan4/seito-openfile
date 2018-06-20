'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {ConfigHandler} from './configuration/confighandler';
import {OpenFileFromText} from './commands/openFileFromText';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    vscode.commands.executeCommand("setContext", "seito-openfile:enabled", true);

    console.log("seito-openfile extension started");
    let configHandler: ConfigHandler = ConfigHandler.Instance;
    let openFile: OpenFileFromText = new OpenFileFromText(
        vscode.window.activeTextEditor, configHandler);

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(openFile.onChangeEditor, openFile)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('seito-openfile.openFileFromText', openFile.execute, openFile)
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}