import { existsSync } from 'fs'
import * as vscode from 'vscode'
import { getTemplateUri, mkdir, showMessage } from '../utils'
export const createTemplate = async () => {
  try {
    const templateUrl = getTemplateUri().fsPath

    // 让用户输入模板名称
    const templateName = await vscode.window.showInputBox({
      prompt: '模板名称',
      placeHolder: '请输入模板名称，按回车键确认',
      validateInput(value) {
        // 判断模板名称是否合法
        if (value?.trim?.() == '') return
        if (!/^[\u4e00-\u9fa5a-zA-Z0-9\-_ .]+$/.test(value)) {
          return {
            message: '模板名包含非法字符',
            severity: vscode.InputBoxValidationSeverity.Error
          }
        }

        // 判断模板名称是否存在
        const filePath = `${templateUrl}/${value.trim()}`
        let isHas = existsSync(filePath)
        if (isHas) {
          return {
            message: '模板已存在',
            severity: vscode.InputBoxValidationSeverity.Error
          }
        }
      }
    })
    if (templateName == undefined || templateName.trim() == '') return

    // 创建模板文件夹
    const folderPath = `${templateUrl}/${templateName.trim()}`
    mkdir(folderPath)

    // 打开文件夹
    await vscode.commands.executeCommand(
      'vscode.openFolder',
      vscode.Uri.file(folderPath),
      true
    )

  } catch (error) {
    showMessage(error, 'createTemplate')
  }
}
