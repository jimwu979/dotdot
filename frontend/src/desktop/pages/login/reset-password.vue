<template>
  <AuthShell eyebrow="重設密碼" title="設定新的密碼" description="請輸入並再次確認你的新密碼。">
    <div class="reset-form">
      <p class="api-error" :class="{ show: apiError }">密碼更新失敗，請稍後再試</p>
      <form novalidate @submit.prevent="submit">
        <label>
          <span>新密碼</span>
          <input
            v-model="password"
            :class="{ error: passwordEmpty }"
            type="password"
            autocomplete="new-password"
            placeholder="輸入新密碼"
            @input="clearError('password')"
          >
          <p class="error-message">
            <span :class="{ show: passwordEmpty }">請輸入新密碼</span>
          </p>
        </label>
        <label>
          <span>確認密碼</span>
          <input
            v-model="confirmPassword"
            :class="{ error: confirmPasswordEmpty || passwordMismatch }"
            type="password"
            autocomplete="new-password"
            placeholder="再次輸入密碼"
            @input="clearError('confirmPassword')"
          >
          <p class="error-message">
            <span :class="{ show: confirmPasswordEmpty }">請再次輸入密碼</span>
            <span :class="{ show: passwordMismatch }">兩次輸入的密碼不一致</span>
          </p>
        </label>
        <button class="primary btn-click-effect" type="submit" :disabled="isSubmitting">更新密碼</button>
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

const router = useRouter()
const apiError = ref(false)
const password = ref('')
const isSubmitting = ref(false)
const passwordEmpty = ref(false)
const confirmPassword = ref('')
const passwordMismatch = ref(false)
const confirmPasswordEmpty = ref(false)

const validate = () => {
  passwordEmpty.value = !password.value
  confirmPasswordEmpty.value = !confirmPassword.value
  passwordMismatch.value = Boolean(confirmPassword.value) && password.value !== confirmPassword.value

  return !passwordEmpty.value && !confirmPasswordEmpty.value && !passwordMismatch.value
}

const clearError = (field: 'password' | 'confirmPassword') => {
  if (field === 'password') passwordEmpty.value = false
  else {
    confirmPasswordEmpty.value = false
    passwordMismatch.value = false
  }
  apiError.value = false
}

const resetPasswordApi = () => new Promise<{ success: boolean }>((resolve) => {
  window.setTimeout(() => resolve({ success: true }), 500)
})

const submit = async () => {
  apiError.value = false
  if (!validate()) return

  isSubmitting.value = true
  try {
    await resetPasswordApi()
    await router.push('/desktop/login')
  } catch {
    apiError.value = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
@use './form' as *;

.reset-form {
  @include auth-form();
}
</style>
