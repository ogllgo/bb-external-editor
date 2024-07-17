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

export function getColor(min: number, max: number, value: number): string {
    value = Math.max(min, Math.min(max, value));
    const normalizedValue = (value - min) / (max - min);
    const hue = (1 - normalizedValue) * 120;
    const c = 1;
    const x = (1 - Math.abs((hue / 60) % 2 - 1)) * c;
    const m = 0;

    let r: number, g: number, b: number;
    if (hue >= 0 && hue < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (hue >= 60 && hue < 120) {
        r = x;
        g = c;
        b = 0;
    } else {
        r = 0;
        g = c;
        b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return `\x1b[38;2;${r};${g};${b}m`;
}

export function table(ns: NS, data: string[][], colours: string[][]): void {
    let maxItemAmounts: number[] = data.map(arr => arr.length);
    let maxLength = Math.max(...maxItemAmounts);
    for (let i = 0; i < data.length; i++) {
        while (data[i].length < maxLength) {
            data[i].push("");
        }
    }

    const h = "─";
    const dt = "┬";
    const ut = "┴";
    const v = "│";
    const ld = "┐";
    const lu = "┘";
    const ur = "┌";
    const ud = "└";
    let maxes: number[] = [];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (maxes.length <= j) maxes.push(0);
            maxes[j] = Math.max(maxes[j], data[i][j].length);
        }
    }
    let upString: string = ur;
    for (let max of maxes.slice(0,-1)) {
        upString += h.repeat(max);
        upString += dt;
    }
    upString += h.repeat(maxes[maxes.length - 1]);
    upString += ld;
    ns.print(upString);
    for (let i = 0; i < data.length; i++) { // each column
        let column = v;
        for (let j = 0; j < data[i].length; j++) {  // each row
            let colour = colours[i % colours.length][j % colours[i % colours.length].length];
            let string = colour + data[i][j] + reset;
            column += string;
            column += " ".repeat(maxes[j] - data[i][j].length);
            column += v;
        }
        ns.print(column);
    }
    let downString: string = ud;
    for (let max of maxes.slice(0,-1)) {
        downString += h.repeat(max);
        downString += ut;
    }
    downString += h.repeat(maxes[maxes.length - 1]);
    downString += lu;
    ns.print(downString);
}