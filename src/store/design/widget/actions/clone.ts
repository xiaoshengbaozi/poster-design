/*
 * @Author: Jeremy Yu
 * @Date: 2024-03-28 14:00:00
 * @Description:
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2024-05-22 19:32:24
 */

import { useCanvasStore, useHistoryStore } from "@/store"
import { TWidgetStore, TdWidgetData } from ".."
import { useWidgetStore } from "@/store"
import { customAlphabet } from 'nanoid/non-secure'
const nanoid = customAlphabet('1234567890abcdef', 12)

/** 拷贝组件 */
export function copyWidget(store: TWidgetStore) {
  const activeElement = JSON.parse(JSON.stringify(store.dActiveElement))
  if (activeElement.type === 'page') {
    return
  }
  navigator.clipboard.writeText('') // 清空系统剪贴板内容
  const container = []
  const selectWidgets = store.dSelectWidgets
  if (selectWidgets.length === 0) {
    const uuid = activeElement.uuid
    container.push(activeElement)
    if (activeElement.isContainer) {
      const widgets = store.dWidgets
      for (let i = 0; i < widgets.length; ++i) {
        if (widgets[i].parent === uuid) {
          container.push(widgets[i])
        }
      }
    }
  } else {
    for (let i = 0; i < selectWidgets.length; ++i) {
      const uuid = selectWidgets[i].uuid
      container.push(selectWidgets[i])
      if (selectWidgets[i].isContainer) {
        const widgets = store.dWidgets
        for (let i = 0; i < widgets.length; ++i) {
          if (widgets[i].parent === uuid) {
            container.push(widgets[i])
          }
        }
      }
    }
  }
  store.dCopyElement = JSON.parse(JSON.stringify(container))
}

/** 粘贴组件 */
export function pasteWidget(store: TWidgetStore) {
  const widgetStore = useWidgetStore()
  const copyElement: TdWidgetData[] = JSON.parse(JSON.stringify(store.dCopyElement))
  const container = copyElement.find((item) => item.isContainer)
  for (let i = 0; i < copyElement.length; ++i) {
    copyElement[i].uuid = nanoid()
    if (container && copyElement[i].uuid !== container.uuid) {
      copyElement[i].parent = container.uuid
    } else {
      copyElement[i].parent = '-1'
    }
    copyElement[i].top += 30
    copyElement[i].left += 30
    widgetStore.addWidget(copyElement[i])
  }
  // store.dWidgets = store.dWidgets.concat(copyElement)
  store.dActiveElement = copyElement[0]
  store.dSelectWidgets = copyElement
  if (container) {
    store.dActiveElement = container
    store.dSelectWidgets = []
  }
  // 复制以调整下次粘贴的位置
  store.copyWidget()
}
