# Open file

This extension enables the user to open a file under the current cursor position. Just right-click on a pathname within a open document and select the ```open file under cursor``` option.
If the file is found by vscode then it will open a new tab with this file.
If the string is has an tailing number separated by a colon (i.e. `:23`) it will open the file at the specified line number.
It is also possible to select one or more text segments in the document and open them. 

## Example

You have a document, containing some text, that exists in a folder, say ```c:\Users\guest\Documents\myfile.txt```.
In that file the path strings could look like as follows:

```
[...]
 c:\Users\guest\Documents\Temp\stuff.txt
[...]
 "..\..\administrator\readme.txt"
[...]
 "..\user\readme.txt:33"
[...]
```

With this extension you can right-click on such a path and choose ```open file under cursor``` and VSCode will open a new tab with that file.

Relative paths are always related to the currently open document.
