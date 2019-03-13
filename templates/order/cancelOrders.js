    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let response = await this.{{ data.cancelOrders.request.endpoint }} (this.extend (request, params));
        return this.extend (this.parseOrder (response), {
            'status': 'canceled',
        });
    }
