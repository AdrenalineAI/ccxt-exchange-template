    parseLedgerEntry (entry, currency = undefined) {
        let direction = undefined;
        const id = this.safeString (entry, '{{ data.responses.id_field }}');
        let type = this.safeString (entry, '{{ data.responses.ledger_type_field }}');
        const code = this.safeCurrencyCode (entry['{{ data.responses.currency.field_name }}'], '{{ data.responses.currency.code_field }}', currency);
        let amount = this.safeFloat (entry, '{{ data.responses.amount_field }}');
        if (amount < 0) {
            direction = 'out';
        } else {
            direction = 'in';
        }
        let timestamp = this.milliseconds ();
        let data = {
            'info': entry,
            'id': id,
            'direction': direction,
            'account': undefined,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'balanceBefore': undefined,
            'balanceAfter': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'cost': undefined,
                'currency': code,
            },
        };
        return data;
    }
