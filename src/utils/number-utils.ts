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

export const formatterBeløp = (beløp: number | string | undefined): string => {
    if (!beløp) return "0";
    return beløp.toLocaleString("nb-NO");
};
