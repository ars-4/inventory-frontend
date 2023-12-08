<template>
  <div v-if="login">
    <nav>
      <div class="navbar">
        <router-link to="/" class="btn" v-if="user_role">Dashboard</router-link>
        <router-link to="/products" class="btn">Products</router-link>
        <router-link to="/orders" class="btn">Orders</router-link>
        <a class="btn" style="float:right" @click="logout_user">Logout</a>
        <span>{{ this.connection.status }}</span>
      </div>
    </nav>
    <br>
    <br>
    <br>
    <br>
    <router-view class="main_view" ref="main_view"></router-view>
  </div>

  <div v-else>
    <div class="row">
      <div class="col-md-4"></div>
      <div class="col-md-4">
        <div class="login">
          <div class="content">
            <h1>Login</h1>
            <input type="text" class="form-control" placeholder="Username" v-model="username">
            <br>
            <input type="password" class="form-control" placeholder="Password" v-model="password">
            <p v-if="error" class="text-danger">{{ error_string }}</p>
            <br v-else>
            <button class="btn btn-primary" @click="login_user">Login</button>
          </div>
        </div>
      </div>
      <div class="col-md-4"></div>
    </div>
  </div>
</template>

<script>

import { defineComponent, getCurrentInstance } from 'vue'

export default defineComponent({

  data() {
    return {
      login: false,
      msg: "hello",

      username: "",
      password: "",

      user_role: false,

      error: true,
      error_string: ""
    }
  },

  methods: {

    initials: function () {
      localStorage.setItem('login', 'false')
      this.check_user_login()
    },

    check_user_login: function () {
      let login = localStorage.getItem('login')
      if (login == 'false') {
        this.login = false
      }
      else {
        this.login = true
        this.connection.connect()
        if (localStorage.getItem('type') === 'admin') {
          this.user_role = true
        }
        else {
          this.user_role = false
        }
      }
    },

    login_user: function () {
      fetch(`${this.main_url}/auth/`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "username": this.username,
          "password": this.password
        })
      }).then(res => { return res.json() }).then(data => {
        if (data['error'] == 'false') {
          this.error = false
          localStorage.setItem('login', 'true')
          localStorage.setItem('token', data['token'])
          localStorage.setItem('type', data['type'])
          if (localStorage.getItem('type') === 'admin') {
            this.user_role = true
          }
          else if (localStorage.getItem('type') === 'customer') {
            localStorage.removeItem('token')
            localStorage.setItem('login', 'false')
            this.error_string = "Forbidden"
            alert("Access Forbidden")
          }
          else {
            this.user_role = false
          }
          this.check_user_login()
        }
        else {
          localStorage.setItem('login', 'true')
          this.error = true
          this.error_string = data['data']
        }
      })
    },

    logout_user: function () {
      localStorage.removeItem('token')
      localStorage.removeItem('type')
      localStorage.setItem('login', 'false')
      this.check_user_login()
    },

    testOrders: function () {
      const instance = getCurrentInstance();
      if (instance) {
        const { appContext } = instance;
        const $eventBus = appContext.config.globalProperties.$eventBus;

        $eventBus.$emit('getOrders');

      }
    }

  },

  beforeMount() {
    this.check_user_login();
  },
  mounted() {
    this.$watch(() => this.$route.path, () => {
      // if (this.$route.path === '/orders') {this.testOrders();}
      console.log("path changed")
    })
  }

})

</script>
