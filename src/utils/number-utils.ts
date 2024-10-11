export const roundDown = (num: number) => {
    const numInt = parseInt(num.toString());
    if (numInt < 10) {
        return numInt;
    }
    const numString = numInt.toString();
    const firstDigit = parseInt(numString[0]);
    const numOfDigits = numString.length;
    return (firstDigit - 1) * Math.pow(10, numOfDigits - 1);
};

export const roundUp = (num: number) => {
    const numInt = parseInt(num.toString());
    if (numInt < 10) {
        return 10;
    }
    const numString = numInt.toString();
    const firstDigit = parseInt(numString[0]);
    const numOfDigits = numString.length;
    return (firstDigit + 1) * Math.pow(10, numOfDigits - 1);
};

export const getRandomInt = () => {
    const min = Math.ceil(1);
    const max = Math.floor(10000);
    return Math.floor(Math.random() * (max - min + 1) + min);
};
export const formatterBeløpForBeregning = (beløp: number | string | undefined, visSymbol = false): string => {
    return (beløp ?? 0).toLocaleString("nb-NO", {
        style: visSymbol ? "currency" : undefined,
        currency: "NOK",
        currencySign: "accounting",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        currencyDisplay: visSymbol ? "symbol" : undefined,
    });
};
export const formatterBeløp = (beløp: number | string | undefined, visSymbol = false): string => {
    return (beløp ?? 0).toLocaleString("nb-NO", {
        style: visSymbol ? "currency" : undefined,
        currency: "NOK",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        currencyDisplay: visSymbol ? "symbol" : undefined,
    });
};

export const formatterProsent = (value: number | string | undefined): string => {
    if (!value) return "0%";
    const asNumber = typeof value == "string" ? parseFloat(value) : value;
    const percentageAsFraction = asNumber > 1 ? asNumber / 100 : asNumber;
    return percentageAsFraction.toLocaleString("nb-NO", {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
};
