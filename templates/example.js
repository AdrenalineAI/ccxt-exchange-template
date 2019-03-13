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
    {% include 'depositAddress/createDepositAddress.js' %}
    {% endif %}

    {% if data.createOrder %}
    {% include 'order/createOrder.js' %}
    {% endif %}

    {% if data.createLimitOrder and data.createOrder %}
    {% include 'order/createLimitOrder.js' %}
    {% endif %}

    {% if data.cancelOrder %}
    {% include 'order/cancelOrder.js' %}
    {% endif %}

    {% if data.cancelOrders %}
    {% include 'order/cancelOrders.js' %}
    {% endif %}

    {% if data.fetchBalance %}
    {% include 'balance/fetchBalance.js' %}
    {% endif %}

    {% if data.fetchClosedOrders %}
    {% include 'order/fetchClosedOrders.js' %}
    {% endif %}

    {% if data.fetchCurrencies %}
    {% include 'currency/fetchCurrencies.js' %}
    {% endif %}

    {% if data.fetchDeposits %}
    {% include 'deposit/fetchDeposits.js' %}
    {% endif %}

    {% if data.fetchDepositAddress %}
    {% include 'depositAddress/fetchDepositAddress.js' %}
    {% endif %}

    {% if data.fetchDepositAddresses %}
    {% include 'depositAddress/fetchDepositAddresses.js' %}
    {% endif %}

    {% if data.fetchLedger %}
    {% include 'ledger/fetchLedger.js' %}
    {% endif %}

    {% if data.fetchMarkets %}
    {% include 'market/fetchMarkets.js' %}
    {% endif %}

    {% if data.fetchMyTrades %}
    {% include 'trade/fetchMyTrades.js' %}
    {% endif %}

    {% if data.fetchOHLCV %}
    {% include 'ohlcv/fetchOHLCV.js' %}
    {% endif %}

    {% if data.fetchOpenOrders %}
    {% include 'order/fetchOpenOrders.js' %}
    {% endif %}

    {% if data.fetchOrder %}
    {% include 'order/fetchOrder.js' %}
    {% endif %}

    {% if data.fetchOrders %}
    {% include 'order/fetchOrders.js' %}
    {% endif %}

    {% if data.fetchOrderBook %}
    {% include 'orderbook/fetchOrderBook.js' %}
    {% endif %}

    {% if data.fetchTicker %}
    {% include 'ticker/fetchTicker.js' %}
    {% endif %}

    {% if data.fetchTickers %}
    {% include 'ticker/fetchTickers.js' %}
    {% endif %}

    {% if data.fetchTrades %}
    {% include 'trade/fetchTrades.js' %}
    {% endif %}

    {% if data.fetchTransactions %}
    {% include 'transaction/fetchTransactions.js' %}
    {% endif %}

    {% if data.fetchWithdrawals %}
    {% include 'withdrawal/fetchWithdrawals.js' %}
    {% endif %}

    {% if data.transfer %}
    {% include 'transfer/transfer.js' %}
    {% endif %}

    {% if data.withdraw %}
    {% include 'withdrawal/withdraw.js' %}
    {% endif %}

    {% if data.fetchBalance %}
    {% include 'balance/parseBalance.js' %}

    {% include 'balance/parseBalances.js' %}
    {% endif %}

    {% if data.fetchCurrencies %}
    {% include 'currency/parseCurrencies.js' %}
    {% endif %}

    {% if data.fetchDepositAddress or data.createDepositAddress %}
    {% include 'depositAddress/parseDepositAddress.js' %}
    {% endif %}

    {% if data.fetchDeposits %}
    {% include 'deposit/parseDeposit.js' %}

    {% include 'deposit/parseDeposits.js' %}
    {% endif %}

    {% if data.fetchMarkets %}
    {% include 'market/parseMarket.js' %}

    {% include 'market/parseMarkets.js' %}
    {% endif %}

    {% if data.fetchLedger %}
    {% include 'ledger/parseLedgerEntries.js' %}

    {% include 'ledger/parseLedgerEntry.js' %}
    {% endif %}

    {% if data.fetchOHLCV %}
    {% include 'ohlcv/parseOHLCV.js' %}
    {% endif %}

    {% if data.createLimitOrder or data.createOrder or data.cancelOrder or data.cancelOrders or data.fetchOrder or data.fetchOrders or data.fetchOpenOrders or data.fetchClosedOrders %}
    {% include 'order/parseOrder.js' %}
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
    {% include 'trade/parseTrade.js' %}
    {% endif %}

    {% if data.fetchTransactions %}
    {% include 'transaction/parseTransaction.js' %}
    {% endif %}

    {% if data.withdraw or data.fetchWithdrawals %}
    {% include 'withdrawal/parseWithdrawal.js' %}

    {% include 'withdrawal/parseWithdrawals.js' %}
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
