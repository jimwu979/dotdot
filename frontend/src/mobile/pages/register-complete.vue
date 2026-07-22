<template>
  <main class="page register-complete">
    <header>
      <strong>dotdot.</strong>
      <p>簡單記帳，安心生活</p>
    </header>
    <section>
      <div aria-hidden="true">✓</div>
      <span>註冊完成</span>
      <h1>歡迎加入 dotdot！</h1>
      <p>帳號已建立完成，現在就開始記錄第一筆吧。</p>
      <RouterLink to="/mobile/login">開始登入</RouterLink>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { RouterLink } from 'vue-router'
</script>

<style lang="scss" scoped>
.register-complete {
  gap: 28px;
  padding: 40px 24px 0;
  @include flexbox(column, center, stretch);

  > header {
    text-align: center;

    > strong {
      font-size: 30px;
      font-weight: 600;
    }

    > p {
      color: $grey;
      margin-top: 4px;
    }
  }

  > section {
    padding: 36px 22px;
    text-align: center;
    border: 1px solid $oat;
    border-radius: 24px;
    background-color: $white;
    box-shadow: 0 18px 50px rgba(73, 62, 28, .08);
    @include flexbox(column, flex-start, center);

    > div {
      width: 88px;
      height: 88px;
      font-size: 42px;
      font-weight: 600;
      border-radius: 50%;
      margin-bottom: 24px;
      background-color: $yellow;
      @include flexbox(row, center, center);
    }

    > span {
      color: $mustard;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 2px;
    }

    > h1 {
      margin-top: 8px;
      font-weight: 600;
      @include h2();
    }

    > p {
      color: $grey;
      margin-top: 12px;
    }

    > a {
      width: 100%;
      height: 52px;
      margin-top: 28px;
      font-weight: 600;
      border-radius: 13px;
      background-color: $yellow;
      @include flexbox(row, center, center);
    }
  }
}
</style>
