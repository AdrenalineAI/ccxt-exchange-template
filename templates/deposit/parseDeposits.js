    parseDeposits (deposits) {
        let results = [];
        for (let i = 0; i < deposits.length; i++) {
            results.push (this.parseDeposit (deposits[i]));
        }
        return results;
    }
