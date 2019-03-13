    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.{{ data.fetchTicker.request.endpoint }} (this.extend ({
            '{{ data.requests.market_id_field }}': this.marketId (symbol),
        }, params));
        let ticker = response['{{ data.responses.result }}'];
        return this.parseTicker (ticker, market);
    }
