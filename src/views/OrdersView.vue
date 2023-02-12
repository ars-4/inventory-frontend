<template>
    <div class="orders_page">
        <h1>Orders</h1>
        <div class="row">
            <div class="col-md-6">
                <table class="glass">
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Sale Price</th>
                        <th v-if="user_role">Purchase Price</th>
                        <th v-if="user_role">Profit</th>
                        <th>Order Details</th>
                    </tr>
                    <tr v-for="order in orders_qs" :key="order">
                        <td>{{ order.id }}</td>
                        <td>{{ order.customer_name }}</td>
                        <td>{{ order.sale }}</td>
                        <td v-if="user_role">{{ order.purchase }}</td>
                        <td v-if="user_role">{{ order.sale - order.purchase }}</td>
                        <td>
                            <button class="btn btn-primary" @click="set_focused_order(order.id)">View Details</button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="col-md-4">
                <div class="glass add_order">
                    <h3>Add Order</h3>
                    <form v-on:submit="add_order($event)">
                        <!-- <input type="text" class="form-control" placeholder="Customer Name" required> -->
                        <select class="form-control" required>
                            <option value="">Customer</option>
                            <option v-for="person in persons" :value="person.username" :key="person.id">{{
                                person.username
                            }} {{ person.address }}</option>
                        </select>
                        <br>
                        <input type="text" class="form-control" placeholder="Search Product"
                            @keyup="search_product($event)">
                        <br>
                        <span v-for="product in products_qs" :key="product.id" class="btn btn-secondary tags"
                            @click="add_to_cart(product.id, product.title, product.price)">{{ product.title }}</span>
                        <br><br>
                        <button class="btn btn-primary">Add Order</button>
                    </form>
                </div>
                <br>
                <div class="glass order_details">
                    <h3>Order Details</h3>
                    <div class="control-form">
                        <span>&nbsp;Customer Name</span>
                        <span class="divider"></span>
                        <span>{{ focused_order.customer_name }}</span>
                    </div>
                    <br>
                    <div class="control-form">
                        <div class="row">
                            <div class="col-4">
                                &nbsp;Description
                                <span class="divider"></span>
                            </div>
                            <div class="col-8">{{ focused_order.description }}</div>
                        </div>
                    </div>
                    <br>
                    <div class="control-form">
                        <span>&nbsp;Sales</span>
                        <span class="divider"></span>
                        <span>{{ focused_order.sale }}</span>
                    </div>
                    <br>
                    <div v-if="user_role" class="control-form">
                        <span>&nbsp;Purchase</span>
                        <span class="divider"></span>
                        <span>{{ focused_order.purchase }}</span>
                    </div>
                    <br>
                    <p v-for="product in focused_order_products" :key="product">{{ product.product }}</p>
                    <br>
                    <button class="btn btn-primary">Print</button>
                    <button class="btn btn-danger" @click="delete_order(focused_order.id)">Return Order</button>
                </div>
            </div>
            <div class="col-md-2 glass" style="border:1px solid #c3c3c3">
                <h1>Cart</h1>
                <div class="brdr bg-danger text-light" v-for="item in cart_items" :key="item">
                    <span @click="remove_cart_item(item[0])">{{ item[1] }}, {{ item[2] }}, {{ item[3] * item[1] }}</span>
                </div>
            </div>

        </div>
    </div>
    <!-- <div class="invoice" style="display:none">
        <table>
            <tr>
                <p></p>
            </tr>
        </table>
    </div> -->
</template>

<script>

import { defineComponent } from 'vue';

export default defineComponent({

    data() {
        return {
            orders: [],
            orders_qs: [],

            user_role: false,
            persons: [],

            products: [],
            products_qs: [],

            focused_order: {},
            focused_order_products: [],

            cart_items: []
        }
    },

    methods: {

        get_orders: function () {
            if (localStorage.getItem('type') === 'admin') {
                this.user_role = true
            }
            else {
                this.user_role = false
            }
            this.cart_items = []
            this.orders = []
            this.get_persons()
            let token = localStorage.getItem('token')
            fetch(`${this.main_url}/orders/`, {
                method: 'get',
                headers: { 'Authorization': `Token ${token}` }
            }).then(res => {
                return res.json()
            }).then(data => {
                for (let i = 0; i < data.length; i++) {
                    this.orders.push({
                        id: data[i]['id'],
                        customer_name: data[i]['customer_name'],
                        description: data[i]['description'],
                        sale: data[i]['sale'],
                        purchase: data[i]['purchase'],
                        order_products: data[i]['products']
                    })
                }
                this.orders_qs = this.orders;
                this.set_focused_order(1)
            }).then(() => {
                this.get_products()
            })
        },

        get_products: function () {
            this.products = []
            this.products_qs = []
            let token = localStorage.getItem('token')
            fetch(`${this.main_url}/products/`, {
                method: 'get',
                headers: { 'Authorization': `Token ${token}` }
            }).then(res => {
                return res.json()
            }).then(data => {
                for (let i = 0; i < data.length; i++) {
                    if (data[i]['title'] == null) {
                        console.log("removed Null")
                    }
                    else {
                        this.products.push({
                            id: data[i]['id'],
                            title: data[i]['title'],
                            price:data[i]['sale_price']
                        })
                    }
                }
                this.products_qs = this.products
            })
        },
        search_product: function (e) {
            this.products_qs = []
            let search_string = e.target.value.toLowerCase()
            for (let i = 0; i < this.products.length; i++) {
                if (this.products[i].title.toLowerCase().includes(search_string)) {
                    this.products_qs.push(this.products[i])
                }
            }
        },

        add_to_cart: function (id, title, price) {
            if (this.cart_items.length === 0) {
                let product_quantity = 1;
                this.cart_items.push([id.toString(), product_quantity.toString(), title, price])
            }
            else {
                let product_quantity = 1;
                for (let i = 0; i < this.cart_items.length; i++) {
                    if (Number(this.cart_items[i][0]) === id) {
                        product_quantity = Number(product_quantity) + Number(this.cart_items[i][1])
                        this.cart_items.splice(i, 1);
                        break;
                    }
                }
                this.cart_items.push([id.toString(), product_quantity.toString(), title, price])
            }
        },
        remove_cart_item: function(item) {
            for(let i = 0; i < this.cart_items.length; i++) {
                if(this.cart_items[i][0] === item) {
                    this.cart_items.splice(i, 1)
                }
            }
        },

        set_focused_order: function (order_id) {
            order_id = Number(order_id)
            let token = localStorage.getItem('token')
            for (let i = 0; i < this.orders.length; i++) {
                if (order_id === this.orders[i]['id']) {
                    this.focused_order['id'] = order_id
                    this.focused_order['customer_name'] = this.orders[i].customer_name
                    let description = this.orders[i].description
                    this.focused_order['description'] = description
                    this.focused_order['sale'] = this.orders[i].sale
                    this.focused_order['purchase'] = this.orders[i].purchase
                    this.focused_order['order_products'] = this.orders[i].order_products
                    let special_id = this.orders[i].order_products
                    for (let j = 0; j < this.orders[i].order_products.length; j++) {
                        fetch(`${this.main_url}/order_products/${special_id}/`, {
                            method: 'get',
                            headers: { 'Authorization': `Token ${token}` }
                        }).then(res => { return res.json() }).then(data => {
                            for (let k = 0; k < this.products.length; k++) {
                                if (this.products[k].id === data['product']) {
                                    this.focused_order_products.push({
                                        'product':this.products[k].title,
                                        'quantity':data['quantity'],
                                        'bill':data['sale_bill']
                                    })
                                }
                            }
                        })
                    }
                    break;
                }
            }
        },

        get_persons: function () {
            this.persons = []
            let token = localStorage.getItem('token')
            fetch(`${this.main_url}/persons/?user__groups=3`, {
                method: 'get',
                headers: { 'Authorization': `Token ${token}` }
            }).then(res => { return res.json() }).then(data => {
                for (let i = 0; i < data.length; i++) {
                    this.persons.push({
                        id: data[i]['id'],
                        first_name: data[i]['first_name'],
                        last_name: data[i]['last_name'],
                        username: data[i]['user']['username'],
                        user_id: data[i]['user']['id'],
                        address: data[i]['address']
                    })
                }
            })
        },

        add_order: function (e) {
            e.preventDefault();
            let customer_name = e.target[0].value;
            e.target[0].value = "";
            let cart = []
            for(let i = 0; i < this.cart_items.length; i++) {
                cart.push([this.cart_items[i][0], this.cart_items[i][1]])
            }
            if (cart.length > 0) {
                let token = localStorage.getItem('token')
                fetch(`${this.main_url}/orders/`, {
                    method: "post",
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
                    body: JSON.stringify({
                        "customer_name": customer_name,
                        "order_products": cart
                    })
                }).then(() => {
                    this.get_orders();
                })
            }
            this.cart_items = []
        },

        delete_order: function(order_id) {
            let token = localStorage.getItem('token')
            fetch(`${this.main_url}/order/?pk=${order_id}`, {
                method:"get",
                headers: {
                    'Authorization': `Token ${token}`
                }
            }).then(() => {
                this.get_orders()
            })
        }

    },

    beforeMount() {
        this.get_orders();
    }

})

</script>