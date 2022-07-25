//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {envSetup, envTeardown} from '../initialize';
import {writeFileSync, writeFile, unlink, unlinkSync, mkdirSync, open, rmdirSync, existsSync, lstatSync} from 'fs';
import {join, sep, basename} from 'path';
import * as os from 'os';
import {FileOperations} from '../../../common/fileoperations';
import { OpenFileFromText } from '../../../commands/openFileFromText';
import { ConfigHandler } from '../../../configuration/confighandler';
var trueCasePathSync = require('true-case-path');
//ConfigHandler.preInitInstanceNotFollowingVsCodeSettings();
ConfigHandler.Instance;

function normalizeSlash(filepath: string) {		// Only needed for paths with backslash directory separator (originally developed on Windows).  Paths with '/' are treated as hard-coded as slash.
	return sep === '/' ? filepath.replace(/\\/g, '/') : filepath.replace(/\//g, '\\');
}

// Defines a Mocha test suite to group tests of similar kind together
let WS_ROOT = process.env.WS_ROOT;
let dirname = WS_ROOT + "/Unittests-tmp/test";
let filename = WS_ROOT + "/Unittests-tmp/test/testcase.txt";
let content = "the first line\r\nthe second line\r\n\r\nthe forth line\r\n\r\nthe sixth line";
let openFile: OpenFileFromText;

suite("File operation Tests", () => {

	suiteSetup((done) => {
		openFile = new OpenFileFromText(vscode.window.activeTextEditor, ConfigHandler.Instance);
		envSetup().then(done, done);
	});

	test("** " + WS_ROOT + "/Unittests-tmp must exists before run tests, and match exact case", () => {
		if( WS_ROOT === undefined ){
			assert.fail(null, null,"WS_ROOT is undefined");
		}
		assert.equal(true, existsSync(WS_ROOT + "/Unittests-tmp"));
		assert.equal(true, lstatSync(WS_ROOT + "/Unittests-tmp").isDirectory());
		assert.equal(join(WS_ROOT, "Unittests-tmp"), trueCasePathSync(WS_ROOT + "/Unittests-tmp"));
	});
	test("AlwaysRelToAbsPath 1", () => {
		let rel1 = "../../Unittests-common/test.ts";
		let curr1 = normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\");
		let res = FileOperations.getAbsoluteFromAlwaysRelativePath(rel1, curr1);
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-common\\test.ts"));
	});

	test("RelToAbsPath 1", () => {
		let rel1 = "../../Unittests-common/test.ts";
		let curr1 = normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\");
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-common\\test.ts"));
	});

	test("RelToAbsPath 2", () => {
		let rel1 = "../../../../../../../../../../../../Unittests-common/test.ts";
		let curr1 = normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\");
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res.replace(/^[a-z]:/i, ''), normalizeSlash("\\Unittests-common\\test.ts"));
	});

	test("RelToAbsPath 3", () => {
		let rel1 = "";
		let curr1 = normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\");
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "");
	});

	test("RelToAbsPath 4", () => {
		let rel1 = "";
		let curr1 = normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\");
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "");
	});

	test("RelToAbsPath 5", () => {
		let rel1 = "../../../../../../../../../../../../Unittests-common/test.ts";
		let curr1 = WS_ROOT + "/Unittests-tmp/test/";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res.replace(/^[a-z]:/i, ''), normalizeSlash("\\Unittests-common\\test.ts"));
	});

	test("RelToAbsPath 6", () => {
		let home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
		let rel1 = "~/Unittests-common/test.ts";
		let curr1 = WS_ROOT + "/Unittests-tmp/test/";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, normalizeSlash(home + "\\Unittests-common\\test.ts"));
	});

	test("RelToAbsPath 7", () => {
		let home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
		let rel1 = WS_ROOT + "/Unittests-common/test.ts";
		let curr1 = WS_ROOT + "/Unittests-tmp/test/";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-common\\test.ts"));
	});

	test("RelToAbsPath 8", () => {
		let rel1 = "../../Unittests-common/test.ts";
		let curr1 = WS_ROOT + "/Unittests-tmp/test/hans.txt";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-common\\test.ts"));
	});

	test("RelToAbsPath 9", () => {
		let rel1 = normalizeSlash("..\\Unittests-common\\test.ts");
		let curr1 = WS_ROOT + "/Unittests-tmp/test/hans.txt";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\Unittests-common\\test.ts"));
	});

	test("RelToAbsPath, current file does not exist", () => {
		let rel1 = "../../Unittests-common/test.ts";
		let curr1 = WS_ROOT + "/Unittests-tmp/test/hans.tx";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "");
	});

	test("RelToAbsPath, text file does not exist", () => {
		let rel1 = "../../Unittests-common/test.ts1";
		let curr1 = WS_ROOT + "/Unittests-tmp/test/hans.txt";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-common\\test.ts1"));
	});

	test("FuzzyPath, file has leading underscore (scss) and suffix but not in file", () => {
		let rel1 = "./test2";
		let curr1 = WS_ROOT + "/Unittests-tmp/test/test.scss";
		let res = FileOperations.getAbsolutePathFromFuzzyPath(rel1, curr1, "scss");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\_test2.scss"));
	});
	test("FuzzyPath, file has leading underscore (scss) and suffix but only suffix in file", () => {
		let rel1 = "./test3.scss";
		let curr1 = WS_ROOT + "/Unittests-tmp/test/test.scss";
		let res = FileOperations.getAbsolutePathFromFuzzyPath(rel1, curr1, "scss");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\_test3.scss"));
	});
	test("FuzzyPath, file has leading underscore (scss) and suffix but only suffix in file, relative path", () => {
		let rel1 = "../../Unittests-tmp/test/test3";
		let curr1 = WS_ROOT + "/Unittests-tmp/test/test.scss";
		let res = FileOperations.getAbsolutePathFromFuzzyPath(rel1, curr1, "scss");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\_test3.scss"));
	});
	test("FuzzyPath, file has leading underscore (scss) and suffix but only underscore, relative path", () => {
		let rel1 = "../../Unittests-tmp/test/_test3";
		let curr1 = WS_ROOT + "/Unittests-tmp/test/test.scss";
		let res = FileOperations.getAbsolutePathFromFuzzyPath(rel1, curr1, "scss");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\_test3.scss"));
	});
	test("Github #6: Open with line number", (done) => {
		// Remark: WS_ROOT + "/Unittests-tmp" folder must exists before running unit tests.  And the letter case of "Unittests-tmp" folder must be exact match.
		openFile.openDocument(WS_ROOT + "/Unittests-tmp/test/testcase.txt:2").then(value => {
			assert.equal(vscode.window.activeTextEditor?.document.fileName,normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\testcase.txt"));

			// check line is positioned
			let selections = vscode.window.activeTextEditor?.selections;
			if( selections === undefined ){
				assert.fail(null, null, "selection is undefined");
			}
			assert.equal(1, selections.length);
			assert.equal(1, selections[0].anchor.line);
			console.log(value);
			done();
		}).catch(value => {
			console.log(value);
			done(value);
		});
	});
	test("Open with line number and column", (done) => {
		// Remark: WS_ROOT + "/Unittests-tmp" folder must exists before running unit tests.  And the letter case of "Unittests-tmp" folder must be exact match.
		openFile.openDocument(WS_ROOT + "/Unittests-tmp/test/testcase.txt:2:5").then(value => {
			assert.equal(vscode.window.activeTextEditor?.document.fileName,normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\testcase.txt"));

			// check line and column is positioned
			let selections = vscode.window.activeTextEditor?.selections;
			if( selections === undefined ){
				assert.fail(null, null, "selection is undefined");
			}
			assert.equal(1, selections.length);
			assert.equal(1, selections[0].anchor.line);
			assert.equal(4, selections[0].anchor.character);
			console.log(value);
			done();
		}).catch(value => {
			console.log(value);
			done(value);
		});
	});

	test("resolvePath, resolve path to absolute", () => {
		let res = openFile.resolvePath(WS_ROOT + "/Unittests-tmp/test.ts", WS_ROOT + "/Unittests-common/test.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test.ts"));
	});
	test("resolvePath, resolve path to home", () => {
		let homeExistentFile = os.platform() === "win32" ? "~/Desktop/desktop.ini" : 
			existsSync("~/.bash_history") === true ? "~/.bash_history" : existsSync("~/.zsh_history") ? "~/.bashrc" : "~/.zshrc";
		if( existsSync(homeExistentFile) ){
			let res = openFile.resolvePath(homeExistentFile, WS_ROOT + "/Unittests-common/virtual-current-file");
			let pos = res.lastIndexOf(sep);
			assert.equal(pos !== -1 ? res.substr(pos) : res, normalizeSlash("\\" + basename(homeExistentFile)));
		}
	});
	test("resolvePath, resolve path to same folder, without file extension, implicit file extension", () => {
		let res = openFile.resolvePath("testcase2", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
	});
	test("resolvePath, resolve path to same folder, fuzzy, extraExtensions", () => {
		ConfigHandler.Instance.Configuration.ExtraExtensionsForTypes = [{ name:"js", suffixes: ["ts"] }];
		let res = openFile.resolvePath("testcase2", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.js"); // Note .js instead of .ts here
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
	});
	test("resolvePath, resolve path to same folder, not in workspace, without file extension, not resolved to directory", () => {
		let res = openFile.resolvePath("../Unittests-tmp/test", WS_ROOT + "/Unittests-common/test.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test.ts"));
	});
	test("resolvePath, treat absolute path also as relative path, resolve path to same folder, without file extension", () => {
		let res = openFile.resolvePath("/testcase2", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
	});
	test("resolvePath, resolve path to workspace folder", () => {
		ConfigHandler.Instance.Configuration.SearchPaths = [WS_ROOT + '/', `${WS_ROOT}/Unittests-tmp/`, `${WS_ROOT}/Unittests-common/`];
		let res = openFile.resolvePath("test/hans.txt", WS_ROOT + "/Unittests-common/test.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\hans.txt"));
	});
	test("resolvePath, resolve path to parent folder", () => {
		let res = openFile.resolvePath("test.scss", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\test.scss"));
	});
	test("resolvePath, resolve path to workspace src folder, without file extension", () => {
		ConfigHandler.Instance.Configuration.SearchPaths = [WS_ROOT + '/', `${WS_ROOT}/Unittests-tmp/`, `${WS_ROOT}/Unittests-common/`];
		ConfigHandler.Instance.Configuration.SearchSubFoldersOfWorkspaceFolders = ['lib/','src/'];
		let res = openFile.resolvePath("Class1", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\src\\Class1.ts"));
	});
	test("resolvePath, resolve path to searchPaths", () => {
		ConfigHandler.Instance.Configuration.SearchPaths = [WS_ROOT + '/'];
		let res = openFile.resolvePath("Unittests-common/test", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-common\\test.ts"));
	});
	test("resolvePath, resolve path to 2nd item in searchPaths", () => {
		ConfigHandler.Instance.Configuration.SearchPaths = [WS_ROOT + '/',WS_ROOT + '/Unittests-tmp/test/dir1'];
		let res = openFile.resolvePath("testcase2", WS_ROOT + "/Unittests-tmp/test.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
	});
	test("resolvePath, resolve path failure gives empty string, and won't resolve absolute path to folder", () => {
		let res = openFile.resolvePath(WS_ROOT + "/Unittests-tmp//test/dir1", WS_ROOT + "/Unittests-common/test.ts");
		assert.equal(res, "");
	});

	test("resolvePath, resolve path with path substitution by leadingPathMapping", () => {
		ConfigHandler.Instance.Configuration.LeadingPathMapping = { '@dir1': 'test/dir1' };
		let res = openFile.resolvePath("@dir1/testcase2", WS_ROOT + "/Unittests-tmp/test.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
	});
	test("Github #9: resolvePath, resolve path with deletion by leadingPathMapping. Support open paths from git diff which starts with a/ or b/", () => {
		ConfigHandler.Instance.Configuration.LeadingPathMapping = { 'a': '', 'b': '' };
		let res = openFile.resolvePath("a/test/testcase.txt", WS_ROOT + "/Unittests-tmp/test.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\testcase.txt"));
		res = openFile.resolvePath("b/test/testcase.txt", WS_ROOT + "/Unittests-tmp/test.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\testcase.txt"));
	});
	test("resolvePath, resolve path with path substitution, using prefix match with ending '*', by leadingPathMapping.", () => {
		ConfigHandler.Instance.Configuration.LeadingPathMapping = { '$*': '*' };
		let res = openFile.resolvePath("$test/dir1/testcase2", WS_ROOT + "/Unittests-tmp/test.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
	});
	test("resolvePath, resolve path with path substitution, using prefix match with ending '*', by leadingPathMapping's deletion, removing path's leading variable", () => {
		ConfigHandler.Instance.Configuration.LeadingPathMapping = { "$*": "*", "$*?": "" };		// "$*?" is a special case, same as "$*", but for non-duplicated keys
		let res = openFile.resolvePath("$basePath/test/dir1/testcase2", WS_ROOT + "/Unittests-tmp/src/Class1.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
	});
	test("resolvePath, resolve path with path substitution, using prefix match with ending '*', by leadingPathMapping, removing '$' for single variable", () => {
		ConfigHandler.Instance.Configuration.LeadingPathMapping = { "$*": "*", "$*?": "" };		// "$*?" is a special case, same as "$*", but for non-duplicated keys. Later value in this leadingPathMapping has higher priority.  E.g. such that { "abc": "...", "abc/def": "..." } works better in natural order
		let res = openFile.resolvePath("$Class1", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\src\\Class1.ts"));
	});

	test("A multi-lined selection should split, and support cutting :content from lines of grep/ack output like file:line:column:content", (done) => {
		let line1 = WS_ROOT + '/Unittests-tmp/test/testcase.txt:4:3:the forth line\n';
		let line2 = WS_ROOT + '/Unittests-tmp/test/dir1/testcase2.ts:1:line 1\n';
		let content = line1 + line2;
		vscode.workspace.openTextDocument({ content: content }).then((doc) => {
			let anchor = new vscode.Position(0, 0);
			let active = new vscode.Position(2, 0);
			let files = openFile.getWordRanges(new vscode.Selection(anchor, active), doc);
			if( files === undefined ){
				assert.fail(null, null, "files are undefined");
			}
			assert.equal(2, files?.length);
			assert.equal(WS_ROOT + '/Unittests-tmp/test/testcase.txt:4:3', files[0]);
			assert.equal(WS_ROOT + '/Unittests-tmp/test/dir1/testcase2.ts:1', files[1]);
			done();
		}, (reason: Error) => {
			done("Cannot open untitled text: " + reason.message);
		});
	});

	test("Gitlab issue 23, open file which has no suffix at all", () => {
		let res = openFile.resolvePath("../../src/Class12", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\src\\Class12"));
	});

	test("Gitlab issue 23, open file which has no suffix at all, added path to search list", () => {
		ConfigHandler.Instance.Configuration.SearchPaths = [WS_ROOT + '/',WS_ROOT + '/Unittests-tmp/src'];
		let res = openFile.resolvePath("Class12", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\src\\Class12"));
	});

	test("Gitlab issue 23, open file which has no suffix at all, added path to search list and subfolders", () => {
		ConfigHandler.Instance.Configuration.SearchPaths = [WS_ROOT + '/',WS_ROOT + '/Unittests-tmp'];
		ConfigHandler.Instance.Configuration.SearchSubFoldersOfWorkspaceFolders = ['lib/','src/'];
		let res = openFile.resolvePath("Class12", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
		assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\src\\Class12"));
	});

});

