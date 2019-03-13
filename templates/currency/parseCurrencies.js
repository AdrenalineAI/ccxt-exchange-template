    parseCurrencies (currencies) {
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, '{{ data.responses.id_field }}');
            const code = this.commonCurrencyCode (this.safeString (currency, '{{ data.responses.symbol_field }}'));
            const precision = 8; // default precision, todo: fix "magic constants"
            const address = undefined;
            const fee = this.safeFloat (currency, '{{ data.responses.fee_field }}'); // todo: redesign
            result[code] = {
                'id': id,
                'code': code,
                'address': address,
                'info': currency,
                'type': undefined,
                'name': currency['{{ data.responses.name_field }}'],
                'active': currency['{{ data.responses.active_field }}'],
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': fee,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }
