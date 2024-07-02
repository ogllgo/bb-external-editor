import { NS } from "@/NetscriptDefinitions";

export async function main(ns: NS) {
    let key = [1, 2, 65, 765, 245];
    let data1 = ["23", "ab", "bcc", "nhfg", "234"];
    let data2 = [999, 234, 590345, 4359, 12];
    bblSortMany(key, [data1, data2]);
}

export function scan(ns: NS): string[] {
    
    let servs = ["home", ...ns.scan("home")];
    for (let i = 1; i < servs.length; i++) {
        servs.push(...ns.scan(servs[i]).slice(1));
    }
    return servs;
}

/**
 * @param T - PASS IN THE TYPE OF DATA
 * @param key - What to sort the values by
 * @param data - What data should be sorted by key
 * @returns key and data sorted by the values in key
 */
export function bblSortMany<T extends unknown[]>(key: number[], data: T[]): T[] {

    for (let i = 0; i < key.length; i++) {
        for (let j = 0; j < (key.length - i - 1); j++) {

            if (key[j] > key[j + 1]) {
                
                [key[j], key[j+1]] = [key[j+1], key[j]];

                for (let k = 0; k < data.length; k++) {
                    const currentArr = data[k];
                
                    [currentArr[j], currentArr[j+1]] = [currentArr[j+1], currentArr[j]];
                }
            }
        }
    }
    return [...data];
}

export function evaluateServer(server: string, ns: NS): number {
    if (ns.fileExists("files/servers.txt")) {
        if (!JSON.parse(ns.read("files/servers.txt")).includes(server)) {
            return 0;
        }
    }
    if (ns.getHackingLevel() + 2 < ns.getServerRequiredHackingLevel(server)) return 0;
    let levelFactor = Math.log2(ns.getHackingLevel() - ns.getServerRequiredHackingLevel(server) + 2);
    let timeFactor = ns.getWeakenTime(server) / 10;
    let moneyFactor = ns.getServerMaxMoney(server) / 2;
    return ns.getServerMoneyAvailable(server) / (levelFactor + timeFactor + moneyFactor);
}

export function chooseServer(servers: string[], ns: NS) {
    let values = servers.map(serv => evaluateServer(serv, ns));
    return servers[values.indexOf(Math.max(...values))];
}

export async function makeServerFile(ns: NS) {
    ns.write("files/servers.txt", JSON.stringify(scan(ns)), "w");
}