import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    const snippetsProvider = new SnippetsTreeProvider(context);
    vscode.window.registerTreeDataProvider('snippetsView', snippetsProvider);

    // Command to insert snippet when a snippet is clicked in the tree view
    context.subscriptions.push(vscode.commands.registerCommand('snippetsView.insertSnippet', (snippetItem: SnippetItem) => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Ensure the body is an array of strings 
            const snippetBody = Array.isArray(snippetItem.body) ? snippetItem.body.join('\n') : snippetItem.body;
            editor.insertSnippet(new vscode.SnippetString(snippetBody));
        }
    }));
}


class SnippetsTreeProvider implements vscode.TreeDataProvider<SnippetItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SnippetItem | undefined | null | void> = new vscode.EventEmitter<SnippetItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SnippetItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private snippets: SnippetItem[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.loadSnippets();
    }

    private loadSnippets() {
        const snippetsPath = path.join(this.context.extensionPath, 'snippets', 'snippets.code-snippets.json');
        try {
            const fileContent = fs.readFileSync(snippetsPath, 'utf-8');
            const snippetsJson = JSON.parse(fileContent);

            this.snippets = Object.keys(snippetsJson).map(snippetKey => {
                const snippet = snippetsJson[snippetKey];
                return new SnippetItem(snippetKey, snippet.description || 'No description available', snippet.body); 
            });

            this._onDidChangeTreeData.fire();
        } catch (error) {
            console.error('Error reading snippets file:', error);
        }
    }

    getTreeItem(element: SnippetItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: SnippetItem): SnippetItem[] {
        if (!element) {
            return this.snippets; 
        }
        return []; 
    }
}

class SnippetItem extends vscode.TreeItem {
    constructor(public readonly label: string, public readonly description: string, public readonly body: string | string[]) {
        super(label, vscode.TreeItemCollapsibleState.None);
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

export function deactivate() {}