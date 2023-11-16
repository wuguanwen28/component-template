type ShowType = "info" | "warn" | "error"

type cssExt = 'css' | 'scss' | 'less' | 'stylus' | 'styl'

type FileList = Array<{
  name: string,
  type: 1 | 2,
  content?: string,
  children?: FileList
}>