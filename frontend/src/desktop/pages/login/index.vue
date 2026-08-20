<template>
  <AuthShell eyebrow="歡迎回來" title="登入你的帳號" description="繼續記錄每一筆生活收支。">
    <div class="login-form">
      <p class="api-error" :class="{ show: apiError }">帳號或密碼錯誤</p>
      <form novalidate @submit.prevent="submit">
        <label>
          <span>帳號</span>
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
        <label>
          <span>密碼</span>
          <div>
            <input
              v-model="password"
              :class="{ error: passwordEmpty }"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="輸入密碼"
              @input="clearError('password')"
            >
            <button type="button" @click="showPassword = !showPassword">
              {{ showPassword ? '隱藏' : '顯示' }}
            </button>
          </div>
          <p class="error-message">
            <span :class="{ show: passwordEmpty }">請輸入密碼</span>
          </p>
        </label>
        <aside>
          <button type="button" @click="toggleRemember">
            <b :class="{ checked: remember }"><Check /></b>
            <span>記住我</span>
          </button>
          <RouterLink to="/desktop/forgot-password">忘記密碼？</RouterLink>
        </aside>
        <button class="primary btn-click-effect" type="submit" :disabled="isSubmitting">登入</button>
      </form>
      <footer>
        還沒有帳號？
        <RouterLink to="/desktop/register">立即註冊</RouterLink>
      </footer>
    </div>
  </AuthShell>
</template>

<script lang="ts" setup>
import { Check } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthShell from '@/desktop/components/login/AuthShell.vue'

type FieldName = 'email' | 'password'

const rememberedEmailKey = 'rememberedEmail'
const router = useRouter()
const email = ref('')
const password = ref('')
const remember = ref(false)
const apiError = ref(false)
const emailEmpty = ref(false)
const emailInvalid = ref(false)
const isSubmitting = ref(false)
const passwordEmpty = ref(false)
const showPassword = ref(false)

onMounted(() => {
  const rememberedEmail = localStorage.getItem(rememberedEmailKey)

  if (rememberedEmail) {
    email.value = rememberedEmail
    remember.value = true
  }
})

const toggleRemember = () => {
  remember.value = !remember.value

  if (remember.value) localStorage.setItem(rememberedEmailKey, email.value)
  else localStorage.removeItem(rememberedEmailKey)
}

const validate = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  emailEmpty.value = !email.value
  emailInvalid.value = Boolean(email.value) && !emailPattern.test(email.value)
  passwordEmpty.value = !password.value

  return !emailEmpty.value && !emailInvalid.value && !passwordEmpty.value
}

const clearError = (field: FieldName) => {
  if (field === 'email') {
    emailEmpty.value = false
    emailInvalid.value = false
  } else {
    passwordEmpty.value = false
  }

  apiError.value = false
}

const loginApi = (data: { email: string, password: string }) => {
  return new Promise<{ success: boolean }>((resolve, reject) => {
    window.setTimeout(() => {
      if (data.email === 'demo@dotdot.com' && data.password === 'demo') {
        resolve({ success: true })
        return
      }

      reject(new Error('INVALID_CREDENTIALS'))
    }, 500)
  })
}

const submit = async () => {
  apiError.value = false
  if (!validate()) return

  isSubmitting.value = true
  try {
    await loginApi({ email: email.value, password: password.value })

    if (remember.value) localStorage.setItem(rememberedEmailKey, email.value)
    else localStorage.removeItem(rememberedEmailKey)

    await router.push('/')
  } catch {
    apiError.value = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
@use './form' as *;

.login-form {
  @include auth-form();

  > form > aside {
    margin: 2px 0 18px;
    @include flexbox(row, space-between, center);

    > button {
      gap: 8px;
      @include flexbox(row, flex-start, center);

      > b {
        width: 20px;
        height: 20px;
        border-radius: 5px;
        border: 1px solid $stone;
        transition: border-color .2s, background-color .2s;
        @include flexbox(row, center, center);

        > svg {
          width: 14px;
          opacity: 0;
          stroke: $white;
          transition: opacity .2s;
        }

        &.checked {
          border-color: $mustard;
          background-color: $mustard;

          > svg {
            opacity: 1;
          }
        }
      }
    }

    > a {
      color: $brown;
      font-weight: 600;
    }
  }
}
</style>
