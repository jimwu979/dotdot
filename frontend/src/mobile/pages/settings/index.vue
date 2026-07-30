<template>
  <main class="page settings">
    <section
      v-for="(i, index) in [
        {
          title: '帳號',
          route: 'account',
          link: [
            { label: '姓名', query: 'name' },
            { label: 'Email', query: 'email' },
            { label: '重設密碼', query: 'password' },
          ]
        },
        {
          title: '週期',
          route: 'cycle',
          link: [
            { label: '點點記帳', query: 'dotdot' },
            { label: '自動記帳', query: 'automatic' },
          ]
        },
        {
          title: '類別',
          route: 'type',
          link: [
            { label: '收入', query: 'income' },
            { label: '支出', query: 'expense' },
          ]
        },
      ]" :key="index"
    >
      <h2>{{ i.title }}</h2>
      <div>
        <router-link
          v-for="(n, n_index) in i.link"
          :key="n_index"
          :to="`/mobile/settings/${i.route}?view=${n.query}`"
        >
          <h3>{{ n.label }}</h3>
          <img src="/arrow_line_black.png">
        </router-link>
      </div>
    </section>
    <AppHeader />
  </main>
</template>

<script lang="ts" setup>
import AppHeader from '@/mobile/components/AppHeader.vue'
</script>

<style lang="scss" scoped>
.page.settings{
  gap: 12px;
  @include flexbox(column, flex-start, stretch);
  >section{
    gap: 12px;
    border-radius: 8px;
    padding: 12px;
    border: 1px solid $stone;
    background-color: $white;
    @include flexbox(column, flex-start, stretch);
    ~section{

    }
    >h2{
      color: $grey-light;
      @include h3();
    }
    >div{
      @include flexbox(column, flex-start, stretch);
      >a{
        height: 46px;
        @include flexbox(row, space-between, center);
        >h3{

        }
        >img{
          width: 12px;
          opacity: .4;
          transform: rotateZ(90deg);
        }
        ~ a {
          border-top: 1px solid $oat;
        }
      }
    }
  }
}
</style>
