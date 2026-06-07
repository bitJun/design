import type { TextFormatCommand } from '../constants'

export type TextEditorApi = {
  execFormat: (cmd: TextFormatCommand) => void
  copyContent: () => Promise<void>
  requestExpand: () => void
  focus: () => void
  getPlainText: () => string
}

export type TextEditorRegistry = {
  register: (nodeId: string, api: TextEditorApi) => void
  unregister: (nodeId: string) => void
  get: (nodeId: string) => TextEditorApi | undefined
}
