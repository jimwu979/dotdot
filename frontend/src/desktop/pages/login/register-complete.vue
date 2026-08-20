<template>
  <AuthShell eyebrow="註冊完成" title="歡迎加入 dotdot！" description="你的帳號已經準備好了。">
    <div class="complete-content">
      <div class="complete-icon"><Check /></div>
      <p>帳號已建立完成，現在就開始記錄第一筆吧。</p>
      <RouterLink class="btn-click-effect" to="/desktop/login">開始登入</RouterLink>
    </div>
  </AuthShell>
</template>

<script lang="ts" setup>
import { Check } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import AuthShell from '@/desktop/components/login/AuthShell.vue'
</script>

<style lang="scss" scoped>
.complete-content {
  text-align: center;
  @include flexbox(column, flex-start, center);

  > .complete-icon {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    margin-bottom: 24px;
    background-color: rgba($yellow, .5);
    @include flexbox(row, center, center);

    > svg {
      width: 40px;
      height: 40px;
      stroke: $brown;
      stroke-width: 2.5;
    }
  }

  > p {
    color: $grey;
    font-size: 15px;
  }

  > a {
    width: 100%;
    height: 50px;
    margin-top: 30px;
    font-weight: 600;
    border-radius: 10px;
    background-color: $yellow;
    @include flexbox(row, center, center);
  }
}
</style>
