<template>
  <main class="page auth-page">
    <aside class="brand-panel">
      <div class="brand-mark" aria-hidden="true">
        <span />
        <span />
      </div>
      <strong>dotdot.</strong>
      <h1>點點記帳</h1>
      <p>簡單記帳，安心生活</p>
    </aside>
    <section class="content-panel">
      <div class="auth-card" :class="{ wide }">
        <header>
          <span>{{ eyebrow }}</span>
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </header>
        <slot />
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  eyebrow: string
  title: string
  description?: string
  wide?: boolean
}>(), {
  description: '',
  wide: false,
})
</script>

<style lang="scss" scoped>
.auth-page {
  min-width: 960px;
  min-height: 100dvh;
  @include flexbox(row, flex-start, stretch);
}

.brand-panel {
  width: 40%;
  min-width: 380px;
  max-width: 620px;
  padding: 64px;
  overflow: hidden;
  position: relative;
  background-color: $yellow;
  @include flexbox(column, center, flex-start);

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba($black, .08);
  }

  &::before {
    width: 460px;
    height: 460px;
    right: -240px;
    top: -180px;
  }

  &::after {
    width: 320px;
    height: 320px;
    left: -180px;
    bottom: -150px;
  }

  > .brand-mark {
    gap: 9px;
    width: 64px;
    height: 64px;
    border-radius: 24px;
    margin-bottom: 30px;
    background-color: $white;
    box-shadow: 0 16px 40px rgba($brown, .14);
    @include flexbox(row, center, center);

    > span {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: $black;
    }
  }

  > strong {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: .5px;
  }

  > h1 {
    margin-top: 10px;
    @include h1();
  }

  > p {
    color: rgba($black, .62);
    font-size: 17px;
    margin-top: 14px;
  }
}

.content-panel {
  flex: 1;
  min-width: 0;
  padding: 48px 64px;
  overflow-y: auto;
  background-color: $background;
  @include flexbox(column, center, center);

  > .auth-card {
    width: 100%;
    max-width: 440px;
    padding: 42px;
    border-radius: 24px;
    border: 1px solid $oat;
    background-color: $white;
    box-shadow: 0 20px 60px rgba(73, 62, 28, .09);

    &.wide {
      max-width: 520px;
    }

    > header {
      margin-bottom: 30px;

      > span {
        color: $mustard;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 2px;
      }

      > h2 {
        margin-top: 8px;
        @include h2();
      }

      > p {
        color: $grey;
        font-size: 15px;
        margin-top: 12px;
      }
    }
  }
}
</style>
