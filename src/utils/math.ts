export function padDecimal(input: number, padCount: number) {
    let minus = input < 0;
    if(minus) input = -input;

    let integer = Math.floor(input);
    let intString = integer.toString();
    let numberString = input.toString();

    if(intString === numberString) numberString = `${numberString}.`

    let finalLength = intString.length + padCount + 1;
    numberString = numberString.padEnd(finalLength, '0').slice(0, finalLength);

    return `${minus ? '-' : ''}${numberString}`
}