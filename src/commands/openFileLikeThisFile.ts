import * as vscode from "vscode";
import { parse, join } from "path";

/**
 * May just keep the logic simple (relative path, cut extension). For advanced similar feature, there is already
 * an VSCode extension like "Quick Open Related Files".
 */
export class OpenFileLikeThisFile {
  public static execute(): void {
    const editor = vscode.window.activeTextEditor;
    if (editor?.document !== null && editor?.document?.uri !== null) {
      const uri = editor?.document.uri;
      if (uri !== undefined) {
        const path = parse(vscode.workspace.asRelativePath(uri.fsPath, false));
        vscode.commands.executeCommand(
          "workbench.action.quickOpen",
          join(path.dir, path.name) // only cut file extension
        );
      }
    }
  }
}
