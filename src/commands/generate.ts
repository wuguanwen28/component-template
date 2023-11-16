import * as vscode from 'vscode'
import {
  createComponent,
  getPackageJson,
  getTemplateDirectory,
  getTemplateUri,
  readDirectory,
  setPackageJson,
  showMessage
} from '../utils';
import { existsSync } from 'fs';
import { createTemplate } from './create';

export const generateComponent = async (targetFolder: vscode.Uri) => {
  try {

    // 弹出输入框让用户输入组件名
    let componentName = await vscode.window.showInputBox({
      prompt: '请输入组件名',
      placeHolder: '请输入组件名',
      validateInput(value) {
        // 判断组件名是否合法
        if (value?.trim?.() == '') return
        if (!/^[a-zA-Z0-9\-_]+$/.test(value)) {
          return {
            message: '组件名包含非法字符',
            severity: vscode.InputBoxValidationSeverity.Error
          }
        }

        // 判断组件是否存在
        const filePath = `${targetFolder.fsPath}/${value.trim()}`
        if (existsSync(filePath)) {
          return {
            message: '组件已存在',
            severity: vscode.InputBoxValidationSeverity.Error
          }
        }
      }
    });
    componentName = (componentName || '').trim()
    if (componentName == '') return

    let packageOptions = (await getPackageJson()) || {}
    let templateOptions = packageOptions?.templateOptions || {}
    let template = templateOptions?.template

    if (!template) {
      // 获取模板目录
      let templateList = await getTemplateDirectory()
      let res: any = await vscode.window.showQuickPick(
        templateList,
        { placeHolder: '请选择模板' }
      )
      if (!res) return;

      // 新增
      if (res?.value === Symbol.for('new')) return createTemplate();

      template = (res.description ? 'default-' : '') + res.label
    }

    let folderUri = vscode.Uri.joinPath(getTemplateUri(), template)
    if (!existsSync(folderUri.fsPath)) {
      return showMessage('模板不存在! 请检查package.json的templateOptions.template字段是否正确')
    }

    // 获取模板内容
    let fileList = await readDirectory(folderUri)
    if (fileList.length == 0) {
      return showMessage('模板内容为空', '', 'info')
    }

    let cssExt: cssExt = 'css'
    let dep = {
      ...(packageOptions?.devDependencies || {}),
      ...(packageOptions?.dependencies || {})
    }
    if (dep?.sass || dep?.['sass-loader']) cssExt = 'scss';
    if (dep?.less || dep?.['less-loader']) cssExt = 'less';
    // vue的单文件组件的style.lang为stylus
    if (dep?.stylus || dep?.['stylus-loader']) {
      cssExt = dep?.vue ? 'stylus' : 'styl'
    }

    // 创建组件
    let res = await createComponent({
      fileList,
      componentName,
      targetFolder,
      cssExt,
      scriptType: dep?.typescript ? 'ts' : 'js'
    })
    if (res && !templateOptions?.template) {
      setTimeout(async () => {
        let isSetting = await vscode.window.showInformationMessage(
          '生成成功！是否要把此模板设置为该项目的默认模板？',
          { modal: true },
          'Confirm'
        )
        if (isSetting === 'Confirm') {
          templateOptions.template = template;
          packageOptions.templateOptions = templateOptions;
          setPackageJson(packageOptions)
        }
      }, 1000);
    }
  } catch (error) {
    showMessage(error, '生成组件错误')
  }
}
