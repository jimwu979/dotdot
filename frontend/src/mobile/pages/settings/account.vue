<template>
  <main class="page account">
    <Breadcrumb
      :items="[
        { url: '/mobile/settings', text: '設定' },
        { url: '/mobile/settings', text: '帳號' },
        { url: '', text: '姓名' },
      ]"
    />
    <AppHeader title="設定" />
    <section>
      <h1>帳號</h1>

      <!-- 姓名 -->
      <div v-if="route.query.view === 'name'">
        <label>姓名</label>
        <input v-model.trim="name" type="text">
        <p class="error-message">
          <b :class="{ show: errors.nameEmpty }">此欄位不得空白</b>
        </p>
      </div>

      <!-- email -->
      <div v-if="route.query.view === 'email'">
        <label>email</label>
        <input v-model.trim="email" type="email">
        <p class="error-message">
          <b :class="{ show: errors.emailEmpty }">此欄位不得空白</b>
          <b :class="{ show: errors.emailInvalid }">email格式填寫錯誤</b>
        </p>
      </div>

      <!-- 密碼 -->
      <div v-if="route.query.view === 'password'">

        <label>舊密碼</label>
        <input v-model="oldPassword" type="password">
        <p class="error-message">
          <b :class="{ show: errors.oldPasswordEmpty }">此欄位不得空白</b>
          <b :class="{ show: errors.oldPasswordIncorrect }">密碼錯誤</b>
        </p>

        <label>新密碼</label>
        <input v-model="newPassword" type="password">
        <p class="error-message">
          <b :class="{ show: errors.newPasswordEmpty }">此欄位不得空白</b>
        </p>

        <label>確認新密碼</label>
        <input v-model="confirmPassword" type="password">
        <p class="error-message">
          <b :class="{ show: errors.confirmPasswordEmpty }">此欄位不得空白</b>
          <b :class="{ show: errors.passwordMismatch }">新密碼與確認新密碼不一致</b>
        </p>
      </div>

      <button type="button" @click="submit">確認</button>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/mobile/components/AppHeader.vue'
import Breadcrumb from '@/mobile/components/Breadcrumb.vue'

const route           = useRoute()

const name            = ref('')    // 姓名
const email           = ref('')    // Email
const oldPassword     = ref('')    // 舊密碼
const newPassword     = ref('')    // 新密碼
const confirmPassword = ref('')    // 確認密碼
const emailPattern    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Email格式

const errors = reactive({
  nameEmpty:            false, // 姓名     是否空白
  emailEmpty:           false, // Email    是否空白
  oldPasswordEmpty:     false, // 舊密碼   是否空白
  newPasswordEmpty:     false, // 新密碼   是否空白
  confirmPasswordEmpty: false, // 確認密碼 是否空白

  emailInvalid:         false, // Email 格式錯誤
  oldPasswordIncorrect: false, // 舊密碼 錯誤
  passwordMismatch:     false, // 新密碼填寫不一致
})

const submit = () => {
  const currentView = route.query.view

  switch (currentView) {
    case 'name':
      errors.nameEmpty = !name.value
      if (errors.nameEmpty) return
      break

    case 'email':
      errors.emailEmpty = !email.value
      errors.emailInvalid = Boolean(email.value) && !emailPattern.test(email.value)
      if (errors.emailEmpty || errors.emailInvalid) return
      break

    case 'password':
      errors.oldPasswordEmpty = !oldPassword.value
      errors.newPasswordEmpty = !newPassword.value
      errors.confirmPasswordEmpty = !confirmPassword.value
      errors.passwordMismatch = Boolean(newPassword.value)
        && Boolean(confirmPassword.value)
        && newPassword.value !== confirmPassword.value

      if (
        errors.oldPasswordEmpty
        || errors.newPasswordEmpty
        || errors.confirmPasswordEmpty
        || errors.passwordMismatch
      ) return
      break

    default:
      return
  }

  // 前端驗證通過後，在這裡串接對應的更新 API。
}
</script>

<style lang="scss" scoped>
.page.account {
  gap: 20px;
  @include flexbox(column, flex-start, stretch);
  >section {
    gap: 20px;
    padding: 20px 16px;
    border-radius: 12px;
    border: 1px solid $stone;
    background-color: $white;
    box-shadow: 0 8px 24px rgba(73, 62, 28, .06);
    @include flexbox(column, flex-start, flex-start);
    >h1 {
      @include h3();
    }
    >div {
      width: 100%;
      @include flexbox(column, flex-start, stretch);
      >label {
        color: $grey;
        font-weight: 600;
        margin-bottom: 8px;
        @include p();
        ~label {
          margin-top: 20px;
        }
      }
      >input {
        width: 100%;
        height: 50px;
        padding: 0 14px;
        border-radius: 10px;
        border: 1px solid $stone;
        background-color: $background;
        transition: border-color .2s, box-shadow .2s, background-color .2s;
        &:focus {
          outline: none;
          border-color: $mustard;
          background-color: $white;
          box-shadow: 0 0 0 3px rgba(155, 123, 0, .12);
        }
      }
      >.error-message {
        min-height: 22px;
        padding-top: 4px;
        position: relative;
        pointer-events: none;
        >b {
          left: 0;
          top: 4px;
          opacity: 0;
          color: $red;
          font-weight: 400;
          position: absolute;
          pointer-events: none;
          transition: opacity .2s;
          @include p();
          &.show {
            opacity: 1;
            pointer-events: auto;
          }
        }
      }
    }
    >button {
      height: 50px;
      color: $black;
      @include h3();
      padding: 0 12px;
      min-width: 90px;
      margin-top: 4px;
      border-radius: 10px;
      align-self: flex-end;
      background-color: $yellow;
      transition: background-color .2s, transform .1s;
      &:active {
        transform: scale(.98);
        background-color: $yellow-hover;
      }
    }
  }
}
</style>
