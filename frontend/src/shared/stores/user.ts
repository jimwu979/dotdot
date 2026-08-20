import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const name = ref('歐巴馬')
  const email = ref('obam@gmail.com')
  const initial = computed(() => name.value.trim().charAt(0) || '點')

  const updateName = (value: string) => {
    name.value = value.trim()
  }

  const updateEmail = (value: string) => {
    email.value = value.trim()
  }

  return {
    name,
    email,
    initial,
    updateName,
    updateEmail,
  }
})
