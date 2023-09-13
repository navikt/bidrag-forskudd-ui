export const roundDown = (num: number) => {
    if (num < 10) {
        return num;
    }
    const numString = num.toString();
    const firstDigit = parseInt(numString[0]);
    const numOfDigits = numString.length;
    return (firstDigit - 1) * Math.pow(10, numOfDigits - 1);
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

export const getRandomInt = () => {
    const min = Math.ceil(1);
    const max = Math.floor(10000);
    return Math.floor(Math.random() * (max - min + 1) + min);
};
