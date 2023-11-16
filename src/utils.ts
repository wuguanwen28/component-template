import * as vscode from 'vscode'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path = require('path')

// 获取模板文件夹路径
export const getTemplateUri = () => {
  return vscode.Uri.file(`${globalThis.extensionPath}/.template`)
}


// 获取模板上的目录
type DirectoryType = Array<vscode.QuickPickItem & { value?: symbol }>
export const getTemplateDirectory = async () => {
  let result: DirectoryType = [
    { label: '新建模板', kind: -1 },
    { label: '', value: Symbol.for('new') }
  ]

  let folderUri = getTemplateUri();
  let list = await vscode.workspace.fs.readDirectory(folderUri);
  list.forEach(item => {
    if (item[1] == vscode.FileType.File) return // 过滤文件
    if (item[0].startsWith('default-')) {
      result.push({
        label: item[0].replace('default-', ''),
        description: ' (default)'
      })
    } else {
      result.unshift({ label: item[0] })
    }
  })

  return result
}

// 获取项目的根目录
export function getProjectRoot() {
  if (!vscode.workspace.workspaceFolders?.length) {
    return __dirname;
  }
  return vscode.workspace.workspaceFolders[0].uri.fsPath;
}

// 获取设置中的配置
type ConfigurationKeys = "openapiJsonUrl"
export function getConfiguration<T = any>(configKey: ConfigurationKeys | ConfigurationKeys[]): T | undefined {
  const Configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("component-template")
  if (Array.isArray(configKey)) {
    return configKey.reduce((prev, key) => {
      prev[key] = Configuration.get(key)
      return prev
    }, {} as any)
  } else if (typeof configKey == 'string') {
    return Configuration.get(configKey)
  }
}


// 弹出消息
export const showMessage = (error: any, prefix?: string, type: ShowType = 'error') => {
  let msg: string = String(error)
  if (error instanceof Error) msg = error.message
  let message = {
    info: vscode.window.showInformationMessage,
    warn: vscode.window.showWarningMessage,
    error: vscode.window.showErrorMessage,
  }[type]
  message(`${prefix ? prefix + ': ' : ''}${msg}`)
}

// 创建文件夹
export const mkdir = (dir: string) => {
  if (!existsSync(dir)) {
    mkdir(path.dirname(dir))
    mkdirSync(dir)
  }
}

// 读取模板内家
export const readDirectory = async (folderUri: vscode.Uri): Promise<FileList> => {
  let result = []
  try {
    const entries = await vscode.workspace.fs.readDirectory(folderUri);
    // 遍历所有条目并处理文件
    for (const [name, type] of entries) {
      // 检查是否为文件
      if (type === vscode.FileType.File) {
        const fileUri = vscode.Uri.joinPath(folderUri, name);
        const content = await vscode.workspace.fs.readFile(fileUri);
        const text = new TextDecoder("utf-8").decode(content);
        result.push({
          name,
          type,
          content: text,
        })
      } else {
        let subFolderUri = vscode.Uri.joinPath(folderUri, name)
        result.push({
          name,
          type,
          children: await readDirectory(subFolderUri)
        })
      }
    }
  } catch (error) {
    showMessage(error, 'readDirectory')
  }
  return result
}

// 创建组件
export const createComponent = async (options: {
  fileList: FileList,
  componentName: string,
  targetFolder: vscode.Uri,
  cssExt: cssExt,
  scriptType: 'ts' | 'js'
}) => {
  const {
    fileList,
    componentName,
    targetFolder,
    cssExt,
    scriptType,
  } = options
  try {
    fileList.forEach(async item => {
      let name = replaceName(item.name, componentName)
        .replace(/\[cssExt\]/gi, cssExt)
        .replace(/\[jsExt\]/gi, scriptType)
      const fileOrFolderUri = vscode.Uri.joinPath(targetFolder, name)
      if (item.type == 2) {
        mkdir(fileOrFolderUri.fsPath)
        await createComponent({
          ...options,
          fileList: item.children,
          targetFolder: fileOrFolderUri
        })
      } else if (item.type == 1) {
        let content = replaceName(item.content, componentName)
          .replace(/\[cssExt\]/gi, cssExt)
          .replace(/\[jsExt\]/gi, scriptType)
        writeFileSync(fileOrFolderUri.fsPath, content, { encoding: 'utf-8' })
      }
    })
  } catch (error) {
    showMessage(error, '生成组件')
    return false
  }
  return true
}

/** 替换组件名称 */
export const replaceName = (content: string, replacer: string) => {
  return content.replace(/(\[name\])/gi, (str) => {
    if (str == '[name]') {
      return replacer.toLocaleLowerCase()
    } else if (str === '[NAME]') {
      return replacer.toLocaleUpperCase()
    } else if (str == '[Name]') {
      return replacer.slice(0, 1).toLocaleUpperCase() + replacer.slice(1)
    }
    return replacer
  })
}

export const getPackageJson = async () => {
  try {
    const path = getProjectRoot() + '/package.json'
    let res = readFileSync(path, { encoding: 'utf-8' })
    return JSON.parse(res)
  } catch (error) {
    console.log("package.json文件不存在", error.message);
    return null
  }
}

export const setPackageJson = async (content: object) => {
  try {
    const path = getProjectRoot() + '/package.json'
    return writeFileSync(path, JSON.stringify(content, null, 2), { encoding: 'utf-8' })
  } catch (error) {
    console.log("package.json写入错误", error.message);
  }
}
