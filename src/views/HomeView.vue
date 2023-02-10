<template>
  <h1>Dashboard</h1>
  <p v-for="balance in profit" :key="balance">{{ balance }}</p>
</template>

<script>

  import { defineComponent } from 'vue';

  export default defineComponent({
    data() {
      return {
        msg: "Hello",
        balances: [],
        expenses: [],
        profit:[],
        sales:[],
        cashed:[]
      }
    },
    methods: {
      
      get_balances: function() {
        fetch(`${this.main_url}/balances/`).then(res => {return res.json()}).then(data => {
          for(let i = 0; i< data.length; i++) {
            this.balances.push({
            id:data[i]['id'],
            date_created:data[i]['date_created'],
            date_updated:data[i]['date_updated'],
            title:data[i]['title'],
            description:data[i]['description'],
            bill:data[i]['bill'],
            balance:data[i]['balance']
          })
          }

          let balance = this.balances
          let profit_count = 0
          this.profit = []
          this.profit.push(0)
          this.profit.push(0)
          
          for(let i = 0; i < balance.length; i++) {
            if(balance[i].balance === 'profit') {
              this.profit[0] = this.profit[0] + Number(balance[i].bill)
              console.log(balance[i].bill, this.profit[0])
              this.profit[1] = this.profit[1] + 1
            }
            else if(balance[i].balance === 'expense') {
              this.expenses.push(balance[i])
            }
            else if(balance[i].balance === 'sale') {
              this.sales.push(balance[i])
            }
            else if(balance[i].balance === 'cashed') {
              this.cashed.push(balance[i])
            }
          }
        })
      }

    },

    beforeMount() {
      this.get_balances()
    }
  })

</script>