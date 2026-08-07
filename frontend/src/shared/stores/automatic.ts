import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

export type AutomaticFrequency = 'daily' | 'weekly' | 'monthly'

export interface AutomaticItem {
  id: number
  sort: number
  enabled: boolean
  timing: {
    frequency: AutomaticFrequency
    weekdays: number[]
    monthDay: number | null
    time: string
  }
  record: {
    categoryId: number
    tagIds: number[]
    note: string
    amount: number
  }
}

export type AutomaticData = Omit<AutomaticItem, 'id' | 'sort'>

const automaticSeeds: Omit<AutomaticItem, 'id'>[] = [
  {
    sort: 1,
    enabled: true,
    timing: {
      frequency: 'monthly',
      weekdays: [],
      monthDay: 1,
      time: '08:30',
    },
    record: {
      categoryId: 17,
      tagIds: [1703],
      note: 'Spotify',
      amount: 149,
    },
  },
  {
    sort: 2,
    enabled: true,
    timing: {
      frequency: 'weekly',
      weekdays: [1, 2, 3, 4, 5],
      monthDay: null,
      time: '08:30',
    },
    record: {
      categoryId: 10,
      tagIds: [1001],
      note: '平日通勤',
      amount: 30,
    },
  },
  {
    sort: 3,
    enabled: false,
    timing: {
      frequency: 'monthly',
      weekdays: [],
      monthDay: 15,
      time: '09:00',
    },
    record: {
      categoryId: 17,
      tagIds: [1703],
      note: 'Netflix',
      amount: 390,
    },
  },
  {
    sort: 4,
    enabled: true,
    timing: {
      frequency: 'daily',
      weekdays: [],
      monthDay: null,
      time: '07:30',
    },
    record: {
      categoryId: 6,
      tagIds: [601],
      note: '上班日早餐',
      amount: 55,
    },
  },
]

export const useAutomaticStore = defineStore('automatic', () => {
  const automaticList: Ref<AutomaticItem[]> = ref(
    automaticSeeds.map((item, index) => ({
      ...item,
      id: index + 1,
      timing: {
        ...item.timing,
        weekdays: [...item.timing.weekdays],
      },
      record: {
        ...item.record,
        tagIds: [...item.record.tagIds],
      },
    })),
  )

  const getAutomaticList = () => automaticList.value
    .slice()
    .sort((itemA, itemB) => itemA.sort - itemB.sort)

  const moveAutomatic = (automaticId: number, targetIndex: number) => {
    const list = getAutomaticList()
    const currentIndex = list.findIndex(item => item.id === automaticId)

    if (currentIndex === -1) return false

    const [item] = list.splice(currentIndex, 1)

    list.splice(
      Math.max(0, Math.min(targetIndex, list.length)),
      0,
      item,
    )
    list.forEach((listItem, index) => {
      listItem.sort = index + 1
    })

    return true
  }

  const addAutomatic = (automaticData: AutomaticData) => {
    const automatic: AutomaticItem = {
      ...automaticData,
      id: Math.max(0, ...automaticList.value.map(item => item.id)) + 1,
      sort: getAutomaticList().length + 1,
      timing: {
        ...automaticData.timing,
        weekdays: [...automaticData.timing.weekdays],
      },
      record: {
        ...automaticData.record,
        tagIds: [...automaticData.record.tagIds],
      },
    }

    automaticList.value.push(automatic)

    return automatic
  }

  const updateAutomatic = (
    automaticId: number,
    automaticData: AutomaticData,
  ) => {
    const item = automaticList.value.find(item => item.id === automaticId)

    if (!item) return false

    item.enabled = automaticData.enabled
    item.timing = {
      ...automaticData.timing,
      weekdays: [...automaticData.timing.weekdays],
    }
    item.record = {
      ...automaticData.record,
      tagIds: [...automaticData.record.tagIds],
    }

    return true
  }

  const deleteAutomatic = (automaticId: number) => {
    const automaticIndex = automaticList.value
      .findIndex(item => item.id === automaticId)

    if (automaticIndex === -1) return false

    automaticList.value.splice(automaticIndex, 1)
    getAutomaticList().forEach((item, index) => {
      item.sort = index + 1
    })

    return true
  }

  return {
    automaticList,
    getAutomaticList,
    moveAutomatic,
    addAutomatic,
    updateAutomatic,
    deleteAutomatic,
  }
})
