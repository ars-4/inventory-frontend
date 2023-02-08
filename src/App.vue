<template>
  <nav>
    <div class="navbar">
      <router-link to="/" class="btn">Dashboard</router-link>
      <router-link to="/products" class="btn">Products</router-link>
      <router-link to="/orders" class="btn">Orders</router-link>
    </div>
  </nav>
  <br>
  <br>
  <br>
  <br>
  <router-view class="main_view"></router-view>
</template>

