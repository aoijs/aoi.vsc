// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { fetch } from "undici";
import path = require("path");
import * as Prism from "prismjs";
let functions: any;
let completionItems: vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
> = [];

let exportCommandOptions: vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
> = [];

const exportCommandOptionsList = ["basic", "interaction", "awaited", "ready"];

for (const option of exportCommandOptionsList) {
    const completionItem = new vscode.CompletionItem(
        option,
        vscode.CompletionItemKind.Constant,
    );
    completionItem.detail = `${option} Command`;
    exportCommandOptions.push(completionItem);
}
console.log(exportCommandOptions);
(async () => {
    functions = await (
        await fetch("https://repulsive-fatigues-dove.cyclic.app/functions")
    ).json();

    for (const [key, value] of Object.entries<any>(functions?.functions)) {
        const completionItem = new vscode.CompletionItem(
            key,
            vscode.CompletionItemKind.Function,
        );
        completionItem.detail = value.description;
        completionItem.documentation = new vscode.MarkdownString(
            `**${key}**\n\n**Description:** ${value.description}\n\n**Type:** ${
                value.type
            }\n\n**Brackets:** ${value.brackets}\n\n**Optional:** ${
                value.optional
            }\n\n**Fields:** ${
                value.fields
                    .map((x: { name: any; type: any; required: any }) => {
                        return `\n- ${x.name}: ${x.type} (${
                            x.required ? "Required" : "Optional"
                        })`;
                    })
                    .join("") || "None"
            }\n\n**Version:** ${value.version}\n\n`,
        );
        completionItem.insertText = new vscode.SnippetString(
            `${key.replace("$", "")}${value.brackets ? "[$2]" : ""}`,
        );
        console.log(completionItem);
        completionItems.push(completionItem);
    }
})();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "aoijs" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand("aoijs.helloWorld", () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage("Hello World from Aoi.js!");
    });

    context.subscriptions.push(disposable);
    // hover over the function to see the description for aoijs
    let hoverInfo = vscode.languages.registerHoverProvider("aoi", {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(
                position,
                /\$[a-zA-Z0-9_]+/,
            );

            const word = document.getText(range);

            const func = Object.keys(functions?.functions)?.find(
                (f: any) => f === word,
            );

            if (!func) {
                return;
            }

            const { description, type, brackets, optional, fields, version } =
                functions.functions[func];

            const markdownString = new vscode.MarkdownString();
            markdownString.appendMarkdown(`**${func}**\n\n`);
            markdownString.appendMarkdown(
                `**Description:** ${description}\n\n`,
            );
            markdownString.appendMarkdown(`**Type:** ${type}\n\n`);
            markdownString.appendMarkdown(`**Brackets:** ${brackets}\n\n`);
            markdownString.appendMarkdown(`**Optional:** ${optional}\n\n`);
            markdownString.appendMarkdown(
                `**Fields:** ${
                    fields
                        .map((x: { name: any; type: any; required: any }) => {
                            return `\n- ${x.name}: ${x.type} (${
                                x.required ? "Required" : "Optional"
                            })`;
                        })
                        .join("") || "None"
                }\n\n`,
            );

            markdownString.appendMarkdown(`**Version:** ${version}\n\n`);

            return new vscode.Hover(markdownString);
        },
    });

    context.subscriptions.push(hoverInfo);

    const autoCompleteFunctions =
        vscode.languages.registerCompletionItemProvider(
            "aoi",
            {
                provideCompletionItems(document, position, token, context) {
                    const linePrefix = document
                        .lineAt(position)
                        .text.substr(0, position.character)
                        .trim();
                    console.log(linePrefix);
                    if (!linePrefix.startsWith("$")) {
                        return undefined;
                    }
                    console.log("hello");

                    return completionItems;
                },
            },
            "$",
        );

    const autoCompleteExportCommandOptions =
        vscode.languages.registerCompletionItemProvider(
            "aoi",
            {
                provideCompletionItems(document, position, token, context) {
                    const range = new vscode.Range(
                        position.with(undefined, 0),
                        position,
                    );
                    const line = document.getText(range);
                    console.log(line);
                    if (!line) {
                        return undefined;
                    }
                    if (!line.match(/\[\s*exportCommand:/)) {
                        return undefined;
                    }
                    console.log("hello");

                    return exportCommandOptions;
                },
            },
            ":",
        );

    context.subscriptions.push(autoCompleteExportCommandOptions);

    context.subscriptions.push(autoCompleteFunctions);
            let panel: vscode.WebviewPanel | undefined = undefined;
    const commandTranspileCode = vscode.commands.registerCommand(
        "aoijs.transpileCode",
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return vscode.window.showErrorMessage("No editor is open");
            }
            const showIn = editor.viewColumn ?? vscode.ViewColumn.Beside;
            const document = editor.document;
            const selection = editor.selection;

            const text = document.getText(selection);
            console.log({ text });
            const res = (await (
                await fetch(
                    "https://repulsive-fatigues-dove.cyclic.app/transpile",
                   // "http://localhost:3000/transpile",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            code: text.trim(),
                        }),
                        headers: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            "Content-Type": "application/json",
                        },
                    },
                )
            ).json()) as { result: string; error: boolean };
            console.log(res);
            const snippet = Prism.highlight(res.result,Prism.languages.javascript,"javascript");
            console.log(snippet);
            console.log({panel});
            if(!panel) {
            panel = vscode.window.createWebviewPanel(
                "javascript",
                "Aoi.js",
                vscode.ViewColumn.Beside,
                {},
            );
            panel.iconPath = vscode.Uri.file("/icons/my-icon.svg");

            panel.webview.html = getWebviewContent(
                snippet
            );
            } else {
                //@ts-ignore
                panel.webview.html = getWebviewContent(
                    snippet
                );
            }
            panel.onDidDispose(() => {
                panel = undefined;
            });
        },
        
    );

    context.subscriptions.push(commandTranspileCode);
}

// hover over the function to see the description

// this method is called when your extension is deactivated
export function deactivate() {}

function getWebviewContent(data: string) {
    return `  <html>
    <head>
      <style>
      /*
 * Synthwave '84 Theme originally by Robb Owen [@Robb0wen] for Visual Studio Code
 * Demo: https://marc.dev/demo/prism-synthwave84
 *
 * Ported for PrismJS by Marc Backes [@themarcba]
 */

code[class*="language-"],
pre[class*="language-"] {
	color: #f92aad;
	text-shadow: 0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3;
	background: none;
	font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
	font-size: 1em;
	text-align: left;
	white-space: pre;
	word-spacing: normal;
	word-break: normal;
	word-wrap: normal;
	line-height: 1.5;

	-moz-tab-size: 4;
	-o-tab-size: 4;
	tab-size: 4;

	-webkit-hyphens: none;
	-moz-hyphens: none;
	-ms-hyphens: none;
	hyphens: none;
}

/* Code blocks */
pre[class*="language-"] {
	padding: 1em;
	margin: .5em 0;
	overflow: auto;
}

:not(pre) > code[class*="language-"],
pre[class*="language-"] {
	background-color: transparent !important;
	background-image: linear-gradient(to bottom, #2a2139 75%, #34294f);
}

/* Inline code */
:not(pre) > code[class*="language-"] {
	padding: .1em;
	border-radius: .3em;
	white-space: normal;
}

.token.comment,
.token.block-comment,
.token.prolog,
.token.doctype,
.token.cdata {
	color: #8e8e8e;
}

.token.punctuation {
	color: #ccc;
}

.token.tag,
.token.attr-name,
.token.namespace,
.token.number,
.token.unit,
.token.hexcode,
.token.deleted {
	color: #e2777a;
}

.token.property,
.token.selector {
	color: #72f1b8;
	text-shadow: 0 0 2px #100c0f, 0 0 10px #257c5575, 0 0 35px #21272475;
}

.token.function-name {
	color: #6196cc;
}

.token.boolean,
.token.selector .token.id,
.token.function {
	color: #fdfdfd;
	text-shadow: 0 0 2px #001716, 0 0 3px #03edf975, 0 0 5px #03edf975, 0 0 8px #03edf975;
}

.token.class-name {
	color: #fff5f6;
	text-shadow: 0 0 2px #000, 0 0 10px #fc1f2c75, 0 0 5px #fc1f2c75, 0 0 25px #fc1f2c75;
}

.token.constant,
.token.symbol {
	color: #f92aad;
	text-shadow: 0 0 2px #100c0f, 0 0 5px #dc078e33, 0 0 10px #fff3;
}

.token.important,
.token.atrule,
.token.keyword,
.token.selector .token.class,
.token.builtin {
	color: #f4eee4;
	text-shadow: 0 0 2px #393a33, 0 0 8px #f39f0575, 0 0 2px #f39f0575;
}

.token.string,
.token.char,
.token.attr-value,
.token.regex,
.token.variable {
	color: #f87c32;
}

.token.operator,
.token.entity,
.token.url {
	color: #67cdcc;
}

.token.important,
.token.bold {
	font-weight: bold;
}

.token.italic {
	font-style: italic;
}

.token.entity {
	cursor: help;
}

.token.inserted {
	color: green;
}

.lol {
    color: #8700ff
}
      </style>
    </head>
    <body>
      <pre>${data}</pre>
      <script>
      
      </script>
    </body>
  </html>`;
}
