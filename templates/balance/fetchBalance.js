    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.{{ data.fetchBalance.request.endpoint }} (params);
        let balances = response['{{ data.responses.result }}'];
        return this.parseBalances (balances);
    }
