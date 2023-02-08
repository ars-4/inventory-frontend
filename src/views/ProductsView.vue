<template>
    <div class="products_page">
        <h1>Products</h1>
        <div class="row">
            <div class="col-md-4">
                <input type="text" class="form-control" @keyup="search_product($event)">
            </div>
            <div class="col-md-4">
                <button class="btn btn-primary">Search</button>
            </div>
        </div>
        <br>
        <div class="row">
            <div class="col-md-8">
                <table class="glass">
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Sale Price</th>
                        <th>Purchase Price</th>
                        <th>Stock</th>
                        <th class="text-center">In / Out</th>
                    </tr>
                    <tr v-for="product in products_qs" :key="product">
                        <td>{{ product.id }}</td>
                        <td>{{ product.title }}</td>
                        <td>{{ product.sale_price }}</td>
                        <td>{{ product.purchase_price }}</td>
                        <td>{{ product.stock }}</td>
                        <td>
                            <form class="row" v-on:submit="set_product_stock($event)">
                                <div class="col-md-8">
                                    <input type="number" class="form-control" value="0">
                                </div>
                                <div class="col-md-4">
                                    <button class="btn btn-primary" @click="stock_in(product.id)">+</button>
                                    <button class="btn btn-danger" @click="stock_out(product.id)">-</button>
                                </div>
                            </form>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="col-md-4">
                <div class="glass add_product">
                    <h3>Add Product</h3>
                    <form v-on:submit="add_product($event)">
                        <input type="text" class="form-control" placeholder="Product Title" required>
                        <br>
                        <textarea class="form-control" rows="3" placeholder="Product Description" aria-expanded="false"
                            required></textarea>
                        <br>
                        <select class="form-control" required>
                            <option value="">Select Measurement Type</option>
                            <option value="qty">Quantity (qty)</option>
                            <option value="mtr">Metre (mtr)</option>
                            <option value="len">Length (len)</option>
                        </select>
                        <br>
                        <div class="row">
                            <div class="col-md-6">
                                <label for="">&nbsp;Sale Price</label>
                                <input type="number" class="form-control" value="0" required>
                            </div>
                            <div class="col-md-6">
                                <label for="">&nbsp;Purchase Price</label>
                                <input type="number" class="form-control" value="0" required>
                            </div>
                        </div>
                        <br>
                        <button class="btn btn-primary">Add Product</button>
                    </form>
                </div>
            </div>
        </div>

    </div>
</template>


<script>

import { defineComponent } from 'vue';

export default defineComponent({

    data() {
        return {
            msg: "Hello",
            products: [],
            products_qs: [],
            product_stock: ""
        }
    },

    methods: {
        get_products: async function () {
            this.products = []
            this.products.qs = []
            let data = await fetch(`${this.main_url}/products/`).then(res => {
                return res.json()
            })
            for (let i = 0; i < data.length; i++) {
                if (data[i]['title'] == null) {
                    console.log("removed Null")
                }
                else {
                    this.products.push({
                        id: data[i]['id'],
                        title: data[i]['title'],
                        sale_price: data[i]['sale_price'],
                        purchase_price: data[i]['purchase_price'],
                        stock: data[i]['stock']
                    })
                }
            }
            this.products_qs = this.products;
        },

        search_product: function (e) {
            e.preventDefault()
            let search = e.target.value.toLowerCase();
            this.products_qs = []
            if (search.length > 0) {
                for (let i = 0; i < this.products.length; i++) {
                    if (this.products[i]['title'].toLowerCase().includes(search)) {
                        this.products_qs.push(this.products[i])
                    }
                }
            }
            else {
                this.products_qs = this.products;
            }
        },

        show_error: function(string, type) {
            if(type === 'error') {
                console.log(string)
            }
            else {
                console.log(string)
            }
        },

        set_product_stock: function (e) {
            e.preventDefault()
            this.product_stock = e.target[0].value
            e.target[0].value = 0
        },
        stock_in: function (product_id) {
            setTimeout(() => {
                this.stock_data('stock_in', product_id, this.product_stock)
            }, 500);
        },
        stock_out: function (product_id) {
            setTimeout(() => {
                this.stock_data('stock_out', product_id, this.product_stock)
            }, 500);
        },
        stock_data: function (method, product_id, product_stock) {
            if (Number(product_stock) > 0) {
                console.log(method, product_id, product_stock)
                let body = {
                    "method": method,
                    "product_id": product_id,
                    "stock": product_stock
                }
                fetch(`${this.main_url}/product/stock/`, {
                    method: "post",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                }).then(() => { this.get_products() }).catch(err => { console.log(err) })
            }
            else {
                console.log("Product Stock to change is 0")
            }
        },

        add_product: function (e) {
            e.preventDefault()
            let product_title = e.target[0].value;
            let product_description = e.target[1].value;
            let product_type = e.target[2].value;
            let product_sale_price = e.target[3].value;
            let product_purchase_price = e.target[4].value;
            if (product_sale_price <= 0 || product_purchase_price <= 0) {
                console.log("Sale and Purchase Price Can't be zero")
            }
            else {
                let body = {
                    "title": product_title,
                    "description": product_description,
                    "type": product_type,
                    "sale_price": product_sale_price,
                    "purchase_price": product_purchase_price,
                    "stock": '0'
                }
                fetch(`${this.main_url}/products/`, {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                }).then(() => { this.get_products() }).catch(err => { console.log(err) })
                e.target[0].value = ""
                e.target[1].value = ""
                e.target[2].select[0]
                e.target[3].value = 0
                e.target[4].value = 0
            }
        }

    },

    beforeMount() {
        this.get_products()
    }

})

</script>
