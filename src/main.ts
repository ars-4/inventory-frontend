import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {connection} from './connection'
import './assets/static/css/styles.css'


const app = createApp(App)
app.config.globalProperties.$eventBus = app;
app.config.globalProperties.main_url = "http://127.0.0.1:8000"
app.config.globalProperties.connection = new connection("ws", "127.0.0.1:8000")

app.use(router).mount('#app')
