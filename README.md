# Auto Open CSS Modules 

VSCode extension that parses JS/TS files and opens any imported CSS modules (ES6). Can optionally be run automatically on JS/TS file open.

It is designed for [React-style](https://create-react-app.dev/docs/adding-a-css-modules-stylesheet/) ES6 CSS imports.
This extension is not tested, but is a (easily?) grokable single file. Feel free to contribute!

[Marketplace Link](https://marketplace.visualstudio.com/items?itemName=mjmaurer.auto-open-css-modules)

## Settings Options

This extension contributes the following variables to the [settings](https://code.visualstudio.com/docs/customization/userandworkspace).
All boolean options default to false:

- `auto-open-css-modules.manualMode`: Boolean. If true, don't run open command automatically on JS/TS file open.
- `auto-open-css-modules.focusOnCss`: Boolean. If true, focus on CSS file when opened.
- `auto-open-css-modules.openAsPreview`: Boolean. If true, open the matched files in preview mode. This has the benefit of decluttering the side editor, but only the last imported file will be previewed.
- `auto-open-css-modules.viewColumn` - Specifies where the CSS files should open. See the [VSCode API's ViewColumn](https://code.visualstudio.com/api/references/vscode-api#ViewColumn) for valid values (`One` instead of `1`). Default is `Beside`.

## Commands:

This extension contributes the following commands to the Command palette.

- `Open Imported CSS Modules` (auto-open-css-modules.openCssModules): Parse the currently focused JS/TS file and open any imported CSS files. 