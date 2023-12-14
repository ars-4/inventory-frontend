<template>
    <div>
        <thead>
            <p>Invoice #{{ String(invoice.id).padStart(8, '0') }}</p>
            <p style="font-size: 12px;">
                <span><b>DATE:</b>&nbsp;</span>
                <span style="border-bottom: 1px solid #242424; padding: 1px 3px;">{{ invoice.date_created }} {{
                    invoice.time_created }}</span>
            </p>
        </thead>
        <table>
            <tr>
                <th>Index</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
            </tr>
            <tr v-for="(product, index) in invoice.order_products" :key="index">
                <td>#{{ Number(index) + 1 }}</td>
                <td>{{ product.product }}</td>
                <td>{{ product.quantity }} x $ {{ (Number(product.bill) / Number(product.quantity)).toFixed(2) }}</td>
                <td>$$ {{ Number(product.bill).toFixed(2) }}</td>
            </tr>
            <tr style="border-top: 1px solid #242424">
                <th style="font-size: 10px;border-right: none;">{{ invoice.customer_name }}&nbsp;&nbsp;&nbsp;&nbsp;</th>
                <th style="border-right: none;"></th>
                <th style="border-right: none;"></th>
                <th style="font-size: 10px;">TOTAL: $$ {{ Number(invoice.sale).toFixed(2) }}</th>
            </tr>
        </table>
        <tfoot>
        </tfoot>
    </div>
</template>


<style scoped>
table {
    width: 100%;
}

thead {
    font-size: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    width: 100% !important;
    border-left: 1px solid #242424 !important;
    border-top: 1px solid #242424 !important;
    border-right: 1px solid #242424 !important;
}

thead p {
    margin: 0;
    padding: 0;
}

table,
th,
td {
    border: 1px solid black;
    border-collapse: collapse;
}

table th,
table td {
    padding: 8px 12px;
    border-right: 1px solid #242424;
}

table td {
    border-top: 1px solid #242424;
}

table th:not(:nth-child(2)),
table td:not(:nth-child(2)) {
    width: 15%;
}

@media print {

    table th:not(:nth-child(2)),
    table td:not(:nth-child(2)) {
        width: 20%;
    }
}
</style>


<script>

import { defineComponent } from 'vue';

export default defineComponent({

    data() {
        return {
            invoice: {},
            products: []
        }
    },

    methods: {

        set_focused_order: async function (order_id) {
            order_id = Number(order_id);
            const token = localStorage.getItem('token');
            var order = {}
            await fetch(`${this.main_url}/orders/${order_id}/`, {
                method: 'get',
                headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' }
            }).then(res => { return res.json() }).then(data => {
                order = data;
            })
            if (order) {
                const { customer_name, description, sale, purchase, order_creator, products, date_created } = order;
                this.invoice = {
                    id: order_id,
                    customer_name,
                    description,
                    sale,
                    purchase,
                    order_creator,
                    products,
                    date_created: String(date_created).split("T")[0],
                    time_created: String(date_created).split("T")[1].split(".")[0]
                };
                this.invoice.order_products = []
                for (let j = 0; j < order.products.length; j++) {
                    await fetch(`${this.main_url}/order_products/${order.products[j]}/`, {
                        method: 'get',
                        headers: { 'Authorization': `Token ${token}` }
                    }).then(res => { return res.json() }).then(data => {
                        for (let k = 0; k < this.products.length; k++) {
                            if (this.products[k].id === data['product']) {
                                this.invoice.order_products.push({
                                    'product': this.products[k].title,
                                    'quantity': data['quantity'],
                                    'bill': data['sale_bill']
                                })
                            }
                        }
                    })
                }
            }
        },

        get_products: async function () {
            this.products = []
            let token = localStorage.getItem('token')
            await fetch(`${this.main_url}/products/`, {
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
                            price: data[i]['sale_price']
                        })
                    }
                }
            })
            await this.set_focused_order(this.invoice.id)
            document.querySelector('nav').style.display = "none"
            let brs = document.querySelectorAll('br');
            for (let i = 0; i < brs.length; i++) {
                brs[i].style.display = "none"
            }
            await window.print()
            document.querySelector('nav').style.display = "unset"
            brs = document.querySelectorAll('br');
            for (let i = 0; i < brs.length; i++) {
                brs[i].style.display = "block"
            }
            this.$router.push({ name: 'orders' })
        }

    },

    created() {
        this.invoice.id = this.$route.params.id;
    },

    mounted() {
        this.get_products();
    }

})

</script>