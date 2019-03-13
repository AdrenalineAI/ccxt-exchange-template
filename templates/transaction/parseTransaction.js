    parseTransaction (transaction, currency = undefined) {
        return {
            'info': transaction,
            'id': transaction['{{ data.responses.id_field }}'],
            'txid': transaction['{{ data.responses.txid_field }}'],
            'timestamp': transaction['{{ data.responses.created_field }}'],
            'datetime': this.parse8601 (transaction['{{ data.responses.created_field }}']),
            'addressFrom': undefined,
            'address': transaction['{{ data.responses.address_field }}'],
            'addressTo': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': transaction,
            'amount': transaction['{{ data.responses.amount_field }}'],
            'currency': transaction['{{ data.responses.currency.field_name }}']['{{ data.responses.currency.code_field }}'],
            'status': 'ok',
            'updated': undefined,
            'message': undefined,
            'fee': undefined,
        };
    }
