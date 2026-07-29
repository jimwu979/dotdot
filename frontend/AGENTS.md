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
  - SCSS 開發時不要寫任何多餘的空格，只有整行都是註解時，才能在上方一排加上空格
  - 此專案沒有RWD，手機版跟電腦版都分別只有一個尺寸的版本，所以不要寫任何@media
  - 此專案不需要支援無障礙，所以不要添加任何 aria-hidden 等無障礙用途的東西
  - 開發vue檔時，不要在 `<script>` 中使用數字以外的文字，文字應保留在html中

# git規則
  - commit subject 
    - 撰寫格式為: [`主要更動範圍`] `修改內容`
    - 主要更動範圍若為頁面時，就寫該檔名，但不用附加附檔名
      譬如 `[login] build new page`
      內容可以是: 添加該檔案，且將該頁面添加至路由中
      此時更動的檔案雖然還包括路由檔案，但是更動項目主要是login這一頁，所以就寫這一頁即可，不需要把所有更動的檔案都寫上去
    - 若更動頁面不只一頁，則以 `, ` 加入多個頁面
      譬如 `[index, login] build new page`
    - 如果內容是main.scss, variable.scss, vite.config.js等設定相關的檔案，則連同附檔名一起寫進去
    - 要用英文撰寫
  - commit body 
    - 盡量以條列式方式撰寫，但非強制性規則
    - 以中文撰寫
  - 使用者要求你commit時，先不要直接做，先回答使用者要如何commit、分成幾個commit等等，讓使用者確認後，使用者同意才能進行commit
  - commit跟push的動作一起做，push不需要使用者確認，commit完畢即可直接push