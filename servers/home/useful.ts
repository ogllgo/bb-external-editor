import { NS, Person } from "@/NetscriptDefinitions";
import { bnNums } from "./consts";

export function scan(ns: NS): string[] {
    
    let servs = ["home", ...ns.scan("home")];
    for (let i = 1; i < servs.length; i++) {
        servs.push(...ns.scan(servs[i]).slice(1));
    }
    return servs;
}

/**
 * @param key - What to sort the values by
 * @param data - What data should be sorted by key
 * @returns data sorted by the values in key
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

export function fixPlayerSkills(player: Person): Person {
    function calculateSkill(exp: number, mult = 1): number {
        const value = Math.floor(mult * (32 * Math.log(exp + 534.6) - 200));
        return Math.max(value, 1);
    }
    player.skills.hacking = calculateSkill(player.exp.hacking, player.mults.hacking);
    player.skills.agility = calculateSkill(player.exp.agility, player.mults.agility);
    player.skills.charisma = calculateSkill(player.exp.charisma, player.mults.charisma);
    player.skills.defense = calculateSkill(player.exp.defense, player.mults.defense);
    player.skills.strength = calculateSkill(player.exp.strength, player.mults.strength);
    player.skills.dexterity = calculateSkill(player.exp.dexterity, player.mults.dexterity);
    player.skills.intelligence = calculateSkill(player.exp.intelligence);
    return player;
}

export function evaluateServer(server: string, ns: NS): number {
    if (ns.getHackingLevel() + 2 < ns.getServerRequiredHackingLevel(server)) return 0;
    let levelFactor = Math.log2(ns.getHackingLevel() - ns.getServerRequiredHackingLevel(server) + 2);
    let timeFactor = ns.getWeakenTime(server) / 10;
    let moneyFactor = ns.getServerMaxMoney(server) / 2;
    return ns.getServerMaxMoney(server) === 0 ? 0 : ns.getServerMoneyAvailable(server) / (levelFactor + timeFactor + moneyFactor);
}

export function chooseServer(ns: NS, servers: string[] = scan(ns)): string {
    let values = servers.map(serv => evaluateServer(serv, ns));
    return Math.max(...values) > 0 ? servers[values.indexOf(Math.max(...values))] : "joesguns";
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