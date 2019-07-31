module.exports.floatMath = {

    // Description: get the spotExchangeRate, i.e. how many tokenOuts a trader gets for one tokenIn,
    //      there is no slippage in this calculation
    // OBalance = tokenOut Balance in pool
    // IBalance = tokenIn Balance in pool
    // IWeight = tokenIn weight in pool
    // OWeight = tokenOut Balance of pool
    spotPrice: function(OBalance, IBalance, IWeight, OWeight) {
        // Requirements
        if( OBalance<=0 || IBalance<=0 || IWeight<=0 || OWeight<=0) {
            throw "Bad argument";
        }
        var numer = OBalance/OWeight;
        var denom = IBalance/IWeight;
        return numer/denom;
    },

    // Description: get qOut which is the amount of tokenOut a user gets when selling IAmount tokenIn
    // OBalance = tokenOut Balance in pool
    // IBalance = tokenIn Balance in pool
    // IAmount = amount of tokenIn being sold
    // IWeight = tokenIn weight in pool
    // OWeight = tokenOut Balance of pool
    // fee = pool fee
    swapImath: function (OBalance, IBalance, IAmount, IWeight, OWeight, fee) {
        if( OBalance<=0 || IBalance<=0 || IAmount<=0 || IWeight<=0 || OWeight<=0 || fee>=1 ) {
            throw new Error("Invalid arguments");
        }
        var exponent = (IWeight / OWeight);
        var adjustedIn = IAmount * (1-fee);
        var foo = IBalance / (IBalance + adjustedIn);
        var bar = foo**exponent;
        
        return OBalance * (1 - bar);
    },

    // Description: get qOut which is the amount of tokenOut a user gets when selling IAmount tokenIn
    // OBalance = tokenOut Balance in pool
    // IBalance = tokenIn Balance in pool
    // IAmount = amount of tokenIn being sold
    // IWeight = tokenIn weight in pool
    // OWeight = tokenOut Balance of pool
    swapImath_Approx: function(OBalance, IBalance, IAmount, IWeight, OWeight) {
        // Requirements
        if( OBalance<=0 || IBalance<=0 || IAmount<=0 || IWeight<=0 || OWeight<=0) {
            throw "Bad argument";
        }

        if (IWeight>OWeight) {
            // Expand power into two
            // first with integer exponent >=1
            // then with exponent <1
            var floored = Math.floor(IWeight/OWeight);
            var fractional = (IWeight/OWeight) - floored
            integerPower = (IBalance/(IBalance+IAmount)) ** floored
            return OBalance - (integerPower * this.binExpqOut(OBalance, IBalance, IAmount, fractional, OWeight));
        } else {
            // Use binomial expansion directly since exponent <1
            return OBalance-this.binExpqOut(OBalance, IBalance, IAmount, IWeight, OWeight);
        }

    },

    binExpqOut: function(OBalance, IBalance, IAmount, IWeight, OWeight) {
        return OBalance
            -this.BinExpqOutTermN(OBalance, IBalance, IAmount, IWeight, OWeight, 1)
            -this.BinExpqOutTermN(OBalance, IBalance, IAmount, IWeight, OWeight, 2)
            -this.BinExpqOutTermN(OBalance, IBalance, IAmount, IWeight, OWeight, 3)
            -this.BinExpqOutTermN(OBalance, IBalance, IAmount, IWeight, OWeight, 4)
            -this.BinExpqOutTermN(OBalance, IBalance, IAmount, IWeight, OWeight, 5);
    },

    BinExpqOutTermN: function(OBalance, IBalance, IAmount, IWeight, OWeight, n) {
        if(n == 0){
            return OBalance;
        } else if(n == 1) {
            return (((OBalance*IWeight)/OWeight)*IAmount)/(IBalance+IAmount);
        } else {
            var binExp = this.BinExpqOutTermN(OBalance, IBalance, IAmount, IWeight, OWeight, n-1);
            return ((((binExp*(n-1)*(OWeight-IWeight))/OWeight)*IAmount)/n)/(IBalance+IAmount);
        }
    }
}
