import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vue3GoogleLogin from 'vue3-google-login'
import i18n from './i18n/index'

const app = createApp(App)

app.use(router)
  
app.use(i18n)
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  popupType: 'popup', // Sử dụng popup thay vì redirect
})

app.mount('#app')
