<template>
  <section class="records">
    <article v-for="(i, index) in list" :key="index">
      <div class="date">
        <strong>7/{{ i.day }}</strong>
        <span>{{ i.week }}</span>
        <b>總計: {{ +2000 }}</b>
      </div>
      <div class="list">
        <router-link v-for="(n, n_index) in i.record" :key="n_index" :to="''">
          <transaction
            :icon="n.icon"
            :color="n.color"
            :category="n.category"
            :is-expense="n.isExpense"
            :tag="n.tag"
            :note="n.note"
            :amount="n.amount"
          />
        </router-link>
      </div>
    </article>
  </section>
</template>

<script lang="ts" setup>
  import Transaction from '@/mobile/components/transaction.vue'

  interface RecordItem {
    icon: string
    color: string
    category: string
    isExpense: boolean
    tag: string[]
    note: string
    amount: number
  }

  interface DailyRecords {
    day: number
    week: string
    record: RecordItem[]
  }

  defineProps<{
    list: DailyRecords[]
  }>()
</script>

<style lang="scss" scoped>
.records {
  margin-top: 30px;
  > article {
    overflow: hidden;
    margin-top: 10px;
    border-radius: 8px;
    border: 1px solid $oat;
    background-color: $white;
    @include flexbox(column, flex-start, stretch);
    > .date {
      width: 100%;
      padding: 0 12px;
      text-align: center;
      border-bottom: 1px solid $oat;
      @include flexbox(row, flex-start, center);
      > * {
        color: $grey-light;
      }
      > strong {
        display: block;
      }
      > span {
        flex: 1;
        font-size: 11px;
        text-align: left;
        padding-left: 12px;
      }
      > b{
      }
    }
    > .list {
      width: 100%;
      padding: 8px;
      > a {
        height: 46px;
        @include flexbox(row, flex-start, center);
      }
    }
  }
}
</style>
