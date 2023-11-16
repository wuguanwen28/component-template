import * as vscode from 'vscode'
import { createTemplate } from './commands/create'
import { generateComponent } from './commands/generate'
import { getTemplateUri } from './utils'

export function activate(context: vscode.ExtensionContext) {

  globalThis.extensionPath = context.extensionPath

  // 创建模板
  let createCommand = vscode.commands.registerCommand(
    'component-template.create',
    createTemplate
  )

  // 通过模板生成文件
  let generateCommand = vscode.commands.registerCommand(
    'component-template.generate',
    generateComponent
  )

  // 打开模板文件夹后打开 模板说明文档
  let workspace = vscode.workspace?.workspaceFolders || [];
  workspace.forEach(async folder => {
    let url = folder.uri.fsPath
    if (url.includes(getTemplateUri().fsPath)) {
      const directoryContents = await vscode.workspace.fs.readDirectory(folder.uri) || [];
      if (directoryContents.length == 0) {
        let fileUri = vscode.Uri.file(`${context.extensionPath}/模板创建说明.txt`)
        vscode.window.showTextDocument(fileUri);
      }
    }
  })
  context.subscriptions.push(createCommand, generateCommand)
}

// This method is called when your extension is deactivated
export function deactivate() { }
