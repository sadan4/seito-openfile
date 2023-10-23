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
var fs_1 = require("fs");
var path_1 = require("path");
var os = require("os");
var fileoperations_1 = require("../../../common/fileoperations");
var openFileFromText_1 = require("../../../commands/openFileFromText");
var confighandler_1 = require("../../../configuration/confighandler");
var trueCasePathSync = require('true-case-path');
//ConfigHandler.preInitInstanceNotFollowingVsCodeSettings();
confighandler_1.ConfigHandler.Instance;
function normalizeSlash(filepath) {
    return path_1.sep === '/' ? filepath.replace(/\\/g, '/') : filepath.replace(/\//g, '\\');
}
// Defines a Mocha test suite to group tests of similar kind together
var WS_ROOT = process.env.WS_ROOT;
var dirname = WS_ROOT + "/Unittests-tmp/test";
var filename = WS_ROOT + "/Unittests-tmp/test/testcase.txt";
var content = "the first line\r\nthe second line\r\n\r\nthe forth line\r\n\r\nthe sixth line";
var openFile;
suite("File operation Tests", function () {
    suiteSetup(function (done) {
        openFile = new openFileFromText_1.OpenFileFromText(vscode.window.activeTextEditor, confighandler_1.ConfigHandler.Instance);
        initialize_1.envSetup().then(done, done);
    });
    test("** " + WS_ROOT + "/Unittests-tmp must exists before run tests, and match exact case", function () {
        if (WS_ROOT === undefined) {
            assert.fail(null, null, "WS_ROOT is undefined");
        }
        assert.equal(true, fs_1.existsSync(WS_ROOT + "/Unittests-tmp"));
        assert.equal(true, fs_1.lstatSync(WS_ROOT + "/Unittests-tmp").isDirectory());
        assert.equal(path_1.join(WS_ROOT, "Unittests-tmp"), trueCasePathSync(WS_ROOT + "/Unittests-tmp"));
    });
    test("AlwaysRelToAbsPath 1", function () {
        var rel1 = "../../Unittests-common/test.ts";
        var curr1 = normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\");
        var res = fileoperations_1.FileOperations.getAbsoluteFromAlwaysRelativePath(rel1, curr1);
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-common\\test.ts"));
    });
    test("RelToAbsPath 1", function () {
        var rel1 = "../../Unittests-common/test.ts";
        var curr1 = normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\");
        var res = fileoperations_1.FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-common\\test.ts"));
    });
    test("RelToAbsPath 2", function () {
        var rel1 = "../../../../../../../../../../../../Unittests-common/test.ts";
        var curr1 = normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\");
        var res = fileoperations_1.FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
        assert.equal(res.replace(/^[a-z]:/i, ''), normalizeSlash("\\Unittests-common\\test.ts"));
    });
    test("RelToAbsPath 3", function () {
        var rel1 = "";
        var curr1 = normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\");
        var res = fileoperations_1.FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
        assert.equal(res, "");
    });
    test("RelToAbsPath 4", function () {
        var rel1 = "";
        var curr1 = normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\");
        var res = fileoperations_1.FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
        assert.equal(res, "");
    });
    test("RelToAbsPath 5", function () {
        var rel1 = "../../../../../../../../../../../../Unittests-common/test.ts";
        var curr1 = WS_ROOT + "/Unittests-tmp/test/";
        var res = fileoperations_1.FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
        assert.equal(res.replace(/^[a-z]:/i, ''), normalizeSlash("\\Unittests-common\\test.ts"));
    });
    test("RelToAbsPath 6", function () {
        var home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
        var rel1 = "~/Unittests-common/test.ts";
        var curr1 = WS_ROOT + "/Unittests-tmp/test/";
        var res = fileoperations_1.FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
        assert.equal(res, normalizeSlash(home + "\\Unittests-common\\test.ts"));
    });
    test("RelToAbsPath 7", function () {
        var home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
        var rel1 = WS_ROOT + "/Unittests-common/test.ts";
        var curr1 = WS_ROOT + "/Unittests-tmp/test/";
        var res = fileoperations_1.FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-common\\test.ts"));
    });
    test("RelToAbsPath 8", function () {
        var rel1 = "../../Unittests-common/test.ts";
        var curr1 = WS_ROOT + "/Unittests-tmp/test/hans.txt";
        var res = fileoperations_1.FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-common\\test.ts"));
    });
    test("RelToAbsPath 9", function () {
        var rel1 = normalizeSlash("..\\Unittests-common\\test.ts");
        var curr1 = WS_ROOT + "/Unittests-tmp/test/hans.txt";
        var res = fileoperations_1.FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\Unittests-common\\test.ts"));
    });
    test("RelToAbsPath, current file does not exist", function () {
        var rel1 = "../../Unittests-common/test.ts";
        var curr1 = WS_ROOT + "/Unittests-tmp/test/hans.tx";
        var res = fileoperations_1.FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
        assert.equal(res, "");
    });
    test("RelToAbsPath, text file does not exist", function () {
        var rel1 = "../../Unittests-common/test.ts1";
        var curr1 = WS_ROOT + "/Unittests-tmp/test/hans.txt";
        var res = fileoperations_1.FileOperations.getAbsoluteFromRelativePath(rel1, curr1);
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-common\\test.ts1"));
    });
    test("FuzzyPath, file has leading underscore (scss) and suffix but not in file", function () {
        var rel1 = "./test2";
        var curr1 = WS_ROOT + "/Unittests-tmp/test/test.scss";
        var res = fileoperations_1.FileOperations.getAbsolutePathFromFuzzyPath(rel1, curr1, "scss");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\_test2.scss"));
    });
    test("FuzzyPath, file has leading underscore (scss) and suffix but only suffix in file", function () {
        var rel1 = "./test3.scss";
        var curr1 = WS_ROOT + "/Unittests-tmp/test/test.scss";
        var res = fileoperations_1.FileOperations.getAbsolutePathFromFuzzyPath(rel1, curr1, "scss");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\_test3.scss"));
    });
    test("FuzzyPath, file has leading underscore (scss) and suffix but only suffix in file, relative path", function () {
        var rel1 = "../../Unittests-tmp/test/test3";
        var curr1 = WS_ROOT + "/Unittests-tmp/test/test.scss";
        var res = fileoperations_1.FileOperations.getAbsolutePathFromFuzzyPath(rel1, curr1, "scss");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\_test3.scss"));
    });
    test("FuzzyPath, file has leading underscore (scss) and suffix but only underscore, relative path", function () {
        var rel1 = "../../Unittests-tmp/test/_test3";
        var curr1 = WS_ROOT + "/Unittests-tmp/test/test.scss";
        var res = fileoperations_1.FileOperations.getAbsolutePathFromFuzzyPath(rel1, curr1, "scss");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\_test3.scss"));
    });
    test("Github #6: Open with line number", function (done) {
        // Remark: WS_ROOT + "/Unittests-tmp" folder must exists before running unit tests.  And the letter case of "Unittests-tmp" folder must be exact match.
        openFile.openDocument(WS_ROOT + "/Unittests-tmp/test/testcase.txt:2").then(function (value) {
            var _a, _b;
            assert.equal((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.fileName, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\testcase.txt"));
            // check line is positioned
            var selections = (_b = vscode.window.activeTextEditor) === null || _b === void 0 ? void 0 : _b.selections;
            if (selections === undefined) {
                assert.fail(null, null, "selection is undefined");
            }
            assert.equal(1, selections.length);
            assert.equal(1, selections[0].anchor.line);
            console.log(value);
            done();
        })["catch"](function (value) {
            console.log(value);
            done(value);
        });
    });
    test("Open with line number and column", function (done) {
        // Remark: WS_ROOT + "/Unittests-tmp" folder must exists before running unit tests.  And the letter case of "Unittests-tmp" folder must be exact match.
        openFile.openDocument(WS_ROOT + "/Unittests-tmp/test/testcase.txt:2:5").then(function (value) {
            var _a, _b;
            assert.equal((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.fileName, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\testcase.txt"));
            // check line and column is positioned
            var selections = (_b = vscode.window.activeTextEditor) === null || _b === void 0 ? void 0 : _b.selections;
            if (selections === undefined) {
                assert.fail(null, null, "selection is undefined");
            }
            assert.equal(1, selections.length);
            assert.equal(1, selections[0].anchor.line);
            assert.equal(4, selections[0].anchor.character);
            console.log(value);
            done();
        })["catch"](function (value) {
            console.log(value);
            done(value);
        });
    });
    test("resolvePath, resolve path to absolute", function () {
        var res = openFile.resolvePath(WS_ROOT + "/Unittests-tmp/test.ts", WS_ROOT + "/Unittests-common/test.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test.ts"));
    });
    test("resolvePath, resolve path to home", function () {
        var homeExistentFile = os.platform() === "win32" ? "~/Desktop/desktop.ini" :
            fs_1.existsSync("~/.bash_history") === true ? "~/.bash_history" : fs_1.existsSync("~/.zsh_history") ? "~/.bashrc" : "~/.zshrc";
        if (fs_1.existsSync(homeExistentFile)) {
            var res = openFile.resolvePath(homeExistentFile, WS_ROOT + "/Unittests-common/virtual-current-file");
            var pos = res.lastIndexOf(path_1.sep);
            assert.equal(pos !== -1 ? res.substr(pos) : res, normalizeSlash("\\" + path_1.basename(homeExistentFile)));
        }
    });
    test("resolvePath, resolve path to same folder, without file extension, implicit file extension", function () {
        var res = openFile.resolvePath("testcase2", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
    });
    test("resolvePath, resolve path to same folder, fuzzy, extraExtensions", function () {
        confighandler_1.ConfigHandler.Instance.Configuration.ExtraExtensionsForTypes = [{ name: "js", suffixes: ["ts"] }];
        var res = openFile.resolvePath("testcase2", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.js"); // Note .js instead of .ts here
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
    });
    test("resolvePath, resolve path to same folder, not in workspace, without file extension, not resolved to directory", function () {
        var res = openFile.resolvePath("../Unittests-tmp/test", WS_ROOT + "/Unittests-common/test.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test.ts"));
    });
    test("resolvePath, treat absolute path also as relative path, resolve path to same folder, without file extension", function () {
        var res = openFile.resolvePath("/testcase2", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
    });
    test("resolvePath, resolve path to workspace folder", function () {
        confighandler_1.ConfigHandler.Instance.Configuration.SearchPaths = [WS_ROOT + '/', WS_ROOT + "/Unittests-tmp/", WS_ROOT + "/Unittests-common/"];
        var res = openFile.resolvePath("test/hans.txt", WS_ROOT + "/Unittests-common/test.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\hans.txt"));
    });
    test("resolvePath, resolve path to parent folder", function () {
        var res = openFile.resolvePath("test.scss", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\test.scss"));
    });
    test("resolvePath, resolve path to workspace src folder, without file extension", function () {
        confighandler_1.ConfigHandler.Instance.Configuration.SearchPaths = [WS_ROOT + '/', WS_ROOT + "/Unittests-tmp/", WS_ROOT + "/Unittests-common/"];
        confighandler_1.ConfigHandler.Instance.Configuration.SearchSubFoldersOfWorkspaceFolders = ['lib/', 'src/'];
        var res = openFile.resolvePath("Class1", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\src\\Class1.ts"));
    });
    test("resolvePath, resolve path to searchPaths", function () {
        confighandler_1.ConfigHandler.Instance.Configuration.SearchPaths = [WS_ROOT + '/'];
        var res = openFile.resolvePath("Unittests-common/test", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-common\\test.ts"));
    });
    test("resolvePath, resolve path to 2nd item in searchPaths", function () {
        confighandler_1.ConfigHandler.Instance.Configuration.SearchPaths = [WS_ROOT + '/', WS_ROOT + '/Unittests-tmp/test/dir1'];
        var res = openFile.resolvePath("testcase2", WS_ROOT + "/Unittests-tmp/test.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
    });
    test("resolvePath, resolve path failure gives empty string, and won't resolve absolute path to folder", function () {
        var res = openFile.resolvePath(WS_ROOT + "/Unittests-tmp//test/dir1", WS_ROOT + "/Unittests-common/test.ts");
        assert.equal(res, "");
    });
    test("resolvePath, resolve path with path substitution by leadingPathMapping", function () {
        confighandler_1.ConfigHandler.Instance.Configuration.LeadingPathMapping = { '@dir1': 'test/dir1' };
        var res = openFile.resolvePath("@dir1/testcase2", WS_ROOT + "/Unittests-tmp/test.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
    });
    test("Github #9: resolvePath, resolve path with deletion by leadingPathMapping. Support open paths from git diff which starts with a/ or b/", function () {
        confighandler_1.ConfigHandler.Instance.Configuration.LeadingPathMapping = { 'a': '', 'b': '' };
        var res = openFile.resolvePath("a/test/testcase.txt", WS_ROOT + "/Unittests-tmp/test.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\testcase.txt"));
        res = openFile.resolvePath("b/test/testcase.txt", WS_ROOT + "/Unittests-tmp/test.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\testcase.txt"));
    });
    test("resolvePath, resolve path with path substitution, using prefix match with ending '*', by leadingPathMapping.", function () {
        confighandler_1.ConfigHandler.Instance.Configuration.LeadingPathMapping = { '$*': '*' };
        var res = openFile.resolvePath("$test/dir1/testcase2", WS_ROOT + "/Unittests-tmp/test.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
    });
    test("resolvePath, resolve path with path substitution, using prefix match with ending '*', by leadingPathMapping's deletion, removing path's leading variable", function () {
        confighandler_1.ConfigHandler.Instance.Configuration.LeadingPathMapping = { "$*": "*", "$*?": "" }; // "$*?" is a special case, same as "$*", but for non-duplicated keys
        var res = openFile.resolvePath("$basePath/test/dir1/testcase2", WS_ROOT + "/Unittests-tmp/src/Class1.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\test\\dir1\\testcase2.ts"));
    });
    test("resolvePath, resolve path with path substitution, using prefix match with ending '*', by leadingPathMapping, removing '$' for single variable", function () {
        confighandler_1.ConfigHandler.Instance.Configuration.LeadingPathMapping = { "$*": "*", "$*?": "" }; // "$*?" is a special case, same as "$*", but for non-duplicated keys. Later value in this leadingPathMapping has higher priority.  E.g. such that { "abc": "...", "abc/def": "..." } works better in natural order
        var res = openFile.resolvePath("$Class1", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\src\\Class1.ts"));
    });
    test("A multi-lined selection should split, and support cutting :content from lines of grep/ack output like file:line:column:content", function (done) {
        var line1 = WS_ROOT + '/Unittests-tmp/test/testcase.txt:4:3:the forth line\n';
        var line2 = WS_ROOT + '/Unittests-tmp/test/dir1/testcase2.ts:1:line 1\n';
        var content = line1 + line2;
        vscode.workspace.openTextDocument({ content: content }).then(function (doc) {
            var anchor = new vscode.Position(0, 0);
            var active = new vscode.Position(2, 0);
            var files = openFile.getWordRanges(new vscode.Selection(anchor, active), doc);
            if (files === undefined) {
                assert.fail(null, null, "files are undefined");
            }
            assert.equal(2, files === null || files === void 0 ? void 0 : files.length);
            assert.equal(WS_ROOT + '/Unittests-tmp/test/testcase.txt:4:3', files[0]);
            assert.equal(WS_ROOT + '/Unittests-tmp/test/dir1/testcase2.ts:1', files[1]);
            done();
        }, function (reason) {
            done("Cannot open untitled text: " + reason.message);
        });
    });
    test("Gitlab issue 23, open file which has no suffix at all", function () {
        var res = openFile.resolvePath("../../src/Class12", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\src\\Class12"));
    });
    test("Gitlab issue 23, open file which has no suffix at all, added path to search list", function () {
        confighandler_1.ConfigHandler.Instance.Configuration.SearchPaths = [WS_ROOT + '/', WS_ROOT + '/Unittests-tmp/src'];
        var res = openFile.resolvePath("Class12", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\src\\Class12"));
    });
    test("Gitlab issue 23, open file which has no suffix at all, added path to search list and subfolders", function () {
        confighandler_1.ConfigHandler.Instance.Configuration.SearchPaths = [WS_ROOT + '/', WS_ROOT + '/Unittests-tmp'];
        confighandler_1.ConfigHandler.Instance.Configuration.SearchSubFoldersOfWorkspaceFolders = ['lib/', 'src/'];
        var res = openFile.resolvePath("Class12", WS_ROOT + "/Unittests-tmp/test/dir1/testcase2.ts");
        assert.equal(res, normalizeSlash(WS_ROOT + "\\Unittests-tmp\\src\\Class12"));
    });
});
