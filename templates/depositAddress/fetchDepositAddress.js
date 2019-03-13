    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            '{{ data.requests.currency_field }}': currency['id'],
        };
        const response = await this.{{ data.fetchDepositAddress.request.endpoint }} (this.extend (request, params));
        let addresses = this.parseDepositAddresses (response['{{ data.responses.result }}']);
        if (!addresses) {
            throw new AddressPending (this.id + ' the address for ' + code + ' is being generated (pending, not ready yet, retry again later)');
        }
        this.checkAddress (addresses[0]);
        return addresses[0];
    }
