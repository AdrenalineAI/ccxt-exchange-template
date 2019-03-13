    async fetchClosedOrders (symbol = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let request = {
            '{{ data.requests.symbol_field }}': symbol,
            '{{ data.requests.begin_field }}': since,
            '{{ data.requests.limit_field }}': limit,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.{{ data.fetchClosedOrders.request.endpoint }} (this.extend (request, params));
        let orders = this.parseOrders (response['{{ data.responses.result }}'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }
