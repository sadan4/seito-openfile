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
import {writeFileSync, writeFile, unlink, unlinkSync, mkdirSync, rmdirSync} from 'fs';
import {TextOperations} from '../../src/common/textoperations';
import {ConfigHandler} from '../../src/configuration/confighandler';

let dirname = "d:/temp/test";
let filename = "d:/temp/test/testcase.txt";
let content = "the first line\r\nthe second line\r\n\r\nthe forth line\r\n\r\nthe sixth line";

suite("Text operation Tests", () => {

	suiteSetup((done) => {
		mkdirSync(dirname);
		writeFileSync(filename, content);
		done();
	});
	suiteTeardown((done) => {
		unlinkSync(filename);
		rmdirSync(dirname);
		done();
	});

	test("Read second line", () => {
		let res = TextOperations.getCurrentLine(content, 1);
		assert.equal(res, "the second line");
	});

	test("Read third line (empty)", () => {
		let res = TextOperations.getCurrentLine(content, 2);
		assert.equal(res, "");
	});

	test("Get word, wrong position", () => {
		let pos = new vscode.Position(2, 4);
		let res = TextOperations.getWordBetweenBounds('hi', pos)
		assert.equal(res, "");
	});

	test("Get word, left most position", () => {
		let pos = new vscode.Position(2, 4);
		let res = TextOperations.getWordBetweenBounds('hi "welt"', pos)
		assert.equal(res, "welt");
	});

	test("Get word, right most position", () => {
		let pos = new vscode.Position(2, 7);
		let res = TextOperations.getWordBetweenBounds('hi "welt"', pos)
		assert.equal(res, "welt");
	});

	test("Get word, comment line", () => {
		let pos = new vscode.Position(2, 6);
		let res = TextOperations.getWordBetweenBounds('# hi/welt', pos)
		assert.equal(res, "hi/welt");
	});

	test("Get word, <> bound", () => {
		let pos = new vscode.Position(2, 6);
		let res = TextOperations.getWordBetweenBounds(' <hi/welt>', pos)
		assert.equal(res, "hi/welt");
	});

	test("Get word, '' bound", () => {
		let pos = new vscode.Position(2, 6);
		let res = TextOperations.getWordBetweenBounds(' \'hi/welt\'', pos)
		assert.equal(res, "hi/welt");
	});

	test("Get word, \"\" bound", () => {
		let pos = new vscode.Position(2, 6);
		let res = TextOperations.getWordBetweenBounds(' "hi/welt"', pos)
		assert.equal(res, "hi/welt");
	});

	test("Get word, \" bound, missing right \"", () => {
		let pos = new vscode.Position(2, 6);
		let res = TextOperations.getWordBetweenBounds(' "hi/welt  puh', pos)
		assert.equal(res, "hi/welt");
	});

	test("Get word, \" bound, leading .. ", () => {
		let pos = new vscode.Position(2, 16);
		let res = TextOperations.getWordBetweenBounds('ein Text davor "..\\hi\\datei.txt" und dann noch was danach', pos)
		assert.equal(res, "..\\hi\\datei.txt");
	});

	test("Get word, right most position, with config", () => {
		let configHandler = new ConfigHandler();
		configHandler.Configuration.Bound = /\:/;
		let pos = new vscode.Position(2, 7);
		let res = TextOperations.getWordBetweenBounds('hi ":welt da:"', pos, configHandler.Configuration.Bound)
		assert.equal(res, "welt da");
	});

	test("Get path and line number, \"windows absolute path string\"", () => {
		let res = TextOperations.getPathAndLineNumber("l:\\Datas\\Test.txt");
		assert.equal(res.file, "l:\\Datas\\Test.txt");
		assert.equal(res.line, "-1");
	});

	test("Get path and line number, \"windows absolute path string and tailing colon\"", () => {
		let res = TextOperations.getPathAndLineNumber("l:\\Datas\\Test.txt:");
		assert.equal(res.file, "l:\\Datas\\Test.txt");
		assert.equal(res.line, "-1");
	});

	test("Get path and line number, \"windows absolute path string and tailing colon and number\"", () => {
		let res = TextOperations.getPathAndLineNumber("l:\\Datas\\Test.txt:42");
		assert.equal(res.file, "l:\\Datas\\Test.txt");
		assert.equal(res.line, "42");
	});


});