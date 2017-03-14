# seito-openfile

This extension enables the user to open a file under the current cursor position. Just right-click on a pathname within a open document and select the ```open file under cursor``` option.
If the file is found by vscode then it will open a new tab with this file.

## Known Issues

### 1.0.0
The bounds of a complete path string may not always work correct. In this version only ```\s\<\>\"\'#``` are valid characters to limit the string. This will be a configuration feature of a future version.

## Release Notes

### 1.0.0

Initial release
