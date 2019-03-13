    async transfer (code, amount, accountFrom = undefined, accountTo = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            '{{ data.requests.account_to_field }}': accountTo,
            '{{ data.requests.currency_name_field }}': currency.name,
            '{{ data.requests.account_from_field }}': accountFrom,
            '{{ data.requests.amount_field }}': this.parseFloat (amount),
        };
        let response = await this.{{ data.transfer.request.endpoint }} (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }
