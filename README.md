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

Relative paths are relative to the these folders (in order):

1. Currently opened document's folder, and

    (if it is within a workspace folder) the document's parent folders (up to the workspace folder).

2. All workspace folders, and their sub-folders listed in the option `seito-openfile.searchSubFoldersOfWorkspaceFolders`.

3. All search paths in the option `seito-openfile.searchPaths`.

Remarks:
- Absolute paths `/...` (`/` or `\`), if not found, are search like relative paths too.
- If `~/...` paths not found from user's home, the step 2 of "Relative paths" is searched if option `seito-openfile.lookupTildePathAlsoFromWorkspace` is true.
