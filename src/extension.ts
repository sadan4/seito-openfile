"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ConfigHandler } from "./configuration/confighandler";
import { OpenFileFromText } from "./commands/openFileFromText";
import { OpenFileLikeThisFile } from "./commands/openFileLikeThisFile";
import { IDisposable } from "./model";
import { commands, Disposable, ExtensionContext, window } from "vscode";

const mDisposables: IDisposable[] = [];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext): void {
  commands.executeCommand("setContext", "seito-openfile:enabled", true);

  console.log("seito-openfile extension started");
  const configHandler: ConfigHandler = new ConfigHandler();
  const openFile: OpenFileFromText = new OpenFileFromText(window.activeTextEditor, configHandler);

  mDisposables.push(
    window.onDidChangeActiveTextEditor((event) => {
      openFile.onChangeEditor(event);
    })
  );
  mDisposables.push(
    commands.registerCommand("seito-openfile.openFileFromText", () => {
      openFile.execute();
    })
  );
  mDisposables.push(
    commands.registerCommand("seito-openfile.openFileExternFromText", () => {
      openFile.executeExtern();
    })
  );
  mDisposables.push(
    commands.registerCommand("seito-openfile.openFileLikeThisFile", () => {
      OpenFileLikeThisFile.execute();
    })
  );

  context.subscriptions.push(new Disposable(() => Disposable.from(...mDisposables).dispose()));
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
