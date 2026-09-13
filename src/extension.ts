import * as vscode from 'vscode';
import { parseFragmentFileName, fragmentFileName, FRAGMENT_TYPES } from './fragment';
import { recordHit } from './reviewPrompt';

let diagnostics: vscode.DiagnosticCollection;

function basename(uri: vscode.Uri): string {
  const path = uri.path;
  return path.slice(path.lastIndexOf('/') + 1);
}

function parentDirName(uri: vscode.Uri): string {
  const path = uri.path.slice(0, uri.path.lastIndexOf('/'));
  return path.slice(path.lastIndexOf('/') + 1);
}

function refreshDiagnostics(context: vscode.ExtensionContext, document: vscode.TextDocument): void {
  // Scope, deliberate (same as the original): only files whose direct
  // parent directory is literally named "changelog.d" are checked.
  if (parentDirName(document.uri) !== 'changelog.d') {
    diagnostics.delete(document.uri);
    return;
  }

  const result = parseFragmentFileName(basename(document.uri));
  if (result.valid) {
    diagnostics.delete(document.uri);
    return;
  }

  const range = new vscode.Range(0, 0, 0, Number.MAX_SAFE_INTEGER);
  const diagnostic = new vscode.Diagnostic(
    range,
    `Invalid changelog fragment file name: ${result.reason}`,
    vscode.DiagnosticSeverity.Warning,
  );
  diagnostic.source = 'Changelog Fragment Companion';
  diagnostics.set(document.uri, [diagnostic]);
  recordHit(context, `${document.uri.toString()}:0`);
}

async function createFragment(): Promise<void> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    void vscode.window.showErrorMessage('Changelog Fragment Companion: open a folder/workspace first.');
    return;
  }
  const root = folders[0].uri;

  const issueId = await vscode.window.showInputBox({
    prompt: 'Issue/PR number',
    placeHolder: '123',
    validateInput: (value) => (/^\d+$/.test(value) ? undefined : 'Must be a number'),
  });
  if (!issueId) return;

  const picked = await vscode.window.showQuickPick(
    FRAGMENT_TYPES.map((type) => ({ label: type.label, description: type.id, type })),
    { placeHolder: 'Fragment type' },
  );
  if (!picked) return;

  const description = await vscode.window.showInputBox({ prompt: 'One-line description of the change' });
  if (!description) return;

  const changelogDir = vscode.Uri.joinPath(root, 'changelog.d');
  try {
    await vscode.workspace.fs.createDirectory(changelogDir);
  } catch {
    // already exists -- fine
  }

  const fileName = fragmentFileName(issueId, picked.type);
  const fileUri = vscode.Uri.joinPath(changelogDir, fileName);

  try {
    await vscode.workspace.fs.stat(fileUri);
    void vscode.window.showErrorMessage(`Changelog Fragment Companion: ${fileName} already exists -- not overwriting it.`);
    return;
  } catch {
    // doesn't exist yet -- proceed
  }

  const content = description.endsWith('\n') ? description : `${description}\n`;
  await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content, 'utf8'));
  const document = await vscode.workspace.openTextDocument(fileUri);
  await vscode.window.showTextDocument(document);
}

export function activate(context: vscode.ExtensionContext): void {
  diagnostics = vscode.languages.createDiagnosticCollection('changelogFragmentCompanion');
  context.subscriptions.push(diagnostics);

  vscode.workspace.textDocuments.forEach((document) => refreshDiagnostics(context, document));

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => refreshDiagnostics(context, document)),
    vscode.workspace.onDidChangeTextDocument((event) => refreshDiagnostics(context, event.document)),
    vscode.workspace.onDidCloseTextDocument((document) => diagnostics.delete(document.uri)),
    vscode.commands.registerCommand('changelogFragmentCompanion.newFragment', () => void createFragment()),
  );
}

export function deactivate(): void {
  diagnostics?.dispose();
}
