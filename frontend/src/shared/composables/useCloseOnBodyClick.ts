import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { useUiStore } from '@/shared/stores/ui'

export const useCloseOnBodyClick = (
  isOpen: () => boolean,
  close: () => void,
) => {
  const uiStore = useUiStore()
  const { clickTimes } = storeToRefs(uiStore)
  let openingClickTimes: number | null = null

  const markCurrentClick = () => {
    openingClickTimes = clickTimes.value + 1
  }

  watch(clickTimes, currentClickTimes => {
    if (!isOpen()) return

    if (currentClickTimes === openingClickTimes) {
      openingClickTimes = null
      return
    }

    openingClickTimes = null
    close()
  }, { flush: 'sync' })

  return { markCurrentClick }
}
