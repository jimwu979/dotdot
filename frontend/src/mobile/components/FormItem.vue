<template>
  <section class="component form-item">
    <label :class="{ require: props.require }">{{ props.label }}</label>
    <div>
      <slot />
    </div>
  </section>
</template>

<script lang="ts" setup>
  const props = withDefaults(defineProps<{
    label: string
    require?: boolean
  }>(), {
    require: false,
  })
</script>

<style lang="scss" scoped>
  .component.form-item{
    gap: 6px;
    @include flexbox(column, flex-start, flex-start);
    >label{
      color: $grey;
      @include h3();
      &.require{
        &:after{
          content: '*';
          color: $brown;
          font-size: 22px;
          display: inline-block;
          transform: translateY(-2px);
        }
      }
    }
    >div{
      width: 100%;
      margin-top: 4px;
    }
  }
</style>
