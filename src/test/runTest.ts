import * as path from "path";

import { runTests } from "@vscode/test-electron";

async function main(): Promise<void> {
  try {
    const wsRoot = (process.env.WS_ROOT ?? "") + "/Unittests-tmp";
    // const wsRoot = "/builds/fr43nk/seito-openfile/Unittests-tmp";
    console.log(`Workspace root: ${wsRoot}`);

    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, "./suite/index");

    // Download VS Code, unzip it and run the integration test
    await runTests({ extensionDevelopmentPath, extensionTestsPath, launchArgs: [wsRoot] });
  } catch {
    console.error("Failed to run tests");
    process.exit(1);
  }
}

main();
