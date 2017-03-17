# Open file

This extension enables the user to open a file under the current cursor position. Just right-click on a pathname within a open document and select the ```open file under cursor``` option.
If the file is found by vscode then it will open a new tab with this file.

## Example

You have a document, containing some text, that exists in a folder, say ```c:\Users\guest\Documents\myfile.txt```.
In that file the path strings could look like as follows:

```
[...]
 c:\Users\guest\Documents\Temp\stuff.txt
[...]
 "..\..\administrator\readme.txt"
[...]
```

With this extension you can right-click on such a path and choose ```open file under cursor``` and VSCode will open a new tab with that file.

Relative paths are always related to the currently open document.

## Release Notes

### 1.2.3

- did some minor documentation refinements

### 1.2.2

- removed context menu from output window

### 1.2.1

- added some project specific information into the package.json

### 1.2.0

- added configuration of word bound for path string detection
the default value is ```[\s\<\>\"\'#]``` and can be changed with the configuration parameter
```
seito-openfile.wordbound: "[\\s\\<\\>\\\"\\\'#]"
```

### 1.1.0

- added functionality to use relative path related to the currently open file
- ```~``` at the beginning of a path string indicates a home dir related path

### 1.0.0

- Initial release
