## Release Notes

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