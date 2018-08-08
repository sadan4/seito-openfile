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
import {writeFileSync, writeFile, unlink, unlinkSync, mkdirSync, open, rmdirSync, existsSync} from 'fs';
import {FileOperations} from '../../src/common/fileoperations';
import { OpenFileFromText } from '../../src/commands/openFileFromText';
import { ConfigHandler } from '../../src/configuration/confighandler';

// Defines a Mocha test suite to group tests of similar kind together
let dirname = "d:/temp/test";
let filename = "d:/temp/test/testcase.txt";
let content = "the first line\r\nthe second line\r\n\r\nthe forth line\r\n\r\nthe sixth line";

suite("File operation Tests", () => {

	suiteSetup((done) => {
		initialize().then(done, done);
	});
	suiteTeardown((done) => {
		teardown().then(done, done);
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
		let configHandler: ConfigHandler = ConfigHandler.Instance;
		let openFile: OpenFileFromText = new OpenFileFromText(
				vscode.window.activeTextEditor, configHandler);
		openFile.openDocument("d:/TEMP/test/testcase.txt:2").then(value => {
			assert.equal(vscode.window.activeTextEditor.document.fileName,"d:\\TEMP\\test\\testcase.txt");
			console.log(value);
			done();
		}).catch(value => {
			console.log(value);
			done(value);
		});
	});
});

