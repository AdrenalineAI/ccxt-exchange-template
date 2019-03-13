    async fetchOrders (symbol = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let request = {
            '{{ data.requests.symbol_field }}': symbol,
            '{{ data.requests.begin_field }}': since,
            '{{ data.requests.limit_field }}': limit,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['{{ data.requests.market_id_field }}'] = market['id'];
        }
        let response = await this.{{ data.fetchOrders.request.endpoint }} (this.extend (request, params));
        let orders = this.parseOrders (response['{{ data.responses.result }}'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }
