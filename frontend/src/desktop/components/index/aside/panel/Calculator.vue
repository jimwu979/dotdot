<template>
  <section class="component asideCalculator">
    <div class="display">{{ displayValue }}</div>
    <div class="keyboard">
      <button v-for="key in keys" :key="key" class="btn-click-effect" type="button" @click="pressKey(key)">
        <Delete v-if="key === 'delete'" />
        <Equal v-else-if="key === 'save' && isCalculating" />
        <span v-else-if="key === 'save'" class="save-icon"><Check /></span>
        <Plus v-else-if="key === '+'" />
        <Minus v-else-if="key === '-'" />
        <X v-else-if="key === '×'" />
        <Divide v-else-if="key === '÷'" />
        <span v-else>{{ key }}</span>
      </button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { Check, Delete, Divide, Equal, Minus, Plus, X } from '@lucide/vue'

type Operator = '+' | '-' | '×' | '÷'

const props = defineProps<{
  amount: number
}>()

const emit = defineEmits<{
  save: [amount: number]
}>()

const keys = ['7', '8', '9', '+', '4', '5', '6', '-', '1', '2', '3', '×', 'delete', '0', 'save', '÷'] as const
const operators: Operator[] = ['+', '-', '×', '÷']
const tokens = ref<string[]>(['0'])
const isOperator = (value: string): value is Operator => operators.includes(value as Operator)
const isCalculating = computed(() => tokens.value.some(isOperator))
const displayValue = computed(() => tokens.value.map(token => isOperator(token) ? ` ${token} ` : token).join(''))

watch(() => props.amount, (amount) => {
  tokens.value = [String(amount)]
}, { immediate: true })

const calculate = () => {
  if (isOperator(tokens.value.at(-1) ?? '') || tokens.value.length === 1) return

  let result = Number(tokens.value[0])

  for (let index = 1; index < tokens.value.length; index += 2) {
    const operator = tokens.value[index] as Operator
    const operand = Number(tokens.value[index + 1])

    if (operator === '+') result += operand
    if (operator === '-') result -= operand
    if (operator === '×') result *= operand
    if (operator === '÷' && operand !== 0) result = Math.ceil((result / operand) * 10) / 10
  }

  tokens.value = [String(Number(result.toFixed(10)))]
}
const pressKey = (key: typeof keys[number]) => {
  const lastIndex = tokens.value.length - 1
  const lastToken = tokens.value[lastIndex]

  if (key === 'save') {
    if (isCalculating.value) calculate()
    else emit('save', Number(tokens.value[0]))
    return
  }
  if (key === 'delete') {
    if (isOperator(lastToken) || lastToken.length === 1) {
      if (tokens.value.length === 1) tokens.value = ['0']
      else tokens.value.pop()
    } else {
      tokens.value[lastIndex] = lastToken.slice(0, -1)
    }
    return
  }
  if (isOperator(key)) {
    if (isOperator(lastToken)) tokens.value[lastIndex] = key
    else tokens.value.push(key)
    return
  }

  if (isOperator(lastToken)) tokens.value.push(key)
  else tokens.value[lastIndex] = lastToken === '0' ? key : `${lastToken}${key}`
}
</script>

<style lang="scss" scoped>
  .component.asideCalculator{
    overflow: hidden;
    border-radius: 16px;
    border: 1px solid $oat;
    >.display{
      height: 58px;
      padding: 0 18px;
      overflow-x: auto;
      font-size: 24px;
      font-weight: 600;
      white-space: nowrap;
      background-color: $white;
      @include flexbox(row, flex-end, center);
    }
    >.keyboard{
      gap: 1px;
      display: grid;
      padding-top: 1px;
      background-color: $oat;
      grid-template-columns: repeat(4, 1fr);
      >button{
        height: 46px;
        background-color: $white;
        @include flexbox(row, center, center);
        >span:not(.save-icon){
          font-size: 22px;
        }
        &:nth-child(4n),
        &:nth-child(13){
          background-color: #f7f6f1;
        }
        >svg{
          width: 24px;
        }
        >.save-icon{
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid $black;
          background-color: $yellow;
          @include flexbox(row, center, center);
          >svg{
            width: 80%;
          }
        }
      }
    }
  }
</style>
