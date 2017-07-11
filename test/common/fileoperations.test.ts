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
import {writeFileSync, writeFile, unlink, unlinkSync, mkdirSync} from 'fs';
import {FileOperations} from '../../src/common/fileoperations';

// Defines a Mocha test suite to group tests of similar kind together


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
});

