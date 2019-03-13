    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            '{{ data.requests.currency_id_field }}': currency['id'],
        };
        const response = await this.{{ data.createDepositAddress.request.endpoint }} (this.extend (request, params));
        if (response['{{ data.responses.result }}'].length > 0) {
            return this.parseDepositAddress (response['{{ data.responses.result }}'][0]);
        }
        return [];
    }
