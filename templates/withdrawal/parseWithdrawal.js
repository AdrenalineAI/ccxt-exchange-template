    parseWithdrawal (withdrawal, currency = undefined) {
        let code = undefined;
        let currencyId = this.safeString (withdrawal['{{ data.responses.currency.field_name }}'], '{{ data.responses.id_field }}');
        currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency !== undefined) {
            code = currency['{{ data.responses.currency.code_field }}'];
        } else {
            code = this.commonCurrencyCode (this.safeString (withdrawal['{{ data.responses.currency.field_name }}'], '{{ data.responses.currency.code_field }}'));
        }
        const confirmed = this.safeValue (withdrawal, '{{ data.responses.confirmed_field }}');
        const cancelled = this.safeValue (withdrawal, '{{ data.responses.cancelled_field }}');
        const confirms = this.safeInteger (withdrawal, '{{ data.responses.confirms_field }}', 0);
        let status = undefined;
        if (confirms) {
            status = 'ok';
        } else if (cancelled) {
            status = 'canceled';
        } else if (confirmed) {
            status = 'pending';
        }
        const timestamp = this.parse8601 (this.safeString (withdrawal, '{{ data.responses.created_field }}'));
        return {
            'info': withdrawal,
            'id': this.safeString (withdrawal, '{{ data.responses.txid_field }}'),
            'currency': code,
            'amount': this.safeFloat (withdrawal, '{{ data.responses.amount_field }}'),
            'address': this.safeString (withdrawal, '{{ data.responses.address_field }}'),
            'tag': undefined,
            'status': status,
            'type': 'withdrawal',
            'updated': undefined,
            'txid': this.safeString (withdrawal, '{{ data.responses.txid_field }}'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }
