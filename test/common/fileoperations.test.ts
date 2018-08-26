//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {initialize, teardown} from '../initialize';
import {writeFileSync, writeFile, unlink, unlinkSync, mkdirSync, open, rmdirSync, existsSync, lstatSync} from 'fs';
import {FileOperations} from '../../src/common/fileoperations';
import { OpenFileFromText } from '../../src/commands/openFileFromText';
import { ConfigHandler } from '../../src/configuration/confighandler';
var trueCasePathSync = require('true-case-path');
ConfigHandler.preInitInstanceNotFollowingVsCodeSettings();

// Defines a Mocha test suite to group tests of similar kind together
let dirname = "d:/temp/test";
let filename = "d:/temp/test/testcase.txt";
let content = "the first line\r\nthe second line\r\n\r\nthe forth line\r\n\r\nthe sixth line";
let openFile: OpenFileFromText;

suite("File operation Tests", () => {

	suiteSetup((done) => {
		initialize().then(done, done);
		openFile = new OpenFileFromText(vscode.window.activeTextEditor, ConfigHandler.Instance);
	});
	suiteTeardown((done) => {
		teardown().then(done, done);
	});

	test("** d:/Temp must exists before run tests, and match exact case", () => {
		assert.equal(true, existsSync("d:/Temp"));
		assert.equal(true, lstatSync("d:/Temp").isDirectory());
		assert.equal("d:\\Temp", trueCasePathSync("d:/Temp"));
	});
	test("AlwaysRelToAbsPath 1", () => {
		let rel1 = "../../common/test.ts";
		let curr1 = "d:\\Temp\\test\\";
		let res = FileOperations.getAbsoluteFromAlwaysRelativePath(rel1, curr1);
		assert.equal(res, "d:\\common\\test.ts");
	});

	test("RelToAbsPath 1", () => {
		let rel1 = "../../common/test.ts";
		let curr1 = "d:\\Temp\\test\\";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "d:\\common\\test.ts");
	});

	test("RelToAbsPath 2", () => {
		let rel1 = "../../../common/test.ts";
		let curr1 = "d:\\Temp\\test\\";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "d:\\common\\test.ts");
	});

	test("RelToAbsPath 3", () => {
		let rel1 = "";
		let curr1 = "d:\\Temp\\test\\";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "");
	});

	test("RelToAbsPath 4", () => {
		let rel1;
		let curr1 = "d:\\Temp\\test\\";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "");
	});

	test("RelToAbsPath 5", () => {
		let rel1 = "../../../common/test.ts";
		let curr1 = "d:/Temp/test/";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "d:\\common\\test.ts");
	});

	test("RelToAbsPath 6", () => {
		let home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
		let rel1 = "~/common/test.ts";
		let curr1 = "d:/Temp/test/";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, home + "\\common\\test.ts");
	});

	test("RelToAbsPath 7", () => {
		let home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
		let rel1 = "d:/common/test.ts";
		let curr1 = "d:/Temp/test/";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "d:\\common\\test.ts");
	});

	test("RelToAbsPath 8", () => {
		let rel1 = "../../common/test.ts";
		let curr1 = "d:/Temp/test/hans.txt";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "d:\\common\\test.ts");
	});

	test("RelToAbsPath 9", () => {
		let rel1 = "..\\common\\test.ts";
		let curr1 = "d:/Temp/test/hans.txt";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "d:\\Temp\\common\\test.ts");
	});

	test("RelToAbsPath, current file does not exist", () => {
		let rel1 = "../../common/test.ts";
		let curr1 = "d:/Temp/test/hans.tx";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "");
	});

	test("RelToAbsPath, text file does not exist", () => {
		let rel1 = "../../common/test.ts1";
		let curr1 = "d:/Temp/test/hans.txt";
		let res = FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
		assert.equal(res, "d:\\common\\test.ts1");
	});

	test("FuzzyPath, file has leading underscore (scss) and suffix but not in file", () => {
		let rel1 = "./test2";
		let curr1 = "d:/Temp/test/test.scss";
		let res = FileOperations.getAbsolutePathFromFuzzyPath(rel1, curr1, "scss");
		assert.equal(res, "d:\\Temp\\test\\_test2.scss");
	});
	test("FuzzyPath, file has leading underscore (scss) and suffix but only suffix in file", () => {
		let rel1 = "./test3.scss";
		let curr1 = "d:/Temp/test/test.scss";
		let res = FileOperations.getAbsolutePathFromFuzzyPath(rel1, curr1, "scss");
		assert.equal(res, "d:\\Temp\\test\\_test3.scss");
	});
	test("FuzzyPath, file has leading underscore (scss) and suffix but only suffix in file, relative path", () => {
		let rel1 = "../../Temp/test/test3";
		let curr1 = "d:/Temp/test/test.scss";
		let res = FileOperations.getAbsolutePathFromFuzzyPath(rel1, curr1, "scss");
		assert.equal(res, "d:\\Temp\\test\\_test3.scss");
	});
	test("FuzzyPath, file has leading underscore (scss) and suffix but only underscore, relative path", () => {
		let rel1 = "../../Temp/test/_test3";
		let curr1 = "d:/Temp/test/test.scss";
		let res = FileOperations.getAbsolutePathFromFuzzyPath(rel1, curr1, "scss");
		assert.equal(res, "d:\\Temp\\test\\_test3.scss");
	});
	test("Github #6: Open with line number", (done) => {
		// Remark: "d:/Temp" folder must exists before running unit tests.  And the letter case of "Temp" folder must be exact match.
		openFile.openDocument("d:/Temp/test/testcase.txt:2").then(value => {
			assert.equal(vscode.window.activeTextEditor.document.fileName,"d:\\Temp\\test\\testcase.txt");

			// check line is positioned
			let selections = vscode.window.activeTextEditor.selections;
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
		// Remark: "d:/Temp" folder must exists before running unit tests.  And the letter case of "Temp" folder must be exact match.
		openFile.openDocument("d:/Temp/test/testcase.txt:2:5").then(value => {
			assert.equal(vscode.window.activeTextEditor.document.fileName,"d:\\Temp\\test\\testcase.txt");

			// check line and column is positioned
			let selections = vscode.window.activeTextEditor.selections;
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
		let res = openFile.resolvePath("d:/Temp/test.ts", "d:/common/test.ts");
		assert.equal(res, "d:\\Temp\\test.ts");
	});
	test("resolvePath, resolve path to home", () => {
		let res = openFile.resolvePath("~/Desktop/desktop.ini", "d:/common/test.ts");
		let pos = res.lastIndexOf('\\');
		assert.equal(pos != -1 ? res.substr(pos) : res, "\\desktop.ini");
	});
	test("resolvePath, resolve path to same folder, without file extension, implicit file extension", () => {
		let res = openFile.resolvePath("testcase2", "d:/Temp/test/dir1/testcase2.ts");
		assert.equal(res, "d:\\Temp\\test\\dir1\\testcase2.ts");
	});
	test("resolvePath, resolve path to same folder, fuzzy, extraExtensions", () => {
		ConfigHandler.Instance.Configuration.ExtraExtensionsForTypes = { "js": ["ts"] };
		let res = openFile.resolvePath("testcase2", "d:/Temp/test/dir1/testcase2.js"); // Note .js instead of .ts here
		assert.equal(res, "d:\\Temp\\test\\dir1\\testcase2.ts");
	});
	test("resolvePath, resolve path to same folder, not in workspace, without file extension, not resolved to directory", () => {
		let res = openFile.resolvePath("../Temp/test", "d:/common/test.ts");
		assert.equal(res, "d:\\Temp\\test.ts");
	});
	test("resolvePath, treat absolute path also as relative path, resolve path to same folder, without file extension", () => {
		let res = openFile.resolvePath("/testcase2", "d:/Temp/test/dir1/testcase2.ts");
		assert.equal(res, "d:\\Temp\\test\\dir1\\testcase2.ts");
	});
	test("resolvePath, resolve path to workspace folder", () => {
		let res = openFile.resolvePath("test/hans.txt", "d:/common/test.ts");
		assert.equal(res, "d:\\Temp\\test\\hans.txt");
	});
	test("resolvePath, resolve path to parent folder", () => {
		let res = openFile.resolvePath("test.scss", "d:/Temp/test/dir1/testcase2.ts");
		assert.equal(res, "d:\\Temp\\test\\test.scss");
	});
	test("resolvePath, resolve path to workspace src folder, without file extension", () => {
		ConfigHandler.Instance.Configuration.SearchSubFoldersOfWorkspaceFolders = ['lib/','src/'];
		let res = openFile.resolvePath("Class1", "d:/Temp/test/dir1/testcase2.ts");
		assert.equal(res, "d:\\Temp\\src\\Class1.ts");
	});
	test("resolvePath, resolve path to searchPaths", () => {
		ConfigHandler.Instance.Configuration.SearchPaths = ['d:/'];
		let res = openFile.resolvePath("common/test", "d:/Temp/test/dir1/testcase2.ts");
		assert.equal(res, "d:\\common\\test.ts");
	});
	test("resolvePath, resolve path to 2nd item in searchPaths", () => {
		ConfigHandler.Instance.Configuration.SearchPaths = ['d:/','d:/Temp/test/dir1'];
		let res = openFile.resolvePath("testcase2", "d:/Temp/test.ts");
		assert.equal(res, "d:\\Temp\\test\\dir1\\testcase2.ts");
	});
	test("resolvePath, resolve path failure gives empty string, and won't resolve absolute path to folder", () => {
		let res = openFile.resolvePath("d:/Temp//test/dir1", "d:/common/test.ts");
		assert.equal(res, "");
	});

	test("resolvePath, resolve path with path substitution by leadingPathMapping", () => {
		ConfigHandler.Instance.Configuration.LeadingPathMapping = { '@dir1': 'test/dir1' };
		let res = openFile.resolvePath("@dir1/testcase2", "d:/Temp/test.ts");
		assert.equal(res, "d:\\Temp\\test\\dir1\\testcase2.ts");
	});
	test("Github #9: resolvePath, resolve path with deletion by leadingPathMapping. Support open paths from git diff which starts with a/ or b/", () => {
		ConfigHandler.Instance.Configuration.LeadingPathMapping = { 'a': '', 'b': '' };
		let res = openFile.resolvePath("a/test/testcase.txt", "d:/Temp/test.ts");
		assert.equal(res, "d:\\Temp\\test\\testcase.txt");
		res = openFile.resolvePath("b/test/testcase.txt", "d:/Temp/test.ts");
		assert.equal(res, "d:\\Temp\\test\\testcase.txt");
	});

	test("A multi-lined selection should split, and support cutting :content from lines of grep/ack output like file:line:column:content", (done) => {
		let line1 = 'd:/Temp/test/testcase.txt:4:3:the forth line\n';
		let line2 = 'd:/Temp/test/dir1/testcase2.ts:1:line 1\n';
		let content = line1 + line2;
		vscode.workspace.openTextDocument({ content: content }).then((doc) => {
			let anchor = new vscode.Position(0, 0);
			let active = new vscode.Position(2, 0);
			let files = openFile.getWordRanges(new vscode.Selection(anchor, active), doc);
			assert.equal(2, files.length);
			assert.equal('d:/Temp/test/testcase.txt:4:3', files[0]);
			assert.equal('d:/Temp/test/dir1/testcase2.ts:1', files[1]);
			done();
		}, (reason: Error) => {
			done("Cannot open untitled text: " + reason.message);
		});
	});
});

