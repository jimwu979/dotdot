<template>
  <button class="component closeBtn" />
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.component.closeBtn {
  width: 30px;
  transition: .2s;
  aspect-ratio: 1/1;
  position: relative;
  border-radius: 50%;
  background-color: rgba(255,255,255,.4);
  &:before, &:after{
    left: 4px;
    height: 2px;
    content: '';
    position: absolute;
    border-radius: 99px;
    top: calc(50% - 1px);
    display: inline-block;
    width: calc(100% - 8px);
    background-color: $black;
  }
  &:before{
    transform: rotateZ(45deg);
  }
  &:after{
    transform: rotateZ(-45deg);
  }
  &:hover{
    background-color: $yellow-hover;
  }
}
</style>
