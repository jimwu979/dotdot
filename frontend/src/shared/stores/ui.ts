import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const clickTimes = ref(0)

  const increaseClickTimes = () => {
    clickTimes.value += 1
  }

  return {
    clickTimes,
    increaseClickTimes,
  }
})
