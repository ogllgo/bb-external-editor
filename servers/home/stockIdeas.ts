import { NS } from "@/NetscriptDefinitions";
import { bblSortMany } from "./useful";
import { fgGreen, fgRed, fgCyan, reset } from "./printStyle";
type stock = {
    estimatedForecast: number,   // the direction the stock changes in (0: 100% negative, 1: 100% positive, 0.5: 50/50, 0.75: 75% positive)
    estimatedVolatility: number, // how much the stock will change     (0: no change, 1: 0-100% change, Math.random() * vola)
    symbol: string,              // the stock's name
}

type forecastHistory = {sym: string, mood: -1|0|1|2}[][];
type volatilityHistory = {sym: string, value: number}[][];

const maxHistoryLength = 30;
export async function main(ns: NS) {
    let costHistory: number[][] = [];
    let stockForecastHistory: forecastHistory = [];
    let stockVolatilityHistory: volatilityHistory = [];
    for (let j = 0;; j++) {
        costHistory.push(await nextStockTick(ns));
        if (costHistory.length > maxHistoryLength) costHistory = costHistory.slice(1);
        ns.tprint(`CYCLE ${j}:`);
        stockForecastHistory.push([]);
        stockVolatilityHistory.push([]);
        for (let i = 0; i < costHistory[0].length; i++) {
            const forecastMood = j === 0 ? -1 : costHistory[j][i] === costHistory[j - 1][i] ? 0 : costHistory[j][i] > costHistory[j - 1][i] ? 1 : 2;
            const volatilityMood = j === 0 ? -1 : costHistory[j][i] === costHistory[j - 1][i] ? 0 : Math.abs((costHistory[j][i] - costHistory[j - 1][i]) / costHistory[j][i]);
            stockVolatilityHistory[stockVolatilityHistory.length - 1].push({sym: ns.stock.getSymbols()[i], value: volatilityMood});
            stockForecastHistory[stockForecastHistory.length - 1].push({sym: ns.stock.getSymbols()[i], mood: forecastMood});
            ns.tprintf(`  ${ns.stock.getSymbols()[i]}: ${ns.formatNumber(costHistory[j][i])}, ${j == 0 ? `${fgCyan}→${reset}` : costHistory[j - 1][i] == costHistory[j][i] ? `${fgCyan}→${reset}` : costHistory[j - 1][i] > costHistory[j][i] ? `${fgRed}↓${reset}` : `${fgGreen}↑${reset}`}`);
        }
        if (detectFlip(stockForecastHistory)) {
            stockForecastHistory = [];
            stockVolatilityHistory = [];
        }
        if (stockForecastHistory.length >= 30 && stockForecastHistory[0][0].mood !== -1) {
            const stocks: stock[] = rankStocks(historiesToValues(stockForecastHistory, stockVolatilityHistory));
            ns.tprint(`Our top 5 stocks are: `);
            for (let i = 4; i >= 0; i++) ns.tprint(`${i + 1}: ${stocks[i].symbol}`)
        }
    }
}

function historiesToValues(forecast: forecastHistory, volatility: volatilityHistory): stock[] {
    let stocks: (stock)[] = [];
    for (let i = 0; i < volatility.length; i++) {
        if (stocks.length === i) stocks.push({estimatedForecast: 0, estimatedVolatility: 0, symbol: ""});
        let m = 0;
        let k = 0;
        for (let j = 0; j < volatility[i].length; j++) {
            m = Math.max(m, volatility[i][k].value);
            k = Math.max(k, j);
        }
        stocks[i].estimatedVolatility = m + m/k - 0; 
        // https://en.wikipedia.org/wiki/German_tank_problem
        // The normal formula is m+m/k+1, but the 1 is meant to be the lowest possible value.
        // We know that the lowest [theoretical] value is 0, so we subtract 0. With any luck,
        // something will go "hey.. that does nothing!" and skip it.

        let success = 0;
        for (let j = 0; j < forecast[i].length; j++) {
            success += forecast[i][j].mood - 1;
        }
        stocks[i].estimatedForecast = success / forecast.length;
    }
    return stocks;
}

function detectFlip(forecast: forecastHistory) {
    for (let i = 0; i < forecast.length; i++) {
        let profile: number = 0;
        for (let j = 1; j < forecast[i].length; j++) {
            profile += forecast[i][j].mood - 1;
            if ((j - 1) / profile) {
                console.log('AHHHH');
            }
        }
    }
    return false;
}

async function nextStockTick(ns: NS): Promise<number[]> {
    let prevTick = ns.stock.getAskPrice(ns.stock.getSymbols()[0]);
    while (prevTick === ns.stock.getAskPrice(ns.stock.getSymbols()[0])) {
        prevTick = ns.stock.getAskPrice(ns.stock.getSymbols()[0]);
        await ns.sleep(10);
    }
    let stockMoneys: number[] = [];
    for (const stock of ns.stock.getSymbols()) stockMoneys.push(ns.stock.getAskPrice(stock));
    return stockMoneys;
}

/**
 * 
 * @param stocks An array of stocks to compare
 * @param canShort Boolean to see if you can short stocks
 * @returns the array stocks sorted by their value
*/
function rankStocks(stocks: stock[], canShort: boolean = false): stock[] {
    let stockValues: number[] = [];
    for (let i = 0; i < stocks.length; i++) {
        let long = true;
        let forecast = 0.5 - stocks[i].estimatedForecast;
        if (canShort) {
            forecast = Math.abs(forecast); 
            long = false;
        }
        const volatility = stocks[i].estimatedVolatility;
        stockValues.push(forecast <= 0 ? 0 : forecast * volatility);
    }
    return bblSortMany(stockValues, [stocks])[1];
}
// if it's just flipped:
// measure to see if positive/not
// pick stocks that are most best

// if it's flipped a while ago:
// pick stocks that are most best

// if it's gonna flip soon:
// let stuff be

// how to pick the besterest stock:
// 