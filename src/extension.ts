// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import { HackClubViewProvider } from './hackClubViewProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const provider = new HackClubViewProvider(context.extensionUri, () => context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			HackClubViewProvider.viewType,
		  provider
		)
	  );

	// Command has been defined in the package.json file
	// Provide the implementation of the command with registerCommand
	// CommandId parameter must match the command field in package.json
	let openWebView = vscode.commands.registerCommand('somTimer.openview', () => {
		vscode.commands.executeCommand("workbench.view.extension.somTimer")
	});

	context.subscriptions.push(openWebView);
}

// this method is called when your extension is deactivated
export function deactivate() {}
