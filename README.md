# coc-ruby-syntax-tree

> fork from a [ruby-syntax-tree/vscode-syntax-tree](https://github.com/ruby-syntax-tree/vscode-syntax-tree)

[coc.nvim](https://github.com/neoclide/coc.nvim) support for the [syntax_tree](https://github.com/ruby-syntax-tree/syntax_tree) gem

## DEMO

https://user-images.githubusercontent.com/188642/200471161-d9785784-6154-4919-8b18-0427f0febe14.mp4

## **!!Note & Warning!!**

I don't use ruby regularly, so if you like ruby, please refer to this repository and create `coc-ruby-syntax-tree` by yourself.

## Install

You need to have [coc.nvim](https://github.com/neoclide/coc.nvim) installed for this extension to work.

**e.g. vim-plug**:

```vim
Plug 'yaegassy/coc-ruby-syntax-tree', {'do': 'yarn install --frozen-lockfile'}
```

## Configuration options

- `syntaxTree.enable`: Enable coc-ruby-syntax-tree extension, default: `true`
- `syntaxTree.advanced.commandPath`: Absolute path to stree executable, default: `""`
- `syntaxTree.additionalPlugins`: Registers [extra behaviors](https://github.com/ruby-syntax-tree/syntax_tree#plugins) with the language server, default: `[]`
- `syntaxTree.ignoreFiles`: A glob pattern of files to ignore for formatting, default: `""`
- `syntaxTree.printWidth`: The width to be used when formatting code, default: `null`
- `syntaxTree.singleQuotes`: Uses single-quoted strings when possible, default: `false`
- `syntaxTree.trailingComma`: Adds a trailing comma to multi-line array literals, hash literals, and method parameters, default: `false`

## Commands

- `syntaxTree.start`: Syntax Tree: Start
- `syntaxTree.stop`: Syntax Tree: Stop
- `syntaxTree.restart`: Syntax Tree: Restart
- `syntaxTree.showOutputChannel`: Syntax Tree: Show Output Channel

## Thanks

- [ruby-syntax-tree/syntax_tree](https://github.com/ruby-syntax-tree/syntax_tree)
- [ruby-syntax-tree/vscode-syntax-tree](https://github.com/ruby-syntax-tree/vscode-syntax-tree)

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
