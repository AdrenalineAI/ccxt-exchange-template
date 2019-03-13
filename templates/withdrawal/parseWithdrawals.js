    parseWithdrawals (withdraws, currency = undefined) {
        let results = [];
        for (let i = 0; i < withdraws.length; i++) {
            results.push (this.parseWithdrawal (withdraws[i], currency));
        }
        return results;
    }
