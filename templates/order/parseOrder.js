    parseOrder (order, market = undefined) {
        let side = this.safeString (order, '{{ data.responses.order.side_field }}');
        let remaining = this.safeFloat (order, '{{ data.responses.order.remaining_field }}');
        // We parse different fields in a very specific order.
        // Order might well be closed and then canceled.
        let status = undefined;
        if (remaining > 0)
            status = 'open';
        if (this.safeValue (order, '{{ data.responses.order.cancelled_field }}', false))
            status = 'canceled';
        if (remaining === 0)
            status = 'closed';
        let symbol = undefined;
        if ('{{ data.responses.order.market_id }}' in order) {
            let marketId = order['{{ data.responses.order.market_id }}'];
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (marketId);
            }
        } else {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        let timestamp = undefined;
        if ('{{ data.responses.created_field }}' in order)
            timestamp = order['{{ data.responses.created_field }}'];
        let lastTradeTimestamp = undefined;
        if (('{{ data.responses.closed_field }}' in order) && (order['{{ data.responses.closed_field }}'] !== 0))
            lastTradeTimestamp = order['{{ data.responses.closed_field }}'];
        if (timestamp === undefined)
            timestamp = lastTradeTimestamp;
        let price = this.safeFloat (order, '{{ data.responses.price_field }}');
        let amount = this.safeFloat (order, '{{ data.responses.order.amount_field }}');
        let cost = this.safeFloat (order, '{{ data.responses.cost_field }}');
        let filled = undefined;
        if (amount !== undefined && remaining !== undefined) {
            filled = amount - remaining;
        }
        let id = this.safeString (order, '{{ data.responses.id_field }}');
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }
