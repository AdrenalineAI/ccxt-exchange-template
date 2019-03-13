    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.{{ data.fetchTickers.request.endpoint }} (this.extend ({
            '{{ data.requests.symbol_field }}': symbols,
        }, params));
        let tickers = response['{{ data.responses.result }}'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = tickers[t];
            let id = ticker['{{ data.responses.id_field }}'];
            let market = undefined;
            let symbol = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                if (market) {
                    symbol = market['symbol'];
                }
            } else {
                symbol = this.parseSymbol (symbol);
                market = this.markets (symbol);
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }
