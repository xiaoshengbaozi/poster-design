/*
 * @Author: Jeremy Yu
 * @Date: 2024-03-28 21:00:00
 * @Description:
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2024-08-12 09:30:53
 */

import { useCanvasStore, useHistoryStore } from '@/store'
import { TWidgetStore, TdWidgetData } from '..'
import { customAlphabet } from 'nanoid/non-secure'
const nanoid = customAlphabet('1234567890abcdef', 12)

type TUpdateWidgetKey = keyof TdWidgetData

export type TUpdateWidgetPayload = {
  uuid: string
  key: TUpdateWidgetKey
  value: number | string | boolean | Record<string, any>
}

/** 更新组件数据 */
export function updateWidgetData(store: TWidgetStore, { uuid, key, value }: TUpdateWidgetPayload) {
  const widget = store.dWidgets.find((item) => item.uuid === uuid)
  if (widget && widget[key] !== value) {
    switch (key) {
      case 'width':
        // const minWidth = widget.record.minWidth
        // const maxWidth = store.state.dPage.width - widget.left
        // value = Math.max(minWidth, Math.min(maxWidth, value))
        break
      case 'height':
        // const minHeight = widget.record.minHeight
        // const maxHeight = store.state.dPage.height - widget.top
        // value = Math.max(minHeight, Math.min(maxHeight, value))
        break
      case 'left':
      case 'top':
        if (widget.isContainer) {
          let dLeft = widget.left - Number(value)
          let dTop = widget.top - Number(value)
          if (key === 'left') {
            dTop = 0
          }
          if (key === 'top') {
            dLeft = 0
          }
          const len = store.dWidgets.length
          for (let i = 0; i < len; ++i) {
            const child = store.dWidgets[i]
            if (child.parent === widget.uuid) {
              child.left -= dLeft
              child.top -= dTop
            }
          }
        }
        break
    }
    ;(widget[key] as TUpdateWidgetPayload['value']) = value
  }
}

export type TUpdateWidgetMultiplePayload = {
  uuid: string
  data: {
    key: TUpdateWidgetKey
    value: number
  }[]
}

/** 一次更新多个widget */
export function updateWidgetMultiple(store: TWidgetStore, { uuid, data }: TUpdateWidgetMultiplePayload) {
  for (const item of data) {
    const { key, value } = item
    const widget = store.dWidgets.find((item) => item.uuid === uuid)
    if (widget && widget[key] !== value) {
      switch (key) {
        case 'left':
        case 'top':
          if (widget.isContainer) {
            let dLeft = widget.left - value
            let dTop = widget.top - value
            if (key === 'left') {
              dTop = 0
            }
            if (key === 'top') {
              dLeft = 0
            }
            const len = store.dWidgets.length
            for (let i = 0; i < len; ++i) {
              const child = store.dWidgets[i]
              if (child.parent === widget.uuid) {
                child.left -= dLeft
                child.top -= dTop
              }
            }
          }
          break
      }
      ;(widget[key] as number | string) = value
    }
  }
}

/** 添加 Widget */
export function addWidget(store: TWidgetStore, setting: TdWidgetData) {
  const historyStore = useHistoryStore()
  const canvasStore = useCanvasStore()
  setting.uuid = nanoid()
  store.dWidgets.push(setting)
  const len = store.dWidgets.length
  // store.state.dActiveElement = store.state.dWidgets[len - 1]

  store.selectWidget({
    uuid: store.dWidgets[len - 1].uuid,
  })
  canvasStore.reChangeCanvas()
}

/** 删除组件 */
export function deleteWidget(store: TWidgetStore) {
  const historyStore = useHistoryStore()
  const canvasStore = useCanvasStore()
  const widgets = store.dWidgets
  const selectWidgets = store.dSelectWidgets
  const activeElement = store.dActiveElement
  if (!activeElement) return

  let count = 0 // 记录容器里的组件数量
  if (selectWidgets.length !== 0) {
    for (let i = 0; i < selectWidgets.length; ++i) {
      const uuid = selectWidgets[i].uuid
      const index = widgets.findIndex((item) => item.uuid === uuid)
      widgets.splice(index, 1)
      // try {
      //   // 清除掉可能存在的中框
      //   document.getElementById(uuid)?.classList.remove('widget-selected')
      // } catch (e) {}
    }
    store.dSelectWidgets = []
    store.selectWidget({
      uuid: '-1',
    })
  } else {
    if (activeElement.type === 'page') {
      return
    }

    const uuid = activeElement.uuid
    const index = widgets.findIndex((item) => item.uuid === uuid)

    // 先删除组件
    widgets.splice(index, 1)

    // 如果删除的是容器，须将内部组件一并删除
    if (activeElement.isContainer) {
      for (let i = widgets.length - 1; i >= 0; --i) {
        if (widgets[i].parent === uuid) {
          widgets.splice(i, 1)
        }
      }
    } else if (activeElement.parent !== '-1') {
      for (let i = widgets.length - 1; i >= 0; --i) {
        if (widgets[i].parent === activeElement.parent) {
          count++
          if (count > 1) {
            break
          }
        }
      }
      if (count <= 1) {
        const index = widgets.findIndex((item) => item.uuid === activeElement.parent)
        widgets.splice(index, 1)
        if (count === 1) {
          const widget = widgets.find((item) => item.parent === activeElement.parent)
          widget && (widget.parent = '-1')
        }
        count = 0
      }
    }
  }

  if (count === 0) {
    // 重置 activeElement
    const pageStore = useCanvasStore()
    store.dActiveElement = pageStore.dPage
  } else {
    const tmp = widgets.find((item) => item.uuid === activeElement.parent)
    tmp && (store.dActiveElement = tmp)
  }

  if (store.dActiveElement && store.dActiveElement.uuid !== '-1') {
    store.updateGroupSize(store.dActiveElement.uuid)
    // store.dispatch('updateGroupSize', store.dActiveElement.uuid)
  }
  canvasStore.reChangeCanvas()
}

export type TsetWidgetStyleData = {
  uuid: string
  key: keyof TdWidgetData
  value: any
}

export function setWidgetStyle(state: TWidgetStore, { uuid, key, value }: TsetWidgetStyleData) {
  const widget = state.dWidgets.find((item) => item.uuid === uuid)
  if (!widget) return
  ;(widget[key] as Record<string, any>) = value
}

export function setDWidgets(state: TWidgetStore, e: TdWidgetData[]) {
  state.dWidgets = e
  updateDWidgets(state)
}

export function setDLayouts(state: TWidgetStore, data: any[]) {
  state.dLayouts = data
  state.dWidgets = state.getWidgets()
  const pageStore = useCanvasStore()
  pageStore.setDPage(data[pageStore.dCurrentPage].global)
  setTimeout(() => {
    state.dActiveElement = pageStore.dPage
  }, 150)
}

export function updateDWidgets(state: TWidgetStore) {
  const pageStore = useCanvasStore()
  const { dCurrentPage } = pageStore
  state.dLayouts[dCurrentPage].layers = state.dWidgets
  state.dWidgets = state.getWidgets()
}

// 锁定所有图层 / 再次调用时还原图层
let lastLocks: boolean[] | null = null
export function lockWidgets(state: TWidgetStore) {
  if (lastLocks && lastLocks.length > 0) {
    for (let i = 0; i < lastLocks.length; i++) {
      state.dWidgets[i].lock = lastLocks[i]
    }
    lastLocks = []
  } else {
    lastLocks = []
    for (const widget of state.dWidgets) {
      lastLocks.push(widget?.lock || false)
    }
    state.dWidgets.forEach((widget: any) => {
      widget.lock = true
    })
  }
}
