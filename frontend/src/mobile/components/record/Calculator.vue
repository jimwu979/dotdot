<template>
  <div class="component calculator">
    <section class="head">
      <div v-text="displayValue" />
      <button type="button" @click="openDateSelector" v-text="displayDate" />
    </section>
    <section class="keyboard">

      <button class="number" @click="inputNumber('7')" v-text="'7'" />
      <button class="number" @click="inputNumber('8')" v-text="'8'" />
      <button class="number" @click="inputNumber('9')" v-text="'9'" />
      <button class="plus"   @click="inputOperator('+')"><Plus /></button>

      <button class="number" @click="inputNumber('4')" v-text="'4'" />
      <button class="number" @click="inputNumber('5')" v-text="'5'" />
      <button class="number" @click="inputNumber('6')" v-text="'6'" />
      <button class="minus"  @click="inputOperator('-')"><Minus /></button>

      <button class="number"   @click="inputNumber('1')" v-text="'1'" />
      <button class="number"   @click="inputNumber('2')" v-text="'2'" />
      <button class="number"   @click="inputNumber('3')" v-text="'3'" />
      <button class="multiply" @click="inputOperator('×')"><X /></button>

      <button @click="deleteLastInput">
        <Delete />
      </button>
      <button class="number" @click="inputNumber('0')">0</button>
      <button @click="confirmInput">
        <Equal v-if="isCalculating" />
        <b v-else>儲存</b>
      </button>
      <button class="divide" @click="inputOperator('÷')"><Divide /></button>

    </section>
    <DateSelector
      :open="isDateSelectorOpen"
      :selected-date="occurredAt"
      @cancel="closeDateSelector"
      @confirm="confirmDate"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DateSelector from '@/mobile/components/record/DateSelector.vue'
import { Plus, Minus, X, Divide, Equal, Delete } from '@lucide/vue'

type Operator = '+' | '-' | '×' | '÷'

const props = defineProps<{
  amount: number
  occurredAt: string
}>()

  const emit = defineEmits<{
    save: [amount: number]
    'update:occurredAt': [date: string]
  }>()

  const isDateSelectorOpen = ref(false)
  const isCalculating = ref(false)
const hasCalculationError = ref(false)
const expressionTokens = ref<string[]>(['0'])
const operators: Operator[] = ['+', '-', '×', '÷']
const isOperator = (value: string): value is Operator => (
  operators.includes(value as Operator)
)
const displayValue = computed(() => expressionTokens.value
  .map(token => isOperator(token) ? ` ${token} ` : token)
  .join(''),
)
const displayDate = computed(() => {
  const [, month, date] = props.occurredAt.split('-').map(Number)

  return month && date ? `${month}/${date}` : ''
})

watch(() => props.amount, (amount) => {
  expressionTokens.value = [String(amount)]
  hasCalculationError.value = false
  isCalculating.value = false
}, { immediate: true })

  const resetCalculation = () => {
  expressionTokens.value = ['0']
  hasCalculationError.value = false
    isCalculating.value = false
  }

  const openDateSelector = () => {
    isDateSelectorOpen.value = true
  }

  const closeDateSelector = () => {
    isDateSelectorOpen.value = false
  }

  const confirmDate = (date: string) => {
    emit('update:occurredAt', date)
    closeDateSelector()
  }

const inputNumber = (number: string) => {
  if (hasCalculationError.value) resetCalculation()

  const lastTokenIndex = expressionTokens.value.length - 1
  const lastToken = expressionTokens.value[lastTokenIndex]

  if (isOperator(lastToken)) {
    expressionTokens.value.push(number)
    return
  }

  expressionTokens.value[lastTokenIndex] = lastToken === '0'
    ? number
    : `${lastToken}${number}`
}

const inputOperator = (operator: Operator) => {
  if (hasCalculationError.value) resetCalculation()

  const lastTokenIndex = expressionTokens.value.length - 1
  const lastToken = expressionTokens.value[lastTokenIndex]

  if (isOperator(lastToken)) {
    expressionTokens.value[lastTokenIndex] = operator
  } else {
    expressionTokens.value.push(operator)
  }

  isCalculating.value = true
}

const deleteLastInput = () => {
  if (hasCalculationError.value) {
    resetCalculation()
    return
  }

  const lastTokenIndex = expressionTokens.value.length - 1
  const lastToken = expressionTokens.value[lastTokenIndex]

  if (isOperator(lastToken) || lastToken.length === 1) {
    if (expressionTokens.value.length === 1) {
      expressionTokens.value = ['0']
    } else {
      expressionTokens.value.pop()
    }
  } else {
    expressionTokens.value[lastTokenIndex] = lastToken.slice(0, -1)
  }

  isCalculating.value = expressionTokens.value.some(isOperator)
}

const calculateResult = () => {
  const tokens = expressionTokens.value

  if (!isCalculating.value || isOperator(tokens.at(-1) ?? '')) return

  let result = Number(tokens[0])

  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index] as Operator
    const operand = Number(tokens[index + 1])

    if (operator === '+') result += operand
    if (operator === '-') result -= operand
    if (operator === '×') result *= operand

    if (operator === '÷') {
      if (operand === 0) {
        expressionTokens.value = ['無法除以 0']
        hasCalculationError.value = true
        isCalculating.value = false
        return
      }

      result /= operand
    }
  }

  const normalizedResult = Number(result.toFixed(10))

  expressionTokens.value = [String(normalizedResult)]
  isCalculating.value = false
}

const confirmInput = () => {
  if (isCalculating.value) {
    calculateResult()
    return
  }

  if (!hasCalculationError.value) {
    emit('save', Number(expressionTokens.value[0]))
  }
}
</script>

<style scoped lang="scss">
  .component.calculator{
    padding: 1px;
    background-color: $oat;
    position: fixed;
    bottom: $header_height;
    left: 0;
    width: 100%;
    @include flexbox(column, flex-start, stretch);
    $gap: 1px;
    gap: $gap;
    >section{
      gap: $gap;
      @include flexbox(row, flex-start, flex-start);
      >*{
        @include h2();
        height: 60px;
        background-color: $white;
        >b{
          @include h3();
        }
      }
      &.head{
        >div{
          @include h2();
          padding: 22px;
          overflow-x: auto;
          white-space: nowrap;
          width: calc(((100% - ($gap * 3))/4) * 3 + ($gap * 2));
          @include flexbox(row, flex-end, center);
        }
        >button{
          width: calc((100% - ($gap * 3))/4);
        }
      }
      &.keyboard{
        flex-wrap: wrap;
        >button{
          width: calc((100% - ($gap * 3))/4);
          &:nth-of-type(4n+1){

          }
        }
      }
    }
  }
</style>
