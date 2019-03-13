    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            let request = { '{{ data.requests.order_id_field }}': id };
            response = await this.{{ data.fetchOrder.request.endpoint }} (this.extend (request, params));
            return this.parseOrder (response['{{ data.responses.result }}']);
        } catch (e) {
            throw e;
        }
    }
