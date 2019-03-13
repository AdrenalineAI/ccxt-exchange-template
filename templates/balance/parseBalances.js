    parseBalances (balances) {
        let results = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let row = this.parseBalance (balance);
            results[row['currency']] = row['account'];
        }
        return results;
    }
