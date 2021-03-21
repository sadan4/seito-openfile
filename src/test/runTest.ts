import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';

import { runTests } from 'vscode-test';

async function main() {
	try {
		const WS_ROOT = process.env.WS_ROOT;
		const dirn = WS_ROOT + "/Unittests-tmp";
		if(!existsSync(dirn))
			mkdirSync(dirn);
	
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Download VS Code, unzip it and run the integration test
		await runTests({ extensionDevelopmentPath, extensionTestsPath, launchArgs: [WS_ROOT + "Unittests-tmp"] });
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
