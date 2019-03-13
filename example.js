'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AddressPending, AuthenticationError, DDoSProtection, ExchangeError, InsufficientFunds, InvalidNonce, OrderNotFound } = require ('./base/errors');
const { TRUNCATE, DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

{% block body %}
module.exports = class {{ data.exchange.id }} extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': '{{ data.exchange.id }}',
            'name': '{{ data.exchange.name }}',
            'countries': [
                {% for country in data.exchange.countries %}
                '{{ country }}',
                {% endfor %}
            ],
            'version': '{{ data.api.version }}',
            'rateLimit': {{ data.api.rateLimit }},
            'certified': false,
            // new metainfo interface
            // 25 of 34 Methods implemented
            'has': {
                {% for endpoint in data.has %}
                '{{ endpoint }}': {% if data.has[endpoint] %}true{% else %}false{% endif %},
                {% endfor %}
            },
            'hostname': '{{ data.exchange.hostname }}',
            'timeframes': {
                {% for timeframe in data.exchange.timeframes %}
                '{{ timeframe }}': '{{ data.exchange.timeframes[timeframe] }}',
                {% endfor %}
            },
            'urls': {
                'logo': '{{ data.url.logo }}',
                'api': {
                    '{{ data.api.version }}': '{{ data.api.url }}',
                },
                'www': '{{ data.url.website }}',
                'doc': [
                    {% for document in data.url.documents %}
                    '{{ document }}',
                    {% endfor %}
                ],
                'fees': [
                      {% for fee in data.url.fees %}
                      '{{ fee }}',
                      {% endfor %}
                ],
            },
            'api': {
                '{{ data.api.version }}': {
                    'get': [
                        {% for endpoint in data.api.getEndpoints %}
                        '{{ endpoint }}',
                        {% endfor %}
                    ],
                    'post': [
                        {% for endpoint in data.api.postEndpoints %}
                        '{{ endpoint }}',
                        {% endfor %}
                    ],
                    'delete': [
                        {% for endpoint in data.api.deleteEndpoints %}
                        '{{ endpoint }}',
                        {% endfor %}
                    ],
                },
            },
            'requiredCredentials': {
                {% for credential in data.api.requiredCredentials %}
                '{{ credential }}': {% if data.api.requiredCredentials[credential] %}true{% else %}false{%endif %},
                {% endfor %}
            },
            'fees': {
                'trading': {
                    'tierBased': {% if data.fees.trading.tierBased %}true{% else %}false{% endif %},
                    'percentage': {% if data.fees.percentageBased %}true{% else %}false{% endif %},
                    'maker': {{ data.fees.trading.makerFee }},
                    'taker': {{ data.fees.trading.takerFee }},
                },
                'funding': {
                    'tierBased': {% if data.fees.fundingtierBased %}true{% else %}false{% endif %},
                    'percentage': {% if data.fees.fundingPercentageBased %}true{% else %}false{% endif %},
                    'withdraw': {
                    },
                    'deposit': {
                    },
                },
            },
            'exceptions': {
                {% for exception in data.exceptions %}
                '{{ exception }}': {{ data.exceptions[exception] }},
                {% endfor %}
            },
            'options': {
                // price precision by quote currency code
                'pricePrecisionByCode': {
                    'USD': 3,
                },
                'symbolSeparator': '{{ data.exchange.seperatorSymbol }}',
                'tag': {
                },
            },
            'commonCurrencies': {
            },
        });
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    feeToPrecision (symbol, fee) {
        return this.decimalToPrecision (fee, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    nonce () {
        return this.seconds ();
    }

    {% if data.createDepositAddress %}
    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            '{{ data.requests.currency_id_field }}': currency['id'],
        };
        const response = await this.{{ data.createDepositAddress.request.endpoint }} (this.extend (request, params));
        if (response['{{ data.responses.result }}'].length > 0) {
            return this.parseDepositAddress (response['{{ data.responses.result }}'][0]);
        }
        return [];
    }
    {% endif %}

    {% if data.createOrder %}
    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            '{{ data.requests.market_id_field }}': market['id'],
            '{{ data.requests.amount_field }}': this.amountToPrecision (symbol, amount),
            '{{ data.requests.price_field }}': this.priceToPrecision (symbol, price),
            '{{ data.requests.side_field }}': side,
        };
        let response = await this.{{ data.createOrder.request.endpoint }} (this.extend (order, params));
        return this.extend (this.parseOrder (response['{{ data.responses.result }}'], market), {
            'status': 'open',
            'price': order['{{ data.responses.price_field }}'],
            'symbol': symbol,
            'amount': order['{{ data.responses.amount_field }}'],
            'side': side,
            'type': type,
            'id': response['{{ data.responses.result }}']['{{ data.responses.id_field }}'],
        });
    }
    {% endif %}

    {% if data.createLimitOrder and data.createOrder %}
    async createLimitOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let response = await this.createOrder (symbol, type, side, price, params);
        return response;
    }
    {% endif %}

    {% if data.cancelOrder %}
    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = { '{{ data.requests.order_id_field }}': id };
        let response = await this.{{ data.cancelOrder.request.endpoint }} (this.extend (request, params));
        return this.extend (this.parseOrder (response), {
            'status': 'canceled',
        });
    }
    {% endif %}

    {% if data.cancelOrders %}
    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let response = await this.{{ data.cancelOrders.request.endpoint }} (this.extend (request, params));
        return this.extend (this.parseOrder (response), {
            'status': 'canceled',
        });
    }
    {% endif %}

    {% if data.fetchBalance %}
    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.{{ data.fetchBalance.request.endpoint }} (params);
        let balances = response['{{ data.responses.result }}'];
        return this.parseBalances (balances);
    }
    {% endif %}

    {% if data.fetchClosedOrders %}
    async fetchClosedOrders (symbol = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let request = {
            '{{ data.requests.symbol_field }}': symbol,
            '{{ data.requests.begin_field }}': since,
            '{{ data.requests.limit_field }}': limit,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.{{ data.fetchClosedOrders.request.endpoint }} (this.extend (request, params));
        let orders = this.parseOrders (response['{{ data.responses.result }}'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }
    {% endif %}

    {% if data.fetchCurrencies %}
    async fetchCurrencies (params = {}) {
        const response = await this.{{ data.fetchCurrencies.request.endpoint }} (params);
        let currencies = this.parseCurrencies (response['{{ data.responses.result }}']);
        return currencies;
    }
    {% endif %}

    {% if data.fetchDeposits %}
    async fetchDeposits (code = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        const request = {
            '{{ data.requests.symbol_field }}': code,
            '{{ data.requests.limit_field }}': limit,
            '{{ data.requests.page_field }}': since,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        const response = await this.{{ data.fetchDeposits.request.endpoint }} (this.extend (request, params));
        return this.parseDeposits (response['{{ data.responses.result }}']);
    }
    {% endif %}

    {% if data.fetchDepositAddress %}
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
    {% endif %}

    {% if data.fetchDepositAddresses %}
    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            '{{ data.requests.currency_field }}': [],
        };
        for (let i = 0; i < codes.length; i++) {
            request['{{ data.requests.currency_field }}'].push (codes);
        }
        const response = await this.{{ data.fetchDepositAddresses.request.endpoint }} (this.extend (request, params));
        return this.parseDepositAddresses (response);
    }
    {% endif %}

    {% if data.fetchLedger %}
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
    {% endif %}

    {% if data.fetchMarkets %}
    async fetchMarkets (params = {}) {
        const response = await this.{{ data.fetchMarkets.request.endpoint }} ();
        return this.parseMarkets (response['{{ data.responses.result }}']);
    }
    {% endif %}

    {% if data.fetchMyTrades %}
    async fetchMyTrades (symbol = undefined, since = 0, limit = 0, params = {}) {
        params['{{ data.requests.symbol_field }}'] = symbol;
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.{{ data.fetchMyTrades.request.endpoint }} (this.extend ({
            '{{ data.requests.market_id_field }}': market['id'],
            '{{ data.requests.since_field }}': since,
            '{{ data.requests.limit_field }}': limit,
        }, params));
        if ('{{ data.responses.result }}' in response) {
            if (response['{{ data.responses.result }}'] !== undefined) {
                // Re-format dat
                let data = [];
                for (let i = 0; i < response['{{ data.responses.result }}'].length; i++) {
                    let order = response['{{ data.responses.result }}'][i];
                    data.push ({
                        'market': order['{{ data.responses.id_field }}'],
                        'amount': order['{{ data.responses.amount_field }}'],
                        'symbol': symbol,
                        'maker': order['{{ data.responses.maker_field }}'],
                        'price': order['{{ data.responses.price_field }}'],
                        'created': order['{{ data.responses.created_field }}'],
                    });
                }
                return this.parseTrades (data, market, since, limit);
            }
        }
        throw new ExchangeError (this.id + ' fetchMyTrades() returned undefined response');
    }
    {% endif %}

    {% if data.fetchOHLCV %}
    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 0, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            '{{ data.requests.timeframe_field }}': this.timeframes[timeframe],
            '{{ data.requests.market_id_field }}': market['id'],
            '{{ data.requests.begin_field }}': since,
            '{{ data.requests.limit_field }}': limit,
        };
        let response = await this.{{ data.fetchOHLCV.request.endpoint }} (this.extend (request, params));
        if ('{{ data.responses.result }}' in response) {
            if (response['{{ data.responses.result }}'])
                return this.parseOHLCVs (response['{{ data.responses.result }}'], market, timeframe, since, limit);
        }
        return [];
    }
    {% endif %}

    {% if data.fetchOpenOrders %}
    async fetchOpenOrders (symbol = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let request = {
            '{{ data.requests.begin_field }}': since,
            '{{ data.requests.limit_field }}': limit,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['{{ data.requests.market_id_field }}'] = market['id'];
        }
        let response = await this.{{ data.fetchOpenOrders.request.endpoint }} (this.extend (request, params));
        let orders = this.parseOrders (response['{{ data.responses.result }}'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }
    {% endif %}

    {% if data.fetchOrder %}
    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            let request = { '{{ data.requests.order_id_field }}': id };
            response = await this.{{ data.fetchOrder.request.endpoint }} (this.extend (request, params));
            return this.parseOrder (response['{{ data.responses.result }}']);
        } catch (e) {
            throw e;
        }
    }
    {% endif %}

    {% if data.fetchOrders %}
    async fetchOrders (symbol = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let request = {
            '{{ data.requests.symbol_field }}': symbol,
            '{{ data.requests.begin_field }}': since,
            '{{ data.requests.limit_field }}': limit,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['{{ data.requests.market_id_field }}'] = market['id'];
        }
        let response = await this.{{ data.fetchOrders.request.endpoint }} (this.extend (request, params));
        let orders = this.parseOrders (response['{{ data.responses.result }}'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }
    {% endif %}

    {% if data.fetchOrderBook %}
    async fetchOrderBook (symbol, limit = 0, params = {}) {
        await this.loadMarkets ();
        let response = await this.{{ data.fetchOrderBook.request.endpoint }} (this.extend ({
            '{{ data.requests.market_id_field }}': this.marketId (symbol),
            '{{ data.requests.limit_field }}': limit,
            '{{ data.requests.side_field }}': 'both',
        }, params));
        let orderbook = response['{{ data.responses.result }}'];
        return this.parseOrderBook (orderbook, undefined, '{{ data.responses.data_bids_key }}', '{{ data.responses.data_asks_key }}', 0, 1);
    }
    {% endif %}

    {% if data.fetchTicker %}
    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.{{ data.fetchTicker.request.endpoint }} (this.extend ({
            '{{ data.requests.market_id_field }}': this.marketId (symbol),
        }, params));
        let ticker = response['{{ data.responses.result }}'];
        return this.parseTicker (ticker, market);
    }
    {% endif %}

    {% if data.fetchTickers %}
    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.{{ data.fetchTickers.request.endpoint }} (this.extend ({
            '{{ data.requests.symbol_field }}': symbols,
        }, params));
        let tickers = response['{{ data.responses.result }}'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = tickers[t];
            let id = ticker['{{ data.responses.id_field }}'];
            let market = undefined;
            let symbol = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                if (market) {
                    symbol = market['symbol'];
                }
            } else {
                symbol = this.parseSymbol (symbol);
                market = this.markets (symbol);
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }
    {% endif %}

    {% if data.fetchTrades %}
    async fetchTrades (symbol, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.{{ data.fetchTrades.request.endpoint }} (this.extend ({
            '{{ data.requests.market_id_field }}': market['id'],
            '{{ data.requests.limit_field }}': limit,
            '{{ data.requests.since_field }}': since,
        }, params));
        if ('{{ data.responses.result }}' in response) {
            if (response['{{ data.responses.result }}'] !== undefined) {
                // Re-format dat
                let data = [];
                for (let i = 0; i < response['{{ data.responses.result }}'].length; i++) {
                    let order = response['{{ data.responses.result }}'][i];
                    data.push ({
                        'market': order['{{ data.responses.id_field }}'],
                        'amount': order['{{ data.responses.amount_field }}'],
                        'symbol': symbol,
                        'maker': order['{{ data.responses.maker_field }}'],
                        'price': order['{{ data.responses.price_field }}'],
                        'created': order['{{ data.responses.created_field }}'],
                    });
                }
                return this.parseTrades (data, market, since, limit);
            }
        }
        throw new ExchangeError (this.id + ' fetchTrades() returned undefined response');
    }
    {% endif %}

    {% if data.fetchTransactions %}
    async fetchTransactions (symbol = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let response = await this.{{ data.fetchTransactions.request.endpoint}} ();
        return this.parseTransactions (response['{{ data.responses.result }}']);
    }
    {% endif %}

    {% if data.fetchWithdrawals %}
    async fetchWithdrawals (code = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        const request = {
            '{{ data.requests.begin_field }}': since,
            '{{ data.requests.limit_field }}': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['{{ data.requests.currency_id_field }}'] = currency['id'];
        }
        const response = await this.{{ data.fetchWithdrawals.request.endpoint }} (this.extend (request, params));
        return this.parseWithdrawals (response['{{ data.responses.result }}'], currency);
    }
    {% endif %}

    {% if data.transfer %}
    async transfer (code, amount, accountFrom = undefined, accountTo = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            '{{ data.requests.account_to_field }}': accountTo,
            '{{ data.requests.currency_name_field }}': currency.name,
            '{{ data.requests.account_from_field }}': accountFrom,
            '{{ data.requests.amount_field }}': this.parseFloat (amount),
        };
        let response = await this.{{ data.transfer.request.endpoint }} (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }
    {% endif %}

    {% if data.withdraw %}
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
    {% endif %}

    {% if data.fetchBalance %}
    parseBalance (balance) {
        let currency = this.commonCurrencyCode (balance['{{ data.responses.currency.field_name }}']['{{ data.responses.currency.symbol_field }}']);
        let free = this.safeFloat (balance, '{{ data.responses.balance.free_balance_field }}', 0);
        let used = this.safeFloat (balance, '{{ data.responses.balance.used_balance_field }}', 0);
        let total = free + used;
        const account = {
            'free': free,
            'used': used,
            'total': total,
        };
        return { 'currency': currency, 'account': account };
    }
    {% endif %}

    {% if data.fetchBalance %}
    parseBalances (balances) {
        let results = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let row = this.parseBalance (balance);
            results[row['currency']] = row['account'];
        }
        return results;
    }
    {% endif %}

    {% if data.fetchCurrencies %}
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
    {% endif %}

    {% if data.fetchDepositAddress or data.createDepositAddress %}
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
    {% endif %}

    {% if data.fetchDeposits %}
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

    parseDeposits (deposits) {
        let results = [];
        for (let i = 0; i < deposits.length; i++) {
            results.push (this.parseDeposit (deposits[i]));
        }
        return results;
    }
    {% endif %}

    {% if data.fetchMarkets %}
    parseMarket (market) {
        let id = market['{{ data.responses.id_field }}'];
        let baseId = market['{{ data.responses.base_currency.field_name }}']['{{ data.responses.currency.code_field }}'];
        let quoteId = market['{{ data.responses.quote_currency.field_name }}']['{{ data.responses.currency.code_field }}'];
        let base = this.commonCurrencyCode (baseId);
        let quote = this.commonCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        let pricePrecision = 8;
        if (quote in this.options['pricePrecisionByCode'])
            pricePrecision = this.options['pricePrecisionByCode'][quote];
        let precision = {
            'amount': 8,
            'price': pricePrecision,
        };
        let paused = this.safeValue (market, '{{ data.responses.market.paused_field }}', false);
        if (paused === 'false' || !paused) {
            paused = true;
        }
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': !paused,
            'info': market,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': undefined,
                },
            },
        };
    }

    parseMarkets (markets) {
        let results = [];
        for (let i = 0; i < markets.length; i++) {
            results.push (this.parseMarket (markets[i]));
        }
        return results;
    }
    {% endif %}

    {% if data.fetchLedger %}
    parseLedgerEntries (entries, currency = undefined) {
        let results = [];
        for (let i = 0; i < entries.length; i++) {
            results.push (this.parseLedgerEntry (entries[i], currency));
        }
        return results;
    }

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
    {% endif %}

    {% if data.fetchOHLCV %}
    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = 0, limit = 0) {
        return [
            ohlcv[{{ data.responses.ohlcv.timestamp_field }}],
            ohlcv[{{ data.responses.ohlcv.open_field }}],
            ohlcv[{{ data.responses.ohlcv.high_field }}],
            ohlcv[{{ data.responses.ohlcv.low_field }}],
            ohlcv[{{ data.responses.ohlcv.close_field }}],
            ohlcv[{{ data.responses.ohlcv.volume_field }}],
        ];
    }
    {% endif %}

    {% if data.createLimitOrder or data.createOrder or data.cancelOrder or data.cancelOrders or data.fetchOrder or data.fetchOrders or data.fetchOpenOrders or data.fetchClosedOrders %}
    parseOrder (order, market = undefined) {
        let side = this.safeString (order, '{{ data.responses.order.side_field }}');
        let remaining = this.safeFloat (order, '{{ data.responses.order.remaining_field }}');
        // We parse different fields in a very specific order.
        // Order might well be closed and then canceled.
        let status = undefined;
        if (remaining > 0)
            status = 'open';
        if (this.safeValue (order, '{{ data.responses.order.cancelled_field }}', false))
            status = 'canceled';
        if (remaining === 0)
            status = 'closed';
        let symbol = undefined;
        if ('{{ data.responses.order.market_id }}' in order) {
            let marketId = order['{{ data.responses.order.market_id }}'];
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (marketId);
            }
        } else {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        let timestamp = undefined;
        if ('{{ data.responses.created_field }}' in order)
            timestamp = order['{{ data.responses.created_field }}'];
        let lastTradeTimestamp = undefined;
        if (('{{ data.responses.closed_field }}' in order) && (order['{{ data.responses.closed_field }}'] !== 0))
            lastTradeTimestamp = order['{{ data.responses.closed_field }}'];
        if (timestamp === undefined)
            timestamp = lastTradeTimestamp;
        let price = this.safeFloat (order, '{{ data.responses.price_field }}');
        let amount = this.safeFloat (order, '{{ data.responses.order.amount_field }}');
        let cost = this.safeFloat (order, '{{ data.responses.cost_field }}');
        let filled = undefined;
        if (amount !== undefined && remaining !== undefined) {
            filled = amount - remaining;
        }
        let id = this.safeString (order, '{{ data.responses.id_field }}');
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }
    {% endif %}

    parseSymbol (id) {
        let [ quote, base ] = id.split (this.options['{{ data.exchange.seperatorSymbol }}']);
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        return base + '/' + quote;
    }

    parseTicker (ticker, market = undefined) {
        return {
            'symbol': this.safeString (ticker, '{{ data.responses.symbol_field }}'),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeFloat (ticker, '{{ data.responses.ticker.high_field }}'),
            'low': this.safeFloat (ticker, '{{ data.responses.ticker.low_field }}'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (ticker, '{{ data.responses.ticker.close_field }}'),
            'last': this.safeFloat (ticker, '{{ data.responses.ticker.last_field }}'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, '{{ data.responses.ticker.percentage_change_field }}'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, '{{ data.responses.ticker.base_volume_field }}'),
            'quoteVolume': this.safeFloat (ticker, '{{ data.responses.ticker.quote_volume_field }}'),
            'info': ticker,
        };
    }

    {% if data.fetchTrades or data.fetchMyTrades %}
    parseTrade (trade, market = undefined) {
        let timestamp = trade['created'];
        let side = trade['maker'];
        let id = undefined;
        if (market === undefined) {
            market = this.marketId (trade['market']);
        }
        let symbol = market['market'];
        let cost = undefined;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }
    {% endif %}

    {% if data.fetchTransactions %}
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
    {% endif %}

    {% if data.withdraw or data.fetchWithdrawals %}
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

    parseWithdrawals (withdraws, currency = undefined) {
        let results = [];
        for (let i = 0; i < withdraws.length; i++) {
            results.push (this.parseWithdrawal (withdraws[i], currency));
        }
        return results;
    }
    {% endif %}

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'][api], {
            'hostname': this.hostname,
        }) + '/{{ data.api.version }}/';
        url += this.implodeParams (path, params);
        params['limit'] = 500;
        url += '?' + this.urlencode (params);
        this.checkRequiredCredentials ();
        let nonce = this.nonce ().toString ();
        let signature = this.hmac (this.encode (nonce), this.encode (this.secret), '{{ data.api.hmac.algorithm }}');
        headers = {
            '{{ data.api.headers.signature_field }}': signature,
            '{{ data.api.headers.api_key_field }}': this.apiKey,
            '{{ data.api.headers.nonce_field }}': nonce,
            'Content-Type': 'application/json',
        };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (body[0] === '{') {
            let data = this.safeValue (response, 'data');
            let errors = this.safeValue (response, 'errors');
            const feedback = this.id + ' ' + this.json (response);
            if (errors !== undefined) {
                const message = errors[0];
                if (message in this.exceptions)
                    throw new this.exceptions[message] (feedback);
                throw new ExchangeError (this.id + ' an error occoured: ' + this.json (errors));
            }
            if (data === undefined)
                throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
        }
    }

    async request (path, api = '', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        return response;
    }
};
{% endblock %}
