import * as path from "path";
import * as vscode from "vscode";
import { WebSocket } from "ws";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
type AdminMessage = {
  type: "command" | "update-file" | "prompt-start" | "prompt-end";
  content: string;
  path?: string;
  callbackId?: string;
  p_name?: string;
};

type VscodeMessagePayload = {
  event: "vscode_diff";
  diff: string;
};

async function getGitDiff(): Promise<string> {
  try {
    const { stdout } = await execAsync("git diff", {
      cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath,
    });
    return stdout;
  } catch (err) {
    console.error("Git diff failed:", err);
    return "";
  }
}

async function getPubKey(): Promise<string> {
  try {
    const { stdout } = await execAsync("anchor keys list", {
      cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath,
    });
    return stdout;
  } catch (err) {
    console.error("pub key failed:", err);
    return "";
  }
}

async function runInitAndRestructure(name: string): Promise<string> {
  const cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!cwd) {
    console.error("No workspace folder found.");
    return "";
  }

  try {
    // Step 1: Initialize the Anchor project
    await execAsync(`anchor init ${name}`, { cwd });

    // Step 2: Move files (including hidden ones) up and remove the folder
    const moveScript = `
      shopt -s dotglob;
      mv ${name}/* ${name}/.* . 2>/dev/null;
      rmdir ${name};
      git add .;
      shopt -u dotglob;
    `;
    const { stdout } = await execAsync(moveScript, { cwd });

    return stdout;
  } catch (err) {
    console.error("Anchor init and restructure failed:", err);
    return "";
  }
}

async function ensureFileExists(filePath: string, content: string = "") {
  try {
    const uri = vscode.Uri.file(filePath);

    // Check if the directory exists, create if not
    const dirPath = path.dirname(filePath);
    try {
      await vscode.workspace.fs.stat(vscode.Uri.file(dirPath));
    } catch {
      // Directory doesn't exist, create it
      await vscode.workspace.fs.createDirectory(vscode.Uri.file(dirPath));
    }

    // Check if file exists
    try {
      await vscode.workspace.fs.stat(uri);
    } catch {
      // File doesn't exist, create it
      await vscode.workspace.fs.writeFile(uri, Buffer.from(content, "utf8"));
    }

    return uri;
  } catch (error) {
    vscode.window.showErrorMessage(`Error ensuring file exists: ${error}`);
    throw error;
  }
}

function initWs(context: vscode.ExtensionContext) {
  // change to something else
  const ws = new WebSocket("ws://host.docker.internal:9093");

  ws.onerror = (e: any) => {
    console.log("error");
    console.log(e);
    console.log(JSON.stringify(e));
  };

  ws.onopen = () => {
    ws.send(
      JSON.stringify({
        event: "subscribe",
        data: null,
      })
    );
  };

  ws.onmessage = async (e: any) => {
    const data: AdminMessage = JSON.parse(e.data);
    console.log("data");
    console.log(data);
    if (data.type === "command") {
      vscode.window.showInformationMessage("Received command event");
      vscode.commands.executeCommand(
        "extension.sendToAiTerminal",
        data.content
      );
    }

    if (data.type === "update-file") {
      vscode.window.showInformationMessage("Received update-file event");
      const fileUri = await ensureFileExists(data.path!, data.content);

      const document = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(document);

      const edit = new vscode.WorkspaceEdit();
      const range = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(document.lineCount, 0)
      );

      edit.replace(document.uri, range, data.content);
      await vscode.workspace.applyEdit(edit);
    }

    if (data.type === "prompt-start") {
      vscode.window.showInformationMessage("Received prompt-start event");
      const terminals = vscode.window.terminals;
      if (terminals.length > 0) {
        const activeTerminal = vscode.window.activeTerminal;
        activeTerminal?.sendText("\x03");
      }
      // get response from git diff command silently and forward it via ws to the server
      try {
        const diff = await getGitDiff(); // Replace with exec-based implementation
        vscode.window.showInformationMessage(`Git diff length: ${diff.length}`);

        const ans = await runInitAndRestructure(data.p_name!);
        vscode.window.showInformationMessage(
          `anchor project initiated ${ans.length}`
        );

        const pubKey = await getPubKey();

        ws.send(
          JSON.stringify({
            event: "vscode_diff",
            diff,
            callbackId: data.callbackId,
            pubkey: pubKey,
          })
        );

        vscode.window.showInformationMessage("Sent diff over WebSocket");
      } catch (err) {
        vscode.window.showErrorMessage("Failed to get diff or send over WS");
        console.error(err);
      }
    }

    if (data.type === "prompt-end") {
      vscode.commands.executeCommand("git add .");
      vscode.commands.executeCommand(
        "extension.sendToAiTerminal",
        "anchor build"
      );
    }
  };

  return ws;
}

export function activate(context: vscode.ExtensionContext) {
  let ws = initWs(context);
  ws.onerror = (e) => {
    initWs(context);
  };

  const aiTerminal = vscode.window.createTerminal({
    name: "AI Terminal",
    hideFromUser: false,
  });

  // Store the terminal for future reference
  context.globalState.update("aiTerminalId", aiTerminal.processId);

  // Show the terminal
  aiTerminal.show();

  // Pin the terminal (this requires the terminal tabs feature)
  vscode.commands.executeCommand("workbench.action.terminal.focus");

  // Register a command to send text to the AI terminal
  let sendToAiTerminal = vscode.commands.registerCommand(
    "extension.sendToAiTerminal",
    async (text) => {
      const terminalId = context.globalState.get("aiTerminalId");
      const terminals = vscode.window.terminals;
      const aiTerm = terminals.find((t) => t.processId === terminalId);

      if (aiTerm) {
        aiTerm.sendText(text);
      } else {
        vscode.window.showErrorMessage(
          "AI Terminal not found. It may have been closed."
        );

        const aiTerminal = vscode.window.createTerminal({
          name: "AI Terminal",
          hideFromUser: false,
        });
        context.globalState.update("aiTerminalId", aiTerminal.processId);
        aiTerminal.show();
        aiTerminal.sendText(text);
      }
    }
  );

  context.subscriptions.push(sendToAiTerminal);

  const disposable = vscode.commands.registerCommand(
    "bolty-listener.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from bolty-listener!");
      vscode.commands.executeCommand("workbench.action.terminal.new");
      vscode.commands.executeCommand("workbench.action.terminal.sendSequence", {
        text: "npm run build",
      });
      vscode.commands.executeCommand("workbench.action.terminal.sendSequence", {
        text: "\r",
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
