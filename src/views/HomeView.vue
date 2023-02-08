<template>
  <h1>Hello</h1>
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