import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

export interface DotdotItem {
  id: number
  fixed: boolean
  sort: number
  show: boolean
  displayTiming: {
    weekdays: number[]
    startTime: string
    endTime: string
  }
  record: {
    categoryId: number
    tagIds: number[]
    note: string
    amount: number
  }
}

export type DotdotData = Omit<DotdotItem, 'id' | 'sort' | 'show'>

const dotdotSeeds: Omit<DotdotItem, 'id'>[] = [
  {
    fixed: false,
    sort: 3,
    show: true,
    displayTiming: { weekdays: [1, 2, 3, 4, 5], startTime: '08:30', endTime: '19:30' },
    record: {
      categoryId: 17,
      tagIds: [],
      note: '點點記帳測試~',
      amount: 999,
    },
  },
  {
    fixed: true,
    sort: 3,
    show: false,
    displayTiming: { weekdays: [1, 2, 3, 4, 5], startTime: '08:30', endTime: '09:30' },
    record: {
      categoryId: 17,
      tagIds: [],
      note: '',
      amount: 599,
    },
  },
  {
    fixed: true,
    sort: 2,
    show: true,
    displayTiming: { weekdays: [1, 2, 3, 4, 5], startTime: '08:30', endTime: '09:30' },
    record: {
      categoryId: 10,
      tagIds: [],
      note: '',
      amount: 1000,
    },
  },
  {
    fixed: true,
    sort: 1,
    show: false,
    displayTiming: { weekdays: [1, 2, 3, 4, 5], startTime: '08:30', endTime: '09:30' },
    record: {
      categoryId: 1,
      tagIds: [],
      note: '',
      amount: 10000,
    },
  },
  {
    fixed: false,
    sort: 1,
    show: true,
    displayTiming: { weekdays: [1, 2, 3, 4, 5], startTime: '08:30', endTime: '09:30' },
    record: {
      categoryId: 6,
      tagIds: [],
      note: '茶葉蛋 + 鮮奶',
      amount: 50,
    },
  },
  {
    fixed: false,
    sort: 3,
    show: true,
    displayTiming: { weekdays: [1, 2, 3, 4, 5], startTime: '08:30', endTime: '09:30' },
    record: {
      categoryId: 6,
      tagIds: [],
      note: '茶葉蛋 + 拿鐵 + 拿鐵 + 拿鐵 + 拿鐵 + 拿鐵',
      amount: 55,
    },
  },
  {
    fixed: false,
    sort: 2,
    show: true,
    displayTiming: { weekdays: [1, 2, 3, 4, 5], startTime: '08:30', endTime: '09:30' },
    record: {
      categoryId: 8,
      tagIds: [],
      note: '',
      amount: 75,
    },
  },
  {
    fixed: true,
    sort: 4,
    show: true,
    displayTiming: { weekdays: [1, 2, 3, 4, 5], startTime: '08:30', endTime: '09:30' },
    record: {
      categoryId: 11,
      tagIds: [],
      note: '',
      amount: 50,
    },
  },
  {
    fixed: true,
    sort: 5,
    show: true,
    displayTiming: { weekdays: [1, 2, 3, 4, 5], startTime: '08:30', endTime: '09:30' },
    record: {
      categoryId: 11,
      tagIds: [],
      note: '',
      amount: 100,
    },
  },
]

export const useDotdotStore = defineStore('dotdot', () => {
  const dotdotList: Ref<DotdotItem[]> = ref(dotdotSeeds.map((item, index) => ({
    ...item,
    id: index + 1,
    record: {
      ...item.record,
      tagIds: [...item.record.tagIds],
    },
    displayTiming: {
      ...item.displayTiming,
      weekdays: [...item.displayTiming.weekdays],
    },
  })))

  const getDotdotList = (isFixed: boolean, visibleOnly = false) => {
    return dotdotList.value
      .filter(item => item.fixed === isFixed && (!visibleOnly || item.show))
      .slice()
      .sort((itemA, itemB) => itemA.sort - itemB.sort)
  }

  const toggleDotdotVisibility = (dotdotId: number) => {
    const item = dotdotList.value.find(item => item.id === dotdotId)

    if (!item) return false

    item.show = !item.show

    return true
  }

  const addDotdot = (dotdotData: DotdotData) => {
    const dotdot: DotdotItem = {
      ...dotdotData,
      id: Math.max(0, ...dotdotList.value.map(item => item.id)) + 1,
      sort: getDotdotList(dotdotData.fixed).length + 1,
      show: true,
      record: {
        ...dotdotData.record,
        tagIds: [...dotdotData.record.tagIds],
      },
      displayTiming: {
        ...dotdotData.displayTiming,
        weekdays: [...dotdotData.displayTiming.weekdays],
      },
    }

    dotdotList.value.push(dotdot)

    return dotdot
  }

  const updateDotdot = (dotdotId: number, dotdotData: DotdotData) => {
    const item = dotdotList.value.find(item => item.id === dotdotId)

    if (!item) return false

    if (item.fixed !== dotdotData.fixed) {
      moveDotdot(
        dotdotId,
        dotdotData.fixed,
        getDotdotList(dotdotData.fixed).length,
      )
    }

    item.record = {
      ...dotdotData.record,
      tagIds: [...dotdotData.record.tagIds],
    }
    item.displayTiming = {
      ...dotdotData.displayTiming,
      weekdays: [...dotdotData.displayTiming.weekdays],
    }

    return true
  }

  const moveDotdot = (dotdotId: number, isFixed: boolean, targetIndex: number) => {
    const item = dotdotList.value.find(item => item.id === dotdotId)

    if (!item) return false

    const previousFixed = item.fixed
    const previousGroup = getDotdotList(previousFixed)
      .filter(groupItem => groupItem.id !== dotdotId)
    const targetGroup = previousFixed === isFixed
      ? previousGroup
      : getDotdotList(isFixed)

    item.fixed = isFixed
    targetGroup.splice(
      Math.max(0, Math.min(targetIndex, targetGroup.length)),
      0,
      item,
    )

    previousGroup.forEach((groupItem, index) => {
      groupItem.sort = index + 1
    })
    targetGroup.forEach((groupItem, index) => {
      groupItem.sort = index + 1
    })

    return true
  }

  const deleteDotdot = (dotdotId: number) => {
    const dotdotIndex = dotdotList.value.findIndex(item => item.id === dotdotId)

    if (dotdotIndex === -1) return false

    const [deletedDotdot] = dotdotList.value.splice(dotdotIndex, 1)

    getDotdotList(deletedDotdot.fixed).forEach((item, index) => {
      item.sort = index + 1
    })

    return true
  }

  return {
    dotdotList,
    getDotdotList,
    toggleDotdotVisibility,
    addDotdot,
    updateDotdot,
    moveDotdot,
    deleteDotdot,
  }
})
