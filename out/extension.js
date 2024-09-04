"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
function activate(context) {
    const snippetsProvider = new SnippetsTreeProvider(context);
    vscode.window.registerTreeDataProvider('snippetsView', snippetsProvider);
    // Command to insert snippet when a snippet is clicked in the tree view
    context.subscriptions.push(vscode.commands.registerCommand('snippetsView.insertSnippet', (snippetItem) => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Ensure the body is an array of strings 
            const snippetBody = Array.isArray(snippetItem.body) ? snippetItem.body.join('\n') : snippetItem.body;
            editor.insertSnippet(new vscode.SnippetString(snippetBody));
        }
    }));
}
class SnippetsTreeProvider {
    constructor(context) {
        this.context = context;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.snippets = [];
        this.loadSnippets();
    }
    loadSnippets() {
        const snippetsPath = path.join(this.context.extensionPath, 'snippets', 'snippets.code-snippets.json');
        try {
            const fileContent = fs.readFileSync(snippetsPath, 'utf-8');
            const snippetsJson = JSON.parse(fileContent);
            this.snippets = Object.keys(snippetsJson).map(snippetKey => {
                const snippet = snippetsJson[snippetKey];
                return new SnippetItem(snippetKey, snippet.description || 'No description available', snippet.body);
            });
            this._onDidChangeTreeData.fire();
        }
        catch (error) {
            console.error('Error reading snippets file:', error);
        }
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return this.snippets;
        }
        return [];
    }
}
class SnippetItem extends vscode.TreeItem {
    constructor(label, description, body) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.description = description;
        this.body = body;
        this.tooltip = `${this.label} - ${this.description}`;
        this.description = this.description;
        // Add command to insert snippet when clicked
        this.command = {
            command: 'snippetsView.insertSnippet',
            title: 'Insert Snippet',
            arguments: [this] // Pass the SnippetItem instance to the command
        };
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map