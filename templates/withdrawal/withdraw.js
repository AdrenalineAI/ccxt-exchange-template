    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            '{{ data.requests.currency_id_field }}': currency['id'],
            '{{ data.requests.amount_field }}': amount,
            '{{ data.requests.address_field }}': address,
            'password': params['password'],
        };
        let response = await this.{{ data.withdraw.request.endpoint }} (this.extend (request, params));
        let id = undefined;
        if ('{{ data.responses.result }}' in response) {
            if ('{{ data.responses.withdrawals.field_name }}' in response['{{ data.responses.result }}'])
                id = response['{{ data.responses.result }}']['{{ data.responses.withdrawals.field_name }}']['{{ data.responses.id_field }}'];
        }
        return {
            'info': response,
            'id': id,
        };
    }
