    async fetchOrderBook (symbol, limit = 0, params = {}) {
        await this.loadMarkets ();
        let response = await this.{{ data.fetchOrderBook.request.endpoint }} (this.extend ({
            '{{ data.requests.market_id_field }}': this.marketId (symbol),
            '{{ data.requests.limit_field }}': limit,
        }, params));
        let orderbook = response['{{ data.responses.result }}'];
        return this.parseOrderBook (orderbook, undefined, '{{ data.responses.data_bids_key }}', '{{ data.responses.data_asks_key }}', 0, 1);
    }
