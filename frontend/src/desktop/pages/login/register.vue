<template>
  <AuthShell
    eyebrow="建立帳號"
    title="開始使用 dotdot"
    description="建立你的專屬記帳空間。"
    wide
  >
    <div class="register-form">
      <p class="api-error" :class="{ show: apiError }">註冊失敗，請稍後再試</p>
      <form novalidate @submit.prevent="submit">
        <div class="field-row">
          <label>
            <span>暱稱</span>
            <input
              v-model.trim="name"
              :class="{ error: nameEmpty }"
              autocomplete="name"
              placeholder="輸入你的暱稱"
              @input="clearError('name')"
            >
            <p class="error-message">
              <span :class="{ show: nameEmpty }">請輸入暱稱</span>
            </p>
          </label>
          <label>
            <span>電子信箱</span>
            <input
              v-model.trim="email"
              :class="{ error: emailEmpty || emailInvalid }"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
              @input="clearError('email')"
            >
            <p class="error-message">
              <span :class="{ show: emailEmpty }">請輸入電子信箱</span>
              <span :class="{ show: emailInvalid }">請輸入正確的電子信箱格式</span>
            </p>
          </label>
        </div>
        <div class="field-row">
          <label>
            <span>密碼</span>
            <input
              v-model="password"
              :class="{ error: passwordEmpty }"
              type="password"
              autocomplete="new-password"
              placeholder="輸入密碼"
              @input="clearError('password')"
            >
            <p class="error-message">
              <span :class="{ show: passwordEmpty }">請輸入密碼</span>
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
        </div>
        <button class="primary btn-click-effect" type="submit" :disabled="isSubmitting">建立帳號</button>
      </form>
      <footer>
        已經有帳號？
        <RouterLink to="/desktop/login">返回登入</RouterLink>
      </footer>
    </div>
  </AuthShell>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthShell from '@/desktop/components/login/AuthShell.vue'

type FieldName = 'name' | 'email' | 'password' | 'confirmPassword'

const router = useRouter()
const name = ref('')
const email = ref('')
const apiError = ref(false)
const nameEmpty = ref(false)
const password = ref('')
const emailEmpty = ref(false)
const emailInvalid = ref(false)
const isSubmitting = ref(false)
const passwordEmpty = ref(false)
const confirmPassword = ref('')
const passwordMismatch = ref(false)
const confirmPasswordEmpty = ref(false)

const validate = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  nameEmpty.value = !name.value
  emailEmpty.value = !email.value
  passwordEmpty.value = !password.value
  emailInvalid.value = Boolean(email.value) && !emailPattern.test(email.value)
  confirmPasswordEmpty.value = !confirmPassword.value
  passwordMismatch.value = Boolean(confirmPassword.value) && password.value !== confirmPassword.value

  return !nameEmpty.value && !emailEmpty.value && !emailInvalid.value
    && !passwordEmpty.value && !confirmPasswordEmpty.value && !passwordMismatch.value
}

const clearError = (field: FieldName) => {
  if (field === 'name') nameEmpty.value = false
  if (field === 'email') {
    emailEmpty.value = false
    emailInvalid.value = false
  }
  if (field === 'password') passwordEmpty.value = false
  if (field === 'confirmPassword') {
    confirmPasswordEmpty.value = false
    passwordMismatch.value = false
  }
  apiError.value = false
}

const registerApi = () => new Promise<{ success: boolean }>((resolve) => {
  window.setTimeout(() => resolve({ success: true }), 500)
})

const submit = async () => {
  apiError.value = false
  if (!validate()) return

  isSubmitting.value = true
  try {
    await registerApi()
    await router.push('/desktop/register-complete')
  } catch {
    apiError.value = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
@use './form' as *;

.register-form {
  @include auth-form();

  > form > .field-row {
    gap: 18px;
    @include flexbox(row, flex-start, flex-start);

    > label {
      flex: 1;
      min-width: 0;
      font-weight: 600;
      @include flexbox(column, flex-start, stretch);

      > input {
        width: 100%;
        height: 50px;
        padding: 0 15px;
        margin-top: 6px;
        border-radius: 10px;
        border: 1px solid $stone;
        background-color: $white;
        transition: border-color .2s, box-shadow .2s;

        &:focus {
          border-color: $mustard;
          box-shadow: 0 0 0 3px rgba($mustard, .1);
        }

        &.error {
          border-color: $red;
          box-shadow: none;
        }
      }

      > .error-message {
        height: 25px;
        line-height: 1;
        position: relative;
        pointer-events: none;

        > span {
          top: 2px;
          left: 0;
          opacity: 0;
          color: $red;
          font-size: 12px;
          line-height: 18px;
          position: absolute;
          pointer-events: none;
          transition: opacity .2s;

          &.show {
            opacity: 1;
            pointer-events: auto;
          }
        }
      }
    }
  }
}
</style>
