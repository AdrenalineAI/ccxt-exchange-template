    async fetchLedger (code = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let request = {
            '{{ data.requests.since_field }}': since,
            '{{ data.requests.limit_field }}': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['{{ data.requests.currency_id_field }}'] = currency['id'];
        }
        const response = await this.{{ data.fetchLedger.request.endpoint }} (this.extend (request, params));
        return this.parseLedgerEntries (response['{{ data.responses.result }}'], currency);
    }
