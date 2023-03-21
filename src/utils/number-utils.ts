export const roundDown = (num: number) => {
    if (num < 10) {
        return num;
    }
    const numString = num.toString();
    const firstDigit = parseInt(numString[0]);
    const numOfDigits = numString.length;
    return firstDigit * Math.pow(10, numOfDigits - 1);
};

export const roundUp = (num: number) => {
    if (num < 10) {
        return 10;
    }
    const numString = num.toString();
    const firstDigit = parseInt(numString[0]);
    const numOfDigits = numString.length;
    return (firstDigit + 1) * Math.pow(10, numOfDigits - 1);
};
