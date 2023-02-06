<template>
  <h1>Hello</h1>
  <span v-for="item in data" :key="item">{{ item }}</span>
  <button @click="add_to_cart($event)">Click</button>
</template>

<script>

  import { defineComponent } from 'vue';

  export default defineComponent({
    data() {
      return {
        msg: "Hello",
        data: []
      }
    },
    methods: {
      add_to_cart: function(e) {
        this.data.push(e.target.innerHTML)
      }
    }
  })

</script>