import { commands, workspace, ExtensionContext, window, TextDocumentShowOptions, Uri, ViewColumn, TextDocument } from 'vscode';

const config = workspace.getConfiguration();

const isManualMode = !!config.get("auto-open-css-modules.manualMode");
const openAsPreview = !!config.get("auto-open-css-modules.openAsPreview");

export function activate(context: ExtensionContext): void {

    const lastOpenedCssFiles: Set<string> = new Set();

    function shouldProcess (doc: TextDocument) {
        return doc &&
            (doc.languageId === "javascript" ||
            doc.languageId === "javascriptreact" ||
            doc.languageId === "typescript" ||
            doc.languageId === "typescriptreact");
    }

    // Main command that opens imported CSS found in a file.
    function openAllCssImports (document: TextDocument) {
        if (!(document &&
                document.uri)) {
            return;
        }
        const textDocumentShowOptions: TextDocumentShowOptions = {
            preserveFocus: true,
            preview: openAsPreview,
            viewColumn: ViewColumn.Beside
        };
        const editorText = document.getText();
        const regex = /import(?:["'\s]*([\w*{}\n\r\t, ]+)from\s*)?["'\s]+(.*[@\w_-]+(\.css|\.scss|\.sass))["'\s].*;$/gm;
        let importMatch: RegExpExecArray | null;
        const newCssFiles: Array<string> = [];
        while (
            (importMatch = regex.exec(editorText)) !== null
        ) {
            if (importMatch[2]) {
                const cssPath = importMatch[2];
                // If falsy, user probably just closed the auto opened files
                if (!lastOpenedCssFiles.has(cssPath)) {
                    newCssFiles.push(cssPath);
                    window.showTextDocument(Uri.joinPath(document.uri, "..", cssPath), textDocumentShowOptions)
                        .then(() => {}, (e) => {console.error(e);});
                }
            }
        }
        lastOpenedCssFiles.clear();
        newCssFiles.forEach((file) => {
            lastOpenedCssFiles.add(file);
        });
    }

    const openCssModulesCommand = commands.registerTextEditorCommand(
        'auto-open-css-modules.openCssModules',
        function (editor) {
            if (editor) {
                // force clear cache
                openAllCssImports(editor.document);
            }
        }
    );
    context.subscriptions.push(openCssModulesCommand);

    // Setup automation of opening imports
    if (!isManualMode) {
        // First run
        const editor = window.activeTextEditor;
        if (editor?.document &&
            shouldProcess(editor.document)) {
            openAllCssImports(editor.document);
        }

        window.onDidChangeActiveTextEditor((e) => {
            const doc = e?.document;
            if (doc && shouldProcess(doc)) {
                openAllCssImports(doc);
            }
        });
    }
}

export function deactivate(): void {}
