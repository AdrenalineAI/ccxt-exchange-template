    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            '{{ data.requests.market_id_field }}': market['id'],
            '{{ data.requests.amount_field }}': this.amountToPrecision (symbol, amount),
            '{{ data.requests.price_field }}': this.priceToPrecision (symbol, price),
            '{{ data.requests.side_field }}': side,
        };
        let response = await this.{{ data.createOrder.request.endpoint }} (this.extend (order, params));
        return this.extend (this.parseOrder (response['{{ data.responses.result }}'], market), {
            'status': 'open',
            'price': order['{{ data.responses.price_field }}'],
            'symbol': symbol,
            'amount': order['{{ data.responses.amount_field }}'],
            'side': side,
            'type': type,
            'id': response['{{ data.responses.result }}']['{{ data.responses.id_field }}'],
        });
    }
