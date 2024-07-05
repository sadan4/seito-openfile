## Release Notes

### 2.2.2
- fixed some namespace trouble in open-vsx

### 2.2.1
- fixed environment variable detection

### 2.2.0
- You can now open a folder with the default file manager, if the string is a folder path

### 2.1.0
- Extended environment variable detection to windows compatible syntax, i.e. %var%

### 2.0.1
- Internal code management
- extension now is a bundled extension

### 2.0.0
- Added the ability to open a file with its default external application
  - a new configuration date has was added to set the default command for Linux environments `seito-openfile.defaultLinuxOpenCommand` is set to `xdg-open`
- You can now open file string which include environment variables.
  i.e. `$HOME/documents/myfile.txt`

### 1.8.10
- fixed bug in configuration where the type was incorrect (thanks @drepamig)

### 1.8.9
- fixed open file with Non-BMP characters

### 1.8.8
- fixed gitlab issue #23:
   open a file which has no extension

### 1.8.7
- changed the minimum required vscode version 1.25.0

### 1.8.6
- can now open symlinked files (thanks to Bryan Harris)
- changed configuration structure of addition suffixes - it is now an array of objects
```
defaults: [
  {
    name: "js",
    suffixes: [
      "js",
      "jsx"
    ]
    ...
  }
]
```

### 1.8.5
- moved repository to gitlab

### 1.8.4
- changes related to security issues of library event-stream

### 1.8.3
- added configuration for open file in new persistent tab

**New Configuration**
```
seito-openfile.openNewTab
```

### 1.8.2
- added extension icon

### 1.8.1
- minor bugfix in handling workspace folders (@johnnytemp)

### 1.8.0

**Thanks to @johnnytemp**
- If file not found, default to trigger VS Code's "Quick Open" input box with pre-filled file path (for custom lookup or lookup of folder).
- New setting "seito-openfile.leadingPathMapping" to rewrite leading path segments.
- Add key binding Alt + P
- leadingPathMapping's path rewrite also apply to Quick Open's text when file not found.
- a mapping in leadingPathMapping is not applied if the whole file string is mapped to empty string.
- support both delete "$var" from "$var/path/to/sth" and delete "$" from "$var" by setting leadingPathMapping = `{ "$*": "*", "$*?": "" }`. ("$\*?" is a special syntax same as "$\*", but to avoid key duplication not allowed in syntax. Remark: later value, higher priority, which is the "$\*?": "")


### 1.7.0

**Thanks to @johnnytemp** for his great work on the following features:
- multiple selections can now open multiple files
- open files defined as namespace ```use namespace\Class```
- go to position now with columns ```file:line:column```
- search relative to sub-folders under workspace folders (mainly under the "current" workspace folder, e.g. sub-folders like lib, src, class, public, vendor, etc)
- allow lookup the text string relative to all folder levels, from current document's folder, up to the embedding workspace folder (when current document is in a workspace folder).
(First file found is opened immediately. Thus, relative path to document's path is still highest priority)

**New Configuration**
```
seito-openfile.lookupTildePathAlsoFromWorkspace
seito-openfile.searchSubFoldersOfWorkspaceFolders
```

**Deprecated**
```
seito-openfile.extensions
```
**use** 
```
seito-openfile.extraExtensionsForTypes
```

### 1.6.0

- added a configuration for file extensions (thanks to @jackfranklin)
```
seito-openfile.extensions: ["scss", "jsx", "js]
```
  So you are able to open a file that has no extension written in the text like a scss import
```
@import "folder/style"
```

### 1.5.1

- fixed the broken open file at line functionality (thanks to @stephanedr)

### 1.5.0

- open files in scss files written in shortened way
```
@import "folder/style"
```
Where the file ```style``` exists on filesystem with the name ```_style.scss``` (thanks to @dutchwebworks)

### 1.4.0

- open the string that is selected in the document
- you can now open multiple selections at once

### 1.3.4

- fixed windows absolute path and line number

### 1.3.3

- updated readme.

### 1.3.2

- Fix: could not open file if string is last line of editor text (thanks to @beatscode)

### 1.3.1

- added ability to read string with line number and open it at that line (thanks to @beatscode)

### 1.2.5

- added CHANGELOG.md file for better documentation

### 1.2.4

- avoid exception if no editor instance exists in current window

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


Enjoy!
