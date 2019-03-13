    parseBalance (balance) {
        let currency = this.commonCurrencyCode (balance['{{ data.responses.currency.code_field }}']['{{ data.responses.currency.symbol_field }}']);
        let free = this.safeFloat (balance, '{{ data.responses.balance.free_balance_field }}', 0);
        let used = this.safeFloat (balance, '{{ data.responses.balance.used_balance_field }}', 0);
        let total = free + used;
        const account = {
            'free': free,
            'used': used,
            'total': total,
        };
        return { 'currency': currency, 'account': account };
    }
