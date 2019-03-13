    async fetchMarkets (params = {}) {
        const response = await this.{{ data.fetchMarkets.request.endpoint }} ();
        return this.parseMarkets (response['{{ data.responses.result }}']);
    }
