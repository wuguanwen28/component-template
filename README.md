# Welcome!!!

### 一、说明
  1. 可以通过创建的组件模板来新建组件或页面
  2. 类似 `vscode` 的代码片段，不过这个能同时创建多个文件
  
### 二、创建组件
  1. 与创建文件一样，右击选择 `新建组件` 
  2. 输入组件名称
  3. 选择组件模板
  4. 可以在 `package.json` 中设置当前项目的默认模板
  ```json
    {
      "componentTemplate": {
        "template": "default-react-ts",
      }
    }
  ```

### 三、创建组件模板
  1. 按<kbd>Shift</kbd>+<kbd>Ctrl</kbd>+<kbd>p</kbd>打开命令面板, 搜索 `create-template: 创建组件模板`
  2. 输入模板名称
  3. 会自动在`插件安装位置/.template` 文件夹中创建一个模板文件夹
  4. 这个模板文件夹下面的所以子文件即为模板
  5. 后续修改或删除该模板文件夹就可以修改或删除当前模板内容 
  
### 四、模板占位符
1. **`模板或文件名里的占位符在创建时会被替换相应的值`**
2. `[name]` 创建组件时输入的组件名
    * `[name]`: 全部为小写
    * `[NAME]`: 全部为大写
    * `[Name]`: 仅首字母为大写
  
3. `[cssExt]` css扩展名
    * `css` | `less` | `scss` | `styl` | `stylus`
    * 会根据当前项目 `package.json` 的预处理器依赖来决定
    * `sass` 的扩展名默认为 `scss`，如使用 `sass` 请在 `package.json` 中设置

4. `[jsExt]` 如果该项目安装了typescript则为`ts`, 否则为`js`
   
5. 如识别不准确，可在 `package.json` 中设置，如下
  ``` json
  {
    "templateOptions": {
      "template": "default-react-ts",
      "cssExt": "sass",
      "jsExt": "ts"
    }
  }
  ```

### 五、示例模板：React-Ts
  ```text
  模板文件夹                # 文件夹名即为模板名
  ├─ [Name]                # 组件文件夹
  │  ├─ [Name].tsx         # 核心文件
  │  ├─ [Name].[cssExt]    # 样式文件
  ```
  ```ts
  /* [Name].tsx */
  import React from 'react'
  import "./[Name].[cssExt]"
  type [Name]PropsType = { }
  const [Name]: React.FC<[Name]PropsType> = (props) => {
    return (
      <div className="[name]-wrapper">[Name]</div>
    )
  }
  export default [Name]
  ```
  ```css
  /* [Name].[cssExt] */
  .[name]-wrapper {
    width: 100%;
    height: 100%;
  }
  ```

### 六、其他
  1. 后续看情况增加其他占位符如：时间、日期、用户名、邮箱等，用于生成文件注释
  2. 组件名重复问题，当前只是判断输入的组件名，并没有结合模板内容的文件名来一起判断
