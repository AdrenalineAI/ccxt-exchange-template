    async fetchMyTrades (symbol = undefined, since = 0, limit = 0, params = {}) {
        params['{{ data.requests.symbol_field }}'] = symbol;
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.{{ data.fetchMyTrades.request.endpoint }} (this.extend ({
            '{{ data.requests.market_id_field }}': market['id'],
            '{{ data.requests.since_field }}': since,
            '{{ data.requests.limit_field }}': limit,
        }, params));
        if ('{{ data.responses.result }}' in response) {
            if (response['{{ data.responses.result }}'] !== undefined) {
                // Re-format dat
                let data = [];
                for (let i = 0; i < response['{{ data.responses.result }}'].length; i++) {
                    let order = response['{{ data.responses.result }}'][i];
                    data.push ({
                        'market': order['{{ data.responses.id_field }}'],
                        'amount': order['{{ data.responses.amount_field }}'],
                        'symbol': symbol,
                        'maker': order['{{ data.responses.maker_field }}'],
                        'price': order['{{ data.responses.price_field }}'],
                        'created': order['{{ data.responses.created_field }}'],
                    });
                }
                return this.parseTrades (data, market, since, limit);
            }
        }
        throw new ExchangeError (this.id + ' fetchMyTrades() returned undefined response');
    }
