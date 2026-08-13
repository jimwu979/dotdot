<template>
  <main class="page saveing-edit">
    <h1>存款收支</h1>
    <form novalidate @submit.prevent="submitTransaction">
      <section class="form-field">
        <label class="require">收支</label>
        <div class="type-selector">
          <button
            class="btn-click-effect"
            type="button"
            :class="{ current: draft.type === 'income' }"
            @click="draft.type = 'income'"
          >
            收入
          </button>
          <button
            class="btn-click-effect"
            type="button"
            :class="{ current: draft.type === 'expense' }"
            @click="draft.type = 'expense'"
          >
            支出
          </button>
        </div>
      </section>

      <section class="form-field">
        <label class="require">金額</label>
        <input
          v-model.number="draft.amount"
          type="number"
          inputmode="decimal"
          min="1"
          step="1"
          placeholder="0"
          required
          @input="hasAmountError = false"
        >
        <p class="error-message">
          <b
            :class="{ show: hasAmountError }"
            :style="{ color: categoryColors.pink }"
          >
            請輸入有效的金額
          </b>
        </p>
      </section>

      <section class="form-field">
        <label class="require">月份</label>
        <div class="month-selector">
          <button
            class="prev btn-click-effect"
            type="button"
            @click="changeDraftMonth(-1)"
          />
          <strong>{{ draftYear }} 年 {{ draftMonth }} 月</strong>
          <button
            class="next btn-click-effect"
            type="button"
            @click="changeDraftMonth(1)"
          />
        </div>
      </section>

      <section class="form-field">
        <label class="require">備註</label>
        <input
          v-model.trim="draft.note"
          type="text"
          maxlength="40"
          @input="hasNoteError = false"
        >
        <p class="error-message">
          <b
            :class="{ show: hasNoteError }"
            :style="{ color: categoryColors.pink }"
          >
            備註為必填欄位
          </b>
        </p>
      </section>

      <button class="save-button btn-click-effect" type="submit">儲存</button>
    </form>

    <AppHeader
      title="存款"
      :right-action="transactionId !== null ? 'delete' : undefined"
      @delete="isDeleteConfirmOpen = true"
    />
    <ConfirmDialog
      :open="isDeleteConfirmOpen"
      message="確定要刪除這筆帳嗎？"
      confirm-text="確認刪除"
      confirm-type="delete"
      @cancel="isDeleteConfirmOpen = false"
      @confirm="confirmDeleteTransaction"
    />
  </main>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppHeader from '@/mobile/components/AppHeader.vue'
  import ConfirmDialog from '@/mobile/components/ConfirmDialog.vue'
  import { categoryColors } from '@/shared/colors/category'
  import {
    useSavingStore,
    type SavingTransactionData,
    type SavingTransactionType,
  } from '@/shared/stores/saving'

  const getCurrentMonth = () => {
    const date = new Date()

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
    ].join('-')
  }

  const route = useRoute()
  const router = useRouter()
  const savingStore = useSavingStore()
  const transactionId = ref<number | null>(null)
  const isDeleteConfirmOpen = ref(false)
  const hasAmountError = ref(false)
  const hasNoteError = ref(false)
  const draft = reactive({
    type: 'expense' as SavingTransactionType,
    amount: 0,
    occurredMonth: getCurrentMonth(),
    note: '',
  })
  const draftYear = computed(() => Number(draft.occurredMonth.slice(0, 4)))
  const draftMonth = computed(() => Number(draft.occurredMonth.slice(5, 7)))

  const redirectToSaving = () => {
    router.replace({ name: 'saving' })
  }

  const resetDraft = () => {
    transactionId.value = null
    isDeleteConfirmOpen.value = false
    hasAmountError.value = false
    hasNoteError.value = false
    draft.type = 'expense'
    draft.amount = 0
    draft.occurredMonth = getCurrentMonth()
    draft.note = ''
  }

  watch(() => route.query.id, (queryId) => {
    resetDraft()

    if (queryId === undefined) return

    const value = Array.isArray(queryId) ? queryId[0] : queryId
    const parsedId = typeof value === 'string' ? Number(value) : Number.NaN
    const transaction = Number.isInteger(parsedId)
      ? savingStore.transactionList.find(item => item.id === parsedId)
      : undefined

    if (!transaction) {
      redirectToSaving()
      return
    }

    transactionId.value = transaction.id
    draft.type = transaction.type
    draft.amount = transaction.amount
    draft.occurredMonth = transaction.occurredMonth
    draft.note = transaction.note
  }, { immediate: true })

  const changeDraftMonth = (offset: number) => {
    const selectedMonth = new Date(draftYear.value, draftMonth.value - 1 + offset, 1)

    draft.occurredMonth = [
      selectedMonth.getFullYear(),
      String(selectedMonth.getMonth() + 1).padStart(2, '0'),
    ].join('-')
  }

  const submitTransaction = () => {
    const amount = Math.trunc(Number(draft.amount))

    hasAmountError.value = !Number.isFinite(amount) || amount <= 0
    hasNoteError.value = !draft.note.trim()

    if (hasAmountError.value || !draft.occurredMonth || hasNoteError.value) return

    const transactionData: SavingTransactionData = {
      type: draft.type,
      amount,
      occurredMonth: draft.occurredMonth,
      note: draft.note,
    }

    if (transactionId.value === null) {
      savingStore.addTransaction(transactionData)
    } else if (!savingStore.updateTransaction(transactionId.value, transactionData)) {
      redirectToSaving()
      return
    }

    redirectToSaving()
  }

  const confirmDeleteTransaction = () => {
    isDeleteConfirmOpen.value = false

    if (transactionId.value === null) return

    savingStore.deleteTransaction(transactionId.value)
    redirectToSaving()
  }
</script>

<style lang="scss" scoped>
.page.saveing-edit {
  padding-bottom: 140px;
  > h1 {
    @include h1();
  }
  > form {
    gap: 14px;
    margin-top: 24px;
    border-radius: 24px;
    @include flexbox(column, flex-start, stretch);
    > .form-field {
      width: 100%;
      min-width: 0;
      > label {
        color: $grey;
        display: block;
        font-size: 12px;
        margin-bottom: 5px;
        &.require::after {
          content: '*';
          color: $brown;
          font-size: 22px;
          display: inline-block;
          transform: translateY(-2px);
        }
      }
      > input {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        display: block;
        padding: 11px 12px;
        border-radius: 8px;
        border: 1px solid $oat;
        background-color: $background;
        &:focus {
          border-color: $yellow-dark;
        }
      }
      > .type-selector {
        gap: 8px;
        padding: 5px;
        border-radius: 12px;
        background-color: rgba($oat, .6);
        @include flexbox(row, center, center);
        > button {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          transition: background-color .2s;
          &.current {
            font-weight: 600;
            background-color: $yellow;
          }
        }
      }
      > .error-message {
        min-height: 22px;
        padding-top: 4px;
        position: relative;
        pointer-events: none;
        > b {
          top: 4px;
          left: 0;
          opacity: 0;
          font-weight: 400;
          position: absolute;
          pointer-events: none;
          transition: opacity .2s;
          @include p();
          &.show {
            opacity: 1;
          }
        }
      }
      > .month-selector {
        width: 100%;
        padding: 0;
        overflow: hidden;
        border-radius: 8px;
        border: 1px solid $oat;
        background-color: $background;
        @include flexbox(row, space-between, center);
        > strong {
          font-size: 14px;
          font-weight: 600;
        }
        > button {
          width: 48px;
          height: 46px;
          position: relative;
          border-radius: 0;
          &::before {
            top: 50%;
            left: 50%;
            width: 8px;
            height: 8px;
            content: '';
            position: absolute;
            border-left: 2px solid $black;
            border-bottom: 2px solid $black;
          }
          &.prev::before {
            transform: translate(-35%, -50%) rotate(45deg);
          }
          &.next::before {
            transform: translate(-65%, -50%) rotate(225deg);
          }
        }
      }
    }
    > .save-button {
      padding: 13px;
      font-weight: 600;
      margin-top: 4px;
      border-radius: 10px;
      background-color: $yellow;
    }
  }
}
</style>
