# 回應方式
  - 若非必要原因，一律以繁體中文回覆我
  - 回覆的訊息請盡量簡短，非必要請勿超過50字

# 專案介紹
  - 這是一個記帳APP (PWA)
  - 這個專案由我自己一個人開發，是我的個人side-project
  - 專案使用 vue3/vite 開發，沒有使用 nuxt
  - 專案沒有RWD，但是需要分別支援電腦跟手機兩種不同的尺寸
    開發時請注意使用到的檔案路徑與路由
    兩種尺寸的原始碼要分別對應各自的main.scss與variable.scss

# 開發規則
  - 建立新檔案時，一律以template, script, style的順序開發
  - script 一律使用 <script lang="ts" setup>
  - style 一律使用 <style lang="scss" scoped>
  - 建立的新檔案如果是新頁面，則需要在根標籤加上 `page`      這個 class name
    建立的新檔案如果是新元件，則需要在根標籤加上 `component` 這個 class name
    建立的新檔案的根標籤需要加上與檔名相同的 class name
  - SCSS 以巢狀結構撰寫，並嚴格遵循template/html的結構去撰寫。
  - 選擇器預設使用 `>` 直接子層選擇器來選擇目標。
  - 只有在確實需要較寬鬆選擇器、狀態選擇器、偽元素、第三方輸出結構，或其他合理例外時，才使用非 `>` 寫法。
  - CSS 請依據整行長度由短到長排序。
    若整行CSS總長度一樣，則依照 CSS 屬性名稱長度由短到長排序。
    若使用 `include xxx()` 時等mixin時，也要依照整行總長度排序，且 `include` 這段字的長度可視為屬性名稱的長度。
  - 變數、mixin、文字樣式請優先參考 `variable.scss`。
  - 使用到 `display: flex`、`align-items`、`flex-direction`、`justify-content` 任一屬性時，請一律改用 `@include flexbox()`。
    
