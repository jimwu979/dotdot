<template>
  <section class="component monthSelector">
    <button class="prev btn-click-effect" type="button" @click="goToMonth(-1)">
      <ChevronLeft />
    </button>

    <div class="center">
      <button
        class="trigger btn-click-effect"
        type="button"
        :class="{'open': isOpen}"
        @click="toggleSelector"
      >
        <span>{{ year }} 年</span>
        <span>{{ month }} 月</span>
        <ChevronDown />
      </button>

      <div class="selector" :class="{'open': isOpen}" @click="markCurrentClick">
        <div class="yearControl">
          <button class="btn-click-effect" type="button" @click="changeBrowseYear(1)">
            <ChevronUp />
          </button>
          <button class="btn-click-effect" type="button" @click="changeBrowseYear(-1)">
            <ChevronDown />
          </button>
        </div>

        <TransitionGroup
          name="year-slide"
          tag="div"
          class="yearList"
          :class="{
            slideUp: slideDirection === 'up',
            slideDown: slideDirection === 'down',
          }"
        >
          <section v-for="browseYear in browseYears" :key="browseYear">
            <h2>{{ browseYear }}</h2>
            <div>
              <button
                v-for="browseMonth in monthOrder"
                :key="browseMonth"
                class="btn-click-effect"
                type="button"
                :class="{
                  now: browseYear === year && browseMonth === month,
                  current: isCurrentMonth(browseYear, browseMonth),
                  future: isFutureMonth(browseYear, browseMonth),
                }"
                @click="selectMonth(browseYear, browseMonth)"
              >
                <span>{{ browseMonth }}月</span>
              </button>
            </div>
          </section>
        </TransitionGroup>

        <button class="close btn-click-effect" type="button" @click="isOpen = false">
          <X />
        </button>
      </div>
    </div>

    <button class="next btn-click-effect" type="button" @click="goToMonth(1)">
      <ChevronRight />
    </button>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
} from '@lucide/vue'
import { useRouter } from 'vue-router'
import { useCloseOnBodyClick } from '@/shared/composables/useCloseOnBodyClick'

const props = defineProps<{
  year: number
  month: number
}>()

const router = useRouter()
const now = new Date()
const isOpen = ref(false)
const browseStartYear = ref(props.year)
const slideDirection = ref<'up' | 'down'>('up')
const monthOrder = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6]
const browseYears = computed(() => (
  Array.from({ length: 3 }, (_, index) => browseStartYear.value - index)
))
const { markCurrentClick } = useCloseOnBodyClick(
  () => isOpen.value,
  () => { isOpen.value = false },
)

const monthRoute = (year: number, month: number) => ({
  name: 'index',
  params: {
    year,
    month: String(month).padStart(2, '0'),
  },
})
const toggleSelector = () => {
  const willOpen = !isOpen.value

  if (willOpen) {
    browseStartYear.value = props.year
    markCurrentClick()
  }

  isOpen.value = willOpen
}
const goToMonth = (offset: number) => {
  const target = new Date(props.year, props.month - 1 + offset, 1)

  void router.push(monthRoute(target.getFullYear(), target.getMonth() + 1))
}
const changeBrowseYear = (offset: number) => {
  slideDirection.value = offset < 0 ? 'up' : 'down'
  browseStartYear.value += offset
}
const selectMonth = (year: number, month: number) => {
  isOpen.value = false
  void router.push(monthRoute(year, month))
}
const isCurrentMonth = (year: number, month: number) => (
  year === now.getFullYear() && month === now.getMonth() + 1
)
const isFutureMonth = (year: number, month: number) => (
  year * 12 + month > now.getFullYear() * 12 + now.getMonth() + 1
)

watch(
  () => [props.year, props.month],
  () => {
    isOpen.value = false
    browseStartYear.value = props.year
  },
)
</script>

<style lang="scss" scoped>
  .component.monthSelector{
    width: 100%;
    height: 48px;
    z-index: 5;
    max-width: 600px;
    position: relative;
    @include flexbox(row, space-between, center);
    >button{
      width: 42px;
      flex: 0 0 42px;
      aspect-ratio: 1/1;
      border-radius: 12px;
      @include flexbox(row, center, center);
      >svg{
        width: 20px;
      }
    }
    >.center{
      >.trigger{
        width: 190px;
        height: 34px;
        padding: 0 12px 0 18px;
        border-radius: 6px;
        border: 1px solid $stone;
        background-color: $white;
        @include flexbox(row, space-between, center);
        >span{
          font-size: 16px;
          font-weight: 600;
        }
        >svg{
          width: 13px;
          transition: transform .2s;
        }
        &.open >svg{
          transform: rotate(180deg);
        }
      }
      >.selector{
        top: 48px;
        left: 50%;
        width: 600px;
        max-width: 100%;
        height: 238px;
        opacity: 0;
        overflow: hidden;
        position: absolute;
        pointer-events: none;
        border-radius: 12px;
        border: 1px solid $stone;
        background-color: $background;
        transform: translate(-50%, -8px);
        transition: opacity .2s, transform .2s;
        box-shadow: 0 18px 40px rgba($black,.16);
        @include flexbox(row, flex-start, stretch);
        &.open{
          opacity: 1;
          pointer-events: auto;
          transform: translate(-50%, 0);
        }
        >.yearControl{
          width: 64px;
          flex: 0 0 64px;
          padding: 8px 0;
          background-color: $oat;
          @include flexbox(column, space-between, center);
          >button{
            width: 40px;
            height: 40px;
            border-radius: 8px;
            @include flexbox(row, center, center);
            >svg{
              width: 18px;
            }
          }
        }
        >.yearList{
          flex: 1;
          gap: 12px;
          overflow: hidden;
          position: relative;
          padding: 10px 40px 10px 12px;
          @include flexbox(column, flex-start, stretch);
          >section{
            height: 64px;
            flex: 0 0 64px;
            gap: 12px;
            @include flexbox(row, flex-start, stretch);
            >h2{
              height: 32px;
              color: $grey;
              font-size: 12px;
              @include flexbox(row, flex-start, center);
            }
            >div{
              flex: 1;
              display: grid;
              grid-template-columns: repeat(6, minmax(0, 1fr));
              >button{
                width: 32px;
                height: 32px;
                margin: 0 auto;
                position: relative;
                border-radius: 50%;
                @include flexbox(row, center, center);
                >span{
                  width: 100%;
                  height: 100%;
                  font-size: 12px;
                  position: relative;
                  @include flexbox(row, center, center);
                  &:after{
                    opacity: 0;
                    content: '';
                    position: absolute;
                    pointer-events: none;
                  }
                  &:after{
                    width: 14px;
                    height: 2px;
                    border-radius: 99px;
                    top: calc(50% + 9px);
                    left: calc(50% - 7px);
                    background-color: $mustard;
                  }
                }
                &.future >span{
                  color: $grey-light;
                }
                &.now{
                  background-color: $yellow;
                  >span{
                    color: $black;
                    font-weight: 600;
                  }
                }
                &.current >span:after{
                  opacity: 1;
                }
              }
            }
          }
          >.year-slide-move,
          >.year-slide-enter-active,
          >.year-slide-leave-active{
            transition: opacity .25s, transform .25s;
          }
          >.year-slide-leave-active{
            left: 12px;
            right: 40px;
            position: absolute;
            pointer-events: none;
          }
          &.slideUp{
            >.year-slide-leave-active{
              top: 10px;
            }
            >.year-slide-enter-from{
              opacity: 0;
              transform: translateY(76px);
            }
            >.year-slide-leave-to{
              opacity: 0;
              transform: translateY(-76px);
            }
          }
          &.slideDown{
            >.year-slide-leave-active{
              bottom: 10px;
            }
            >.year-slide-enter-from{
              opacity: 0;
              transform: translateY(-76px);
            }
            >.year-slide-leave-to{
              opacity: 0;
              transform: translateY(76px);
            }
          }
        }
        >.close{
          top: 6px;
          right: 6px;
          width: 28px;
          height: 28px;
          position: absolute;
          border-radius: 50%;
          @include flexbox(row, center, center);
          >svg{
            width: 16px;
          }
        }
      }
    }
  }
</style>
