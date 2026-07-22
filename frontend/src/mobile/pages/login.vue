<template>
  <main class="page login">
    <header>
      <div class="logo" />
      <h1>點點記帳</h1>
    </header>
    <section>
      <p class="api-error" :class="{ show: apiError }" role="alert">
        帳號或密碼錯誤
      </p>
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
          <p class="error-message" role="alert">
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
            <button 
              type="button" 
              @click="showPassword = !showPassword" v-text="showPassword ? '隱藏' : '顯示'" 
            />
          </div>
          <p class="error-message" role="alert">
            <span :class="{ show: passwordEmpty }">請輸入密碼</span>
          </p>
        </label>
        <aside>
          <label>
            <input v-model="remember" type="checkbox" @change="toggleRemember">
            記住我
          </label>
          <RouterLink to="/mobile/forgot-password">忘記密碼？</RouterLink>
        </aside>
        <button class="primary" type="submit" :disabled="isSubmitting">
          登入
        </button>
      </form>
      <footer>
        還沒有帳號？
        <RouterLink to="/mobile/register">立即註冊</RouterLink>
      </footer>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

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
.page.login {
  gap: 28px;
  padding: 40px 24px 0;
  @include flexbox(column, center, stretch);
  > header {
    text-align: center;
    @include flexbox(column, flex-start, center);
    >.logo{
      gap: 12px;
      width: 80px;
      aspect-ratio: 1/1;
      border-radius: 32px;
      background-color: $yellow;
      @include flexbox(row, center, center);
      &:before, &:after{
        width: 20px;
        content: '';
        aspect-ratio: 1/1;
        border-radius: 50%;
        display: inline-block;
        background-color: $black;
      }
    }
    >h1{
      @include h1();
      margin-top: 12px;
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
        > input,
        > div > input {
          width: 100%;
          height: 50px;
          padding: 0 15px;
          margin-top: 0px;
          border-radius: 12px;
          border: 1px solid $stone;
          background-color: $white;
        }
        > input.error,
        > div > input.error {
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
        > div {
          position: relative;
          > input {
            padding-right: 62px;
          }
          > button {
            right: 14px;
            bottom: 13px;
            color: $brown;
            font-weight: 600;
            position: absolute;
          }
        }
      }
      > aside {
        @include flexbox(row, space-between, center);
        > label {
          gap: 7px;
          @include flexbox(row, flex-start, center);
        }
        > a {
          color: $brown;
          font-weight: 600;
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
      color: $grey;
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
