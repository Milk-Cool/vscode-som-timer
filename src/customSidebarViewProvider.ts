import * as vscode from "vscode";
import * as fs from "fs";

export class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vscodeSidebar.openview";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri, private readonly _getExtensionContext: () => vscode.ExtensionContext) {}

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ): Promise<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = await this.getHtmlContent(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(async msg => {
      if(msg.command === "alert")
        return vscode.window.showInformationMessage(msg.msg);
      if(msg.command === "getCurrentlyHacking") {
        const f = await fetch("https://hackatime.hackclub.com/static_pages/currently_hacking");
        const t = await f.text();
        return webviewView.webview.postMessage({
          command: "currentlyHacking",
          currentlyHacking: t
        });
      }
      if(msg.command !== "saveKey") return;
      await this._getExtensionContext().secrets.store("hackatimeKey", msg.key);
    });
  }

  private async getHtmlContent(webview: vscode.Webview): Promise<string> {
    // Get the local path to main script run in the webview,
    // then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "public", "main.js")
    );

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "public", "style.css")
    );

    const indexUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "public", "index.html"));

    return fs.readFileSync(indexUri.fsPath, "utf-8")
      .replace(/\$\{script}/g, `${scriptUri}`)
      .replace(/\$\{style}/g, `${styleUri}`)
      .replace(/\$\{key}/g, `${await this._getExtensionContext().secrets.get("hackatimeKey") || ""}`);
  }
}
