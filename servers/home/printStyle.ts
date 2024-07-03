export const reset = "\x1b[0m";
export const bright = "\x1b[1m";
export const dim = "\x1b[2m";
export const underscore = "\x1b[4m";
export const blink = "\x1b[5m";
export const reverse = "\x1b[7m";
export const hidden = "\x1b[8m";

export const fgBlack = "\x1b[30m";
export const fgRed = "\x1b[31m";
export const fgGreen = "\x1b[32m";
export const fgYellow = "\x1b[33m";
export const fgBlue = "\x1b[34m";
export const fgMagenta = "\x1b[35m";
export const fgCyan = "\x1b[36m";
export const fgWhite = "\x1b[37m";
export const fgGray = "\x1b[90m";

export const bgBlack = "\x1b[40m";
export const bgRed = "\x1b[41m";
export const bgGreen = "\x1b[42m";
export const bgYellow = "\x1b[43m";
export const bgBlue = "\x1b[44m";
export const bgMagenta = "\x1b[45m";
export const bgCyan = "\x1b[46m";
export const bgWhite = "\x1b[47m";
export const bgGray = "\x1b[100m";

export const WIDTH_PER_CHARACTER = 9.7;
export const HEIGHT_PER_CHARACTER = 17;

export function table(ns: NS, data: string[][]): void {
    const h = "─";
    const v = "│";
    const ld = "┐";
    const lu = "┘";
    const ur = "┌";
    const ud = "└";

    let maxes: number[] = [];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data.length; j++) {
            if (maxes.length === i) maxes.push(0);
            maxes[i] = Math.max(maxes[i], data[i][j].length);
        }
    }
    for (let i = 0; i < data.length; i++) { // each column
        for (let j = 0; j < data[0].length; j++) {  // each row
            let string = h;
            string += data[i][j];
        }
    }
}