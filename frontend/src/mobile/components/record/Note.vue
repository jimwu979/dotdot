<template>
  <div class="component note">
    <input
      :value="modelValue"
      :placeholder="placeholder"
      type="text"
      @input="updateValue"
    >
  </div>
</template>

<script lang="ts" setup>
  withDefaults(defineProps<{
    modelValue: string
    placeholder?: string
  }>(), {
    placeholder: '輸入備註',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const updateValue = (event: Event) => {
    emit('update:modelValue', (event.target as HTMLInputElement).value)
  }
</script>

<style lang="scss" scoped>
  .component.note{
    width: 100%;
    >input{
      width: 100%;
      height: 50px;
      color: $black;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid $stone;
      background-color: $white;
      transition: border-color .2s;
      &::placeholder{
        color: $grey-light;
      }
      &:focus{
        border-color: $mustard;
      }
    }
  }
</style>
