    parseDeposit (deposit) {
        let code = this.commonCurrencyCode (this.safeString (deposit['{{ data.responses.currency.field_name }}'], '{{ data.responses.id_field }}'));
        let currencyId = this.safeString (deposit['{{ data.responses.currency.field_name }}'], '{{ data.responses.currency_id_field }}');
        let currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency !== undefined) {
            code = currency['code'];
        }
        const confirmed = this.safeValue (deposit, '{{ data.responses.confirmed_field }}', false);
        let status = 'pending';
        if (confirmed) {
            status = 'ok';
        }
        const timestamp = this.parse8601 (this.safeString (deposit, '{{ data.responses.timestamp_field }}'));
        return {
            'info': deposit,
            'id': this.safeString (deposit, '{{ data.responses.id_field }}'),
            'currency': code,
            'amount': this.safeFloat (deposit, '{{ data.responses.amount_field }}'),
            'address': this.safeString (deposit['{{ data.responses.address.field_name }}'], '{{ data.responses.address_field }}'),
            'tag': undefined,
            'status': status,
            'type': 'withdrawal',
            'updated': undefined,
            'txid': this.safeString (deposit, '{{ data.responses.txid_field }}'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }
