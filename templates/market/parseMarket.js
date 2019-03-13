    parseMarket (market) {
        let id = market['{{ data.responses.id_field }}'];
        let baseId = market['{{ data.responses.base_currency.field_name }}']['{{ data.responses.currency.code_field }}'];
        let quoteId = market['{{ data.responses.quote_currency.field_name }}']['{{ data.responses.currency.code_field }}'];
        let base = this.commonCurrencyCode (baseId);
        let quote = this.commonCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        let pricePrecision = 8;
        if (quote in this.options['pricePrecisionByCode'])
            pricePrecision = this.options['pricePrecisionByCode'][quote];
        let precision = {
            'amount': 8,
            'price': pricePrecision,
        };
        let paused = this.safeValue (market, '{{ data.responses.market.paused_field }}', false);
        if (paused === 'false' || !paused) {
            paused = true;
        }
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': !paused,
            'info': market,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': undefined,
                },
            },
        };
    }

