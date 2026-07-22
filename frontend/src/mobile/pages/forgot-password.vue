<template>
  <main class="page forgot-password">
    <header>
      <strong>dotdot.</strong>
      <p>簡單記帳，安心生活</p>
    </header>
    <section>
      <div>
        <span>忘記密碼</span>
        <h1>找回你的帳號</h1>
        <p>輸入註冊信箱，我們會寄送重設密碼連結。</p>
      </div>
      <form @submit.prevent="submit">
        <label>
          <span>電子信箱</span>
          <input
            v-model.trim="email"
            type="email"
            autocomplete="email"
            placeholder="name@example.com"
            required
          >
        </label>
        <button type="submit">寄送重設連結</button>
      </form>
      <footer>
        <RouterLink to="/mobile/login">← 返回登入</RouterLink>
      </footer>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const email = ref('')
const router = useRouter()
const submit = () => router.push('/mobile/reset-password')
</script>

<style lang="scss" scoped>
.forgot-password {
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
    gap: 28px;
    padding: 28px 22px;
    border-radius: 24px;
    border: 1px solid $oat;
    background-color: $white;
    @include flexbox(column, flex-start, stretch);
    box-shadow: 0 18px 50px rgba(73, 62, 28, .08);
    > div {
      text-align: center;
      > span {
        color: $mustard;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 2px;
      }
      > h1 {
        @include h2();
        margin-top: 8px;
        font-weight: 600;
      }
      > p {
        color: $grey;
        margin-top: 10px;
      }
    }

    > form {
      gap: 20px;
      @include flexbox(column, flex-start, stretch);
      > label {
        gap: 7px;
        font-weight: 600;
        @include flexbox(column, flex-start, stretch);
        > input {
          width: 100%;
          height: 50px;
          padding: 0 15px;
          border-radius: 12px;
          border: 1px solid $stone;
          background-color: $white;
        }
      }
      > button {
        width: 100%;
        height: 52px;
        font-weight: 600;
        border-radius: 13px;
        background-color: $yellow;
      }
    }
    > footer {
      text-align: center;
      > a {
        color: $brown;
        font-weight: 600;
      }
    }
  }
}
</style>
