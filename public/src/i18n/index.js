import { createI18n } from 'vue-i18n'

// Import các tệp ngôn ngữ
import vi from './locales/vi.js'
import en from './locales/en.js'
import fr from './locales/fr.js'
import ja from './locales/ja.js'
import zh from './locales/zh.js'
import ko from './locales/ko.js'
import de from './locales/de.js'

// Tạo instance i18n
const i18n = createI18n({
  legacy: false, // Sử dụng Composition API
  locale: 'en', // Ngôn ngữ mặc định
  fallbackLocale: 'vi', // Ngôn ngữ dự phòng
  messages: {
    vi,
    en,
    fr,
    ja,
    zh,
    ko,
    de
  }
})

export default i18n