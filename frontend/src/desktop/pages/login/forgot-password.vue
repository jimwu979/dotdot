<template>
  <AuthShell
    eyebrow="忘記密碼"
    title="找回你的帳號"
    description="輸入註冊信箱，我們會寄送重設密碼連結。"
  >
    <div class="forgot-form">
      <form novalidate @submit.prevent="submit">
        <label>
          <span>電子信箱</span>
          <input
            v-model.trim="email"
            :class="{ error: emailEmpty || emailInvalid }"
            type="email"
            autocomplete="email"
            placeholder="name@example.com"
            @input="clearEmailError"
          >
          <p class="error-message">
            <span :class="{ show: emailEmpty }">請輸入電子信箱</span>
            <span :class="{ show: emailInvalid }">請輸入正確的電子信箱格式</span>
          </p>
        </label>
        <button class="primary btn-click-effect" type="submit">寄送重設連結</button>
      </form>
      <footer>
        <RouterLink to="/desktop/login">← 返回登入</RouterLink>
      </footer>
    </div>
  </AuthShell>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthShell from '@/desktop/components/login/AuthShell.vue'

const email = ref('')
const router = useRouter()
const emailEmpty = ref(false)
const emailInvalid = ref(false)

const clearEmailError = () => {
  emailEmpty.value = false
  emailInvalid.value = false
}

const submit = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  emailEmpty.value = !email.value
  emailInvalid.value = Boolean(email.value) && !emailPattern.test(email.value)

  if (emailEmpty.value || emailInvalid.value) return

  router.push('/desktop/reset-password')
}
</script>

<style lang="scss" scoped>
@use './form' as *;

.forgot-form {
  @include auth-form();
}
</style>
