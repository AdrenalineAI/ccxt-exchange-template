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
