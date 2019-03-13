    parseDepositAddress (depositAddress, currency = undefined) {
        let address = this.safeString (depositAddress['{{ data.responses.address.field_name }}'], '{{ data.responses.address_field }}');
        const code = this.commonCurrencyCode (this.safeString (depositAddress['{{ data.responses.currency.field_name }}'], '{{ data.responses.currency.code_field }}'));
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': depositAddress,
        };
    }
