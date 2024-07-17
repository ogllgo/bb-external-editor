import { NS } from "@/NetscriptDefinitions";
import { bnNums } from "./consts";

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
    if (ns.getHackingLevel() + 2 < ns.getServerRequiredHackingLevel(server)) return 0;
    let levelFactor = Math.log2(ns.getHackingLevel() - ns.getServerRequiredHackingLevel(server) + 2);
    let timeFactor = ns.getWeakenTime(server) / 10;
    let moneyFactor = ns.getServerMaxMoney(server) / 2;
    return ns.getServerMaxMoney(server) === 0 ? 0 : ns.getServerMoneyAvailable(server) / (levelFactor + timeFactor + moneyFactor);
}

export function chooseServer(servers: string[], ns: NS) {
    let values = servers.map(serv => evaluateServer(serv, ns));
    return servers[values.indexOf(Math.max(...values))];
}

export function openPorts(server: string, ns: NS): number {
    let portsReq = ns.getServerNumPortsRequired(server);
    let openedPorts = 0;
    if (ns.fileExists("brutessh.exe")) {
        ns.brutessh(server);
        openedPorts++;
    }
    if (ns.fileExists("ftpcrack.exe")) {
        ns.ftpcrack(server);
        openedPorts++;
    }
    if (ns.fileExists("relaysmtp.exe")) {
        ns.relaysmtp(server);
        openedPorts++;
    }
    if (ns.fileExists("httpworm.exe")) {
        ns.httpworm(server);
        openedPorts++;
    }
    if (ns.fileExists("sqlinject.exe")) {
        ns.sqlinject(server);
        openedPorts++;
    }
    if (openedPorts >= portsReq) {
        ns.nuke(server);
    }
    return openedPorts;
}

export function makeServerFile(ns: NS) {
    ns.write("files/servers.txt", JSON.stringify(scan(ns)), "w");
}

export function backdoor(server: string, ns: NS): boolean {
    if (ns.getServer(server).backdoorInstalled) {
        return true;
    }
    if (hasNode(4, ns)) {
        let path: string[] = [server];
        if (openPorts(server, ns) < ns.getServerNumPortsRequired(server) || ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()) {
            return false;
        }
        let toScan = server;
        while (ns.scan(toScan)[0] !== "home") {
            path.push(ns.scan(toScan)[0]);
            toScan = ns.scan(toScan)[0];
        }
        path.push("home");
        path.reverse();
        ns.write(`temp/backdoor${server}.js`, `
export async function main(ns) {
    for (const connection of ${JSON.stringify(path)}) {
        ns.singularity.connect(connection);
    }
    await ns.singularity.installBackdoor();
    ns.toast("Installed backdoor: ${server}");
    ns.singularity.connect("home");
}`, "w");
        ns.run(`temp/backdoor${server}.js`);
        return true;
    }
    return ns.getServer(server).backdoorInstalled;
}

export function hasNode(nodeNum: bnNums, ns: NS): boolean {
    return ns.getResetInfo().ownedSF.get(nodeNum) !== undefined || ns.getResetInfo().currentNode == nodeNum;
}