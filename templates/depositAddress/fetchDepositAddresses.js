    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            '{{ data.requests.currency_field }}': [],
        };
        for (let i = 0; i < codes.length; i++) {
            request['{{ data.requests.currency_field }}'].push (codes);
        }
        const response = await this.{{ data.fetchDepositAddresses.request.endpoint }} (this.extend (request, params));
        return this.parseDepositAddresses (response);
    }
