    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 0, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            '{{ data.requests.timeframe_field }}': this.timeframes[timeframe],
            '{{ data.requests.market_id_field }}': market['id'],
            '{{ data.requests.begin_field }}': since,
            '{{ data.requests.limit_field }}': limit,
        };
        let response = await this.{{ data.fetchOHLCV.request.endpoint }} (this.extend (request, params));
        if ('{{ data.responses.result }}' in response) {
            if (response['{{ data.responses.result }}'])
                return this.parseOHLCVs (response['{{ data.responses.result }}'], market, timeframe, since, limit);
        }
        return [];
    }
