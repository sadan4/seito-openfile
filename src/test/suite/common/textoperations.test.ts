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
import {writeFileSync, writeFile, unlink, unlinkSync, mkdirSync, rmdirSync} from 'fs';
import {TextOperations} from '../../../common/textoperations';
import {ConfigHandler} from '../../../configuration/confighandler';
//ConfigHandler.preInitInstanceNotFollowingVsCodeSettings();
ConfigHandler.Instance;

// let dirname = "d:/temp/test";
// let filename = "d:/temp/test/testcase.txt";
let content = "the first line\r\nthe second line\r\n\r\nthe forth line\r\n\r\nthe sixth line";

suite("Text operation Tests", () => {

	suiteSetup((done) => {
		envSetup().then(done);
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
		let res = TextOperations.getWordBetweenBounds('hi', pos);
		assert.equal(res, "");
	});

	test("Get word, left most position", () => {
		let pos = new vscode.Position(2, 4);
		let res = TextOperations.getWordBetweenBounds('hi "welt"', pos);
		assert.equal(res, "welt");
	});

	test("Get word, right most position", () => {
		let pos = new vscode.Position(2, 7);
		let res = TextOperations.getWordBetweenBounds('hi "welt"', pos);
		assert.equal(res, "welt");
	});

	test("Get word, empty quoted string", () => {
		let pos = new vscode.Position(2, 4);
		let res = TextOperations.getWordBetweenBounds('hi ""', pos);
		assert.equal(res, "");
	});

	test("Get word, comment line", () => {
		let pos = new vscode.Position(2, 6);
		let res = TextOperations.getWordBetweenBounds('#hi/welt', pos);
		assert.equal(res, "hi/welt");
	});

	test("Get word, space delimited", () => {
		let pos = new vscode.Position(2, 6);
		let res = TextOperations.getWordBetweenBounds('hey hi/welt', pos);
		assert.equal(res, "hi/welt");
	});

	test("Get word, <> bound", () => {
		let pos = new vscode.Position(2, 6);
		let res = TextOperations.getWordBetweenBounds(' <hi/welt>', pos);
		assert.equal(res, "hi/welt");
	});

	test("Get word, '' bound", () => {
		let pos = new vscode.Position(2, 6);
		let res = TextOperations.getWordBetweenBounds(' \'hi/welt\'', pos);
		assert.equal(res, "hi/welt");
	});

	test("Get word, \"\" bound", () => {
		let pos = new vscode.Position(2, 6);
		let res = TextOperations.getWordBetweenBounds(' "hi/welt"', pos);
		assert.equal(res, "hi/welt");
	});

	test("Get word, \" bound, missing right \"", () => {
		let pos = new vscode.Position(2, 6);
		let res = TextOperations.getWordBetweenBounds(' "hi/welt  puh', pos);
		assert.equal(res, "hi/welt");
	});

	test("Get word, \" bound, leading .. ", () => {
		let pos = new vscode.Position(2, 16);
		let res = TextOperations.getWordBetweenBounds('ein Text davor "..\\hi\\datei.txt" und dann noch was danach', pos);
		assert.equal(res, "..\\hi\\datei.txt");
	});

	test("Get word, right most position, with config", () => {
		let pos = new vscode.Position(2, 7);
		let res = TextOperations.getWordBetweenBounds('hi ":welt da:"', pos, /\:/);
		assert.equal(res, "welt da");
	});

	test("Get word, with line number and a colon, cursor before first colon", () => {
		let pos = new vscode.Position(2, 7);
		let res = TextOperations.getWordBetweenBounds("l:/Datas/Test.txt:10:", pos);
		assert.equal(res, "l:/Datas/Test.txt:10");
	});

	test("Get word, with line number and a colon, cursor at line number", () => {
		let pos = new vscode.Position(2, 18);
		let res = TextOperations.getWordBetweenBounds("l:/Datas/Test.txt:10:", pos);
		assert.equal(res, "l:/Datas/Test.txt:10");
	});

	test("Get word, with line column and a colon, cursor before first colon", () => {
		let pos = new vscode.Position(2, 7);
		let res = TextOperations.getWordBetweenBounds("l:/Datas/Test.txt:42:10:content", pos);
		assert.equal(res, "l:/Datas/Test.txt:42:10");
	});

	test("Get word, with line column and a colon, cursor at line number", () => {
		let pos = new vscode.Position(2, 18);
		let res = TextOperations.getWordBetweenBounds("l:/Datas/Test.txt:42:10:content", pos);
		assert.equal(res, "l:/Datas/Test.txt:42:10");
	});

	test("Get word, with line column and a colon, cursor at column number", () => {
		let pos = new vscode.Position(2, 21);
		let res = TextOperations.getWordBetweenBounds("l:/Datas/Test.txt:42:10:content", pos);
		assert.equal(res, "l:/Datas/Test.txt:42:10");
	});

	test("Get path and line number, \"windows absolute path string\"", () => {
		let res = TextOperations.getPathAndPosition("l:\\Datas\\Test.txt");
		assert.equal(res.file, "l:\\Datas\\Test.txt");
		assert.equal(res.line, "-1");
		assert.equal(res.column, "-1");
	});

	test("Get path and line number, \"windows absolute path string and tailing colon\"", () => {
		let res = TextOperations.getPathAndPosition("l:\\Datas\\Test.txt:");
		assert.equal(res.file, "l:\\Datas\\Test.txt");
		assert.equal(res.line, "-1");
		assert.equal(res.column, "-1");
	});

	test("Get path and line number, \"windows absolute path string and tailing colon and number\"", () => {
		let res = TextOperations.getPathAndPosition("l:\\Datas\\Test.txt:42");
		assert.equal(res.file, "l:\\Datas\\Test.txt");
		assert.equal(res.line, "42");
		assert.equal(res.column, "-1");
	});

	test("Get path and line column, \"windows absolute path string and line:column\"", () => {
		let res = TextOperations.getPathAndPosition("l:\\Datas\\Test.txt:42:10");
		assert.equal(res.file, "l:\\Datas\\Test.txt");
		assert.equal(res.line, "42");
		assert.equal(res.column, "10");
	});

	test("Issue 25: Goto right position if non-bmp characters are in content", () => {
		let res = TextOperations.getPathAndPosition("l:\\Datas\\Unicode.txt:2:12");
		assert.equal(res.file, "l:\\Datas\\Unicode.txt");
		assert.equal(res.line, "2");
		assert.equal(res.column, "12");
	});

	test("Issue 25: Goto right position if non-bmp characters are in content", () => {
		let res = TextOperations.getPathAndPosition("l:\\Datas\\Unicode.txt:2:12");
		assert.equal(res.file, "l:\\Datas\\Unicode.txt");
		assert.equal(res.line, "2");
		assert.equal(res.column, "12");
	});

});
