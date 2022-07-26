"use strict";
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
exports.__esModule = true;
// The module 'assert' provides assertion methods from node
var assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
var vscode = require("vscode");
var initialize_1 = require("../initialize");
var textoperations_1 = require("../../../common/textoperations");
var confighandler_1 = require("../../../configuration/confighandler");
//ConfigHandler.preInitInstanceNotFollowingVsCodeSettings();
confighandler_1.ConfigHandler.Instance;
// let dirname = "d:/temp/test";
// let filename = "d:/temp/test/testcase.txt";
var content = "the first line\r\nthe second line\r\n\r\nthe forth line\r\n\r\nthe sixth line";
suite("Text operation Tests", function () {
    suiteSetup(function (done) {
        initialize_1.envSetup().then(done);
    });
    test("Read second line", function () {
        var res = textoperations_1.TextOperations.getCurrentLine(content, 1);
        assert.equal(res, "the second line");
    });
    test("Read third line (empty)", function () {
        var res = textoperations_1.TextOperations.getCurrentLine(content, 2);
        assert.equal(res, "");
    });
    test("Get word, wrong position", function () {
        var pos = new vscode.Position(2, 4);
        var res = textoperations_1.TextOperations.getWordBetweenBounds('hi', pos);
        assert.equal(res, "");
    });
    test("Get word, left most position", function () {
        var pos = new vscode.Position(2, 4);
        var res = textoperations_1.TextOperations.getWordBetweenBounds('hi "welt"', pos);
        assert.equal(res, "welt");
    });
    test("Get word, right most position", function () {
        var pos = new vscode.Position(2, 7);
        var res = textoperations_1.TextOperations.getWordBetweenBounds('hi "welt"', pos);
        assert.equal(res, "welt");
    });
    test("Get word, empty quoted string", function () {
        var pos = new vscode.Position(2, 4);
        var res = textoperations_1.TextOperations.getWordBetweenBounds('hi ""', pos);
        assert.equal(res, "");
    });
    test("Get word, comment line", function () {
        var pos = new vscode.Position(2, 6);
        var res = textoperations_1.TextOperations.getWordBetweenBounds('#hi/welt', pos);
        assert.equal(res, "hi/welt");
    });
    test("Get word, space delimited", function () {
        var pos = new vscode.Position(2, 6);
        var res = textoperations_1.TextOperations.getWordBetweenBounds('hey hi/welt', pos);
        assert.equal(res, "hi/welt");
    });
    test("Get word, <> bound", function () {
        var pos = new vscode.Position(2, 6);
        var res = textoperations_1.TextOperations.getWordBetweenBounds(' <hi/welt>', pos);
        assert.equal(res, "hi/welt");
    });
    test("Get word, '' bound", function () {
        var pos = new vscode.Position(2, 6);
        var res = textoperations_1.TextOperations.getWordBetweenBounds(' \'hi/welt\'', pos);
        assert.equal(res, "hi/welt");
    });
    test("Get word, \"\" bound", function () {
        var pos = new vscode.Position(2, 6);
        var res = textoperations_1.TextOperations.getWordBetweenBounds(' "hi/welt"', pos);
        assert.equal(res, "hi/welt");
    });
    test("Get word, \" bound, missing right \"", function () {
        var pos = new vscode.Position(2, 6);
        var res = textoperations_1.TextOperations.getWordBetweenBounds(' "hi/welt  puh', pos);
        assert.equal(res, "hi/welt");
    });
    test("Get word, \" bound, leading .. ", function () {
        var pos = new vscode.Position(2, 16);
        var res = textoperations_1.TextOperations.getWordBetweenBounds('ein Text davor "..\\hi\\datei.txt" und dann noch was danach', pos);
        assert.equal(res, "..\\hi\\datei.txt");
    });
    test("Get word, right most position, with config", function () {
        var pos = new vscode.Position(2, 7);
        var res = textoperations_1.TextOperations.getWordBetweenBounds('hi ":welt da:"', pos, /\:/);
        assert.equal(res, "welt da");
    });
    test("Get word, with line number and a colon, cursor before first colon", function () {
        var pos = new vscode.Position(2, 7);
        var res = textoperations_1.TextOperations.getWordBetweenBounds("l:/Datas/Test.txt:10:", pos);
        assert.equal(res, "l:/Datas/Test.txt:10");
    });
    test("Get word, with line number and a colon, cursor at line number", function () {
        var pos = new vscode.Position(2, 18);
        var res = textoperations_1.TextOperations.getWordBetweenBounds("l:/Datas/Test.txt:10:", pos);
        assert.equal(res, "l:/Datas/Test.txt:10");
    });
    test("Get word, with line column and a colon, cursor before first colon", function () {
        var pos = new vscode.Position(2, 7);
        var res = textoperations_1.TextOperations.getWordBetweenBounds("l:/Datas/Test.txt:42:10:content", pos);
        assert.equal(res, "l:/Datas/Test.txt:42:10");
    });
    test("Get word, with line column and a colon, cursor at line number", function () {
        var pos = new vscode.Position(2, 18);
        var res = textoperations_1.TextOperations.getWordBetweenBounds("l:/Datas/Test.txt:42:10:content", pos);
        assert.equal(res, "l:/Datas/Test.txt:42:10");
    });
    test("Get word, with line column and a colon, cursor at column number", function () {
        var pos = new vscode.Position(2, 21);
        var res = textoperations_1.TextOperations.getWordBetweenBounds("l:/Datas/Test.txt:42:10:content", pos);
        assert.equal(res, "l:/Datas/Test.txt:42:10");
    });
    test("Get path and line number, \"windows absolute path string\"", function () {
        var res = textoperations_1.TextOperations.getPathAndPosition("l:\\Datas\\Test.txt");
        assert.equal(res.file, "l:\\Datas\\Test.txt");
        assert.equal(res.line, "-1");
        assert.equal(res.column, "-1");
    });
    test("Get path and line number, \"windows absolute path string and tailing colon\"", function () {
        var res = textoperations_1.TextOperations.getPathAndPosition("l:\\Datas\\Test.txt:");
        assert.equal(res.file, "l:\\Datas\\Test.txt");
        assert.equal(res.line, "-1");
        assert.equal(res.column, "-1");
    });
    test("Get path and line number, \"windows absolute path string and tailing colon and number\"", function () {
        var res = textoperations_1.TextOperations.getPathAndPosition("l:\\Datas\\Test.txt:42");
        assert.equal(res.file, "l:\\Datas\\Test.txt");
        assert.equal(res.line, "42");
        assert.equal(res.column, "-1");
    });
    test("Get path and line column, \"windows absolute path string and line:column\"", function () {
        var res = textoperations_1.TextOperations.getPathAndPosition("l:\\Datas\\Test.txt:42:10");
        assert.equal(res.file, "l:\\Datas\\Test.txt");
        assert.equal(res.line, "42");
        assert.equal(res.column, "10");
    });
    test("Issue 25: Goto right position if non-bmp characters are in content", function () {
        var res = textoperations_1.TextOperations.getPathAndPosition("l:\\Datas\\Unicode.txt:2:12");
        assert.equal(res.file, "l:\\Datas\\Unicode.txt");
        assert.equal(res.line, "2");
        assert.equal(res.column, "12");
    });
    test("Issue 25: Goto right position if non-bmp characters are in content", function () {
        var res = textoperations_1.TextOperations.getPathAndPosition("l:\\Datas\\Unicode.txt:2:12");
        assert.equal(res.file, "l:\\Datas\\Unicode.txt");
        assert.equal(res.line, "2");
        assert.equal(res.column, "12");
    });
});
