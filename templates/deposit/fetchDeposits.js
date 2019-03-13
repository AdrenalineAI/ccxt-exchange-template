    async fetchDeposits (code = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        const request = {
            '{{ data.requests.symbol_field }}': code,
            '{{ data.requests.limit_field }}': limit,
            '{{ data.requests.page_field }}': since,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        const response = await this.{{ data.fetchDeposits.request.endpoint }} (this.extend (request, params));
        return this.parseDeposits (response['{{ data.responses.result }}']);
    }
