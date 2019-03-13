    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = { '{{ data.requests.order_id_field }}': id };
        let response = await this.{{ data.cancelOrder.request.endpoint }} (this.extend (request, params));
        return this.extend (this.parseOrder (response), {
            'status': 'canceled',
        });
    }
