    async createLimitOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let response = await this.createOrder (symbol, type, side, price, params);
        return response;
    }
