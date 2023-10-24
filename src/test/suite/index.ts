import * as path from 'path';
import * as Mocha from 'mocha';
// import * as glob from 'glob';
import { glob } from 'glob';

export async function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
	});
	// mocha.useColors(true);

	const testsRoot = path.resolve(__dirname, '..');

	await new Promise((resolve, reject) => {
		glob('**/**.test.js', { cwd: testsRoot }).then((files:string[]) => {
			// Add files to the test suite
			files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

			try {
				// Run the mocha test
				mocha.run(failures => {
					if (failures > 0) {
						reject(new Error(`${failures} tests failed.`));
					} else {
						resolve(null);
					}
				});
			} catch (err) {
				console.error(err);
				reject(err);
			}
		}).catch((err:any) => {
      reject(err);
    });
	});
}
