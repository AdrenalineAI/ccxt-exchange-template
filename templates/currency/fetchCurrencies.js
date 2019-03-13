    async fetchCurrencies (params = {}) {
        const response = await this.{{ data.fetchCurrencies.request.endpoint }} (params);
        let currencies = this.parseCurrencies (response['{{ data.responses.result }}']);
        return currencies;
    }
