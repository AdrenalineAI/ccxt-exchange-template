    parseMarkets (markets) {
        let results = [];
        for (let i = 0; i < markets.length; i++) {
            results.push (this.parseMarket (markets[i]));
        }
        return results;
    }
