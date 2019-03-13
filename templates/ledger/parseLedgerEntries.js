    parseLedgerEntries (entries, currency = undefined) {
        let results = [];
        for (let i = 0; i < entries.length; i++) {
            results.push (this.parseLedgerEntry (entries[i], currency));
        }
        return results;
    }
