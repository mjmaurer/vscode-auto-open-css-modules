import { commands, workspace, ExtensionContext, window, TextDocumentShowOptions, Uri, ViewColumn, TextDocument } from 'vscode';

const config = workspace.getConfiguration();

const isManualMode = !!config.get("auto-open-css-modules.manualMode");
const openAsPreview = !!config.get("auto-open-css-modules.openAsPreview");
const focusOnCss = !!config.get("auto-open-css-modules.focusOnCss");

const whereToOpenString: keyof typeof ViewColumn = (config.get<string>("auto-open-css-modules.viewColumn") || "Beside") as keyof typeof ViewColumn;
const whereToOpen: ViewColumn = ViewColumn[whereToOpenString] || ViewColumn.Beside;

export function activate(context: ExtensionContext): void {

    // Cache of last opened files.
    // Used to avoid auto-opening just closed files.
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
            preserveFocus: !focusOnCss,
            preview: openAsPreview,
            viewColumn: whereToOpen
        };
        const editorText = document.getText();
        const importRegex = /import(?:["'\s]*([\w*{}\n\r\t, ]+)from\s*)?["'\s]+(.*[@\w_-]+(\.css|\.scss|\.sass))["'\s].*;$/gm;
        let importMatch: RegExpExecArray | null;
        const newlyOpenedCssFiles: Array<string> = [];
        while (
            (importMatch = importRegex.exec(editorText)) !== null
        ) {
            const cssPath = importMatch[2];
            if (cssPath && !lastOpenedCssFiles.has(cssPath)) {
                newlyOpenedCssFiles.push(cssPath);
                window.showTextDocument(Uri.joinPath(document.uri, "..", cssPath), textDocumentShowOptions)
                    .then(() => {}, (e) => {console.error(e);});
            }
        }
        lastOpenedCssFiles.clear();
        newlyOpenedCssFiles.forEach((file) => {
            lastOpenedCssFiles.add(file);
        });
    }

    const openCssModulesCommand = commands.registerTextEditorCommand(
        'auto-open-css-modules.openCssModules',
        function (editor) {
            if (editor) {
                lastOpenedCssFiles.clear(); // force clear cache for manual run
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
