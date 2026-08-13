<template>
  <main class="page reset-password">
    <header>
      <strong>dotdot.</strong>
      <p>簡單記帳，安心生活</p>
    </header>
    <section>
      <p class="api-error" :class="{ show: apiError }">
        密碼更新失敗，請稍後再試
      </p>
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
        <RouterLink class="btn-color-effect" to="/mobile/login">← 返回登入</RouterLink>
      </footer>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

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
    await router.push('/mobile/login')
  } catch {
    apiError.value = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.reset-password {
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
    border-radius: 24px;
    border: 1px solid $oat;
    padding: 12px 22px 22px;
    background-color: $white;
    @include flexbox(column, flex-start, stretch);
    box-shadow: 0 18px 50px rgba(73, 62, 28, .08);
    > .api-error {
      opacity: 0;
      color: $red;
      line-height: 18px;
      text-align: center;
      pointer-events: none;
      transition: opacity .2s;
      &.show {
        opacity: 1;
        pointer-events: auto;
      }
    }
    > form {
      @include flexbox(column, flex-start, stretch);
      > label {
        @include flexbox(column, flex-start, stretch);
        > input {
          width: 100%;
          height: 50px;
          padding: 0 15px;
          border-radius: 12px;
          border: 1px solid $stone;
          background-color: $white;
        }
        > input.error {
          border-color: $red;
        }
        > .error-message {
          height: 24px;
          line-height: 1;
          position: relative;
          pointer-events: none;
          > span {
            top: 0;
            left: 0;
            opacity: 0;
            color: $red;
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
      > .primary {
        width: 100%;
        height: 52px;
        margin-top: 6px;
        font-weight: 600;
        border-radius: 13px;
        background-color: $yellow;
        &:disabled {
          opacity: .6;
          cursor: default;
        }
      }
    }
    > footer {
      margin-top: 12px;
      text-align: center;
      > a {
        color: $brown;
        font-weight: 600;
      }
    }
  }
}
</style>
