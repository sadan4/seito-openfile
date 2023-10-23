'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {ConfigHandler} from './configuration/confighandler';
import {OpenFileFromText} from './commands/openFileFromText';
import {OpenFileLikeThisFile} from './commands/openFileLikeThisFile';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {

    vscode.commands.executeCommand("setContext", "seito-openfile:enabled", true);

    console.log("seito-openfile extension started");
    const configHandler: ConfigHandler = ConfigHandler.Instance;
    const openFile: OpenFileFromText = new OpenFileFromText(
        vscode.window.activeTextEditor, configHandler);

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(openFile.onChangeEditor, openFile)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('seito-openfile.openFileFromText', openFile.execute, openFile)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('seito-openfile.openFileExternFromText', openFile.executeExtern, openFile)
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('seito-openfile.openFileLikeThisFile', OpenFileLikeThisFile.execute, OpenFileLikeThisFile)
    );
}

// this method is called when your extension is deactivated
export function deactivate(): void {
}