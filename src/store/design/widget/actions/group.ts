/*
 * @Author: Jeremy Yu
 * @Date: 2024-03-28 21:00:00
 * @Description:
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2024-08-12 09:29:31
 */

import { useCanvasStore, useHistoryStore } from "@/store"
import { TWidgetStore, TdWidgetData } from ".."
import { customAlphabet } from 'nanoid/non-secure'
const nanoid = customAlphabet('1234567890abcdef', 12)


export function addGroup(store: TWidgetStore, group: TdWidgetData[]) {
  const historyStore = useHistoryStore()
  const canvasStore = useCanvasStore()
  let parent: TdWidgetData | null = null
  group.forEach((item) => {
    item.uuid = nanoid() // 重设id
    item.type === 'w-group' && (parent = item) // 找出父组件
  })
  group.forEach((item) => {
    !item.isContainer && parent && (item.parent = parent.uuid) // 重设父id
    item.text && (item.text = decodeURIComponent(item.text))
    store.dWidgets.push(item)
  })
  // 选中组件
  const len = store.dWidgets.length
  store.dActiveElement = store.dWidgets[len - 1]

  canvasStore.reChangeCanvas()
  // store.dispatch('reChangeCanvas')
}