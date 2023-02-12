<template>
  <div class="dashboard" v-if="user_role">
    <h1>Dashboard</h1>

    <div class="row">
      <div class="col-md-4">
        <div class="row">
          <div class="col-md-12">
            <div class="card">
              <div class="card-header">
                <h3>Add a user</h3>
              </div>
              <form class="card-body" @submit="add_user($event)">
                <div class="row">
                  <div class="col-md-6">
                    <input type="text" class="form-control" placeholder="Username" required>
                  </div>
                  <div class="col-md-6">
                    <input type="text" class="form-control" placeholder="Email" required>
                  </div>
                </div>
                <br>
                <div class="row">
                  <div class="col-md-6">
                    <input type="text" class="form-control" placeholder="First Name" required>
                  </div>
                  <div class="col-md-6">
                    <input type="text" class="form-control" placeholder="Last Name" required>
                  </div>
                </div>
                <br>
                <div class="row">
                  <div class="col-md-6">
                    <input type="text" class="form-control" placeholder="Password" required>
                  </div>
                  <div class="col-md-6">
                    <input type="text" class="form-control" placeholder="Confirm Password" required>
                  </div>
                </div>
                <br>
                <div class="row">
                  <div class="col-md-12">
                    <select required class="form-control">
                      <option value="3">Customer</option>
                      <option value="2">Employee</option>
                      <option value="1">Admin</option>
                    </select>
                  </div>
                </div>
                <br>
                <div class="row">
                  <div class="col-md-12">
                    <textarea required class="form-control" cols="10" rows="3" placeholder="Address"></textarea>
                  </div>
                </div>
                <br>
                <button class="btn btn-primary">Add User</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="row">
          <div class="col-md-6">
            <div class="card bg-primary text-light">
              <div class="card-header">
                <h3>Balance</h3>
              </div>
              <div class="card-body">
                <span>$$ {{ cashed[0] }}.00</span>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card bg-secondary text-light">
              <div class="card-header">
                <h3>Sales</h3>
              </div>
              <div class="card-body">
                <span>$$ {{ sales[0] }}.00</span>
              </div>
            </div>
          </div>
        </div>
        <br>
        <div class="row">
          <div class="col-md-6">
            <div class="card bg-success text-light">
              <div class="card-header">
                <h3>Profit</h3>
              </div>
              <div class="card-body">
                <span>$$ {{ profit[0] }}.00</span>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card bg-danger text-light">
              <div class="card-header">
                <h3>Expense</h3>
              </div>
              <div class="card-body">
                <span>$$ {{ expense[0] }}.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  <div v-else>
    <h1>Forbidden</h1>
  </div>
</template>

<script>

import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      user_role: false,
      msg: "Hello",
      balances: [],

      expense: [],
      profit: [],
      sales: [],
      cashed: []
    }
  },
  methods: {

    get_balances: function () {
      if (localStorage.getItem('type') === 'admin') {
        this.user_role = true
      }
      else {
        this.user_role = false
      }
      let token = localStorage.getItem('token')
      fetch(`${this.main_url}/balances/`, {
        method: 'get',
        headers: { 'Authorization': `Token ${token}` }
      }).then(res => { return res.json() }).then(data => {
        for (let i = 0; i < data.length; i++) {
          this.balances.push({
            id: data[i]['id'],
            date_created: data[i]['date_created'],
            date_updated: data[i]['date_updated'],
            title: data[i]['title'],
            description: data[i]['description'],
            bill: data[i]['bill'],
            balance: data[i]['balance']
          })
        }

        let balance = this.balances
        let profit_count = 0

        this.cashed = []
        this.cashed.push(0)
        this.cashed.push(0)

        this.sales = []
        this.sales.push(0)
        this.sales.push(0)

        this.profit = []
        this.profit.push(0)
        this.profit.push(0)

        this.expense = []
        this.expense.push(0)
        this.expense.push(0)

        for (let i = 0; i < balance.length; i++) {
          if (balance[i].balance === 'profit') {
            this.profit[0] = this.profit[0] + Number(balance[i].bill)
            this.profit[1] = this.profit[1] + 1
          }
          else if (balance[i].balance === 'expense') {
            this.expense[0] = this.expense[0] + Number(balance[i].bill)
            this.expense[1] = this.expense[1] + 1
          }
          else if (balance[i].balance === 'sale') {
            this.sales[0] = this.sales[0] + Number(balance[i].bill)
            this.sales[1] = this.sales[1] + 1
          }
          else if (balance[i].balance === 'cashed') {
            this.cashed[0] = this.cashed[0] + Number(balance[i].bill)
            this.cashed[1] = this.cashed[1] + 1
          }
        }
      })
    },

    add_user: function(e) {
      e.preventDefault()
      let username = e.target[0].value;
      let email = e.target[1].value;
      let first_name = e.target[2].value;
      let last_name = e.target[3].value;
      let password = e.target[4].value;
      let password2 = e.target[5].value;
      let role = e.target[6].value;
      let address = e.target[7].value;
      if(password !== password2) {
        alert("Passwords does not match")
      }
      else {
        this.clear_form(e)
        let token = localStorage.getItem('token')
        fetch(`${this.main_url}/persons/`, {
          method:'post',
          headers: {'Authorization':`Token ${token}`, 'Content-Type':'application/json'},
          body: JSON.stringify({
            "first_name":first_name,
            "last_name":last_name,
            "email":email,
            "username":username,
            "password":password,
            "role":role,
            "address":address
          })
        })
      }
    },

    clear_form: function(e) {
      for(let i = 0; i <= 7; i++) {
        e.target[i].value = ""
      }
    }

  },

  beforeMount() {
    this.get_balances()
  }
})

</script>