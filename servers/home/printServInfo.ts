import { NS } from "@/NetscriptDefinitions";
import { table, fgGreen, fgRed, fgCyan, getColor } from "./printStyle";
import { backdoor, bblSortMany, evaluateServer, openPorts, scan, hasNode } from "./useful";

export async function main(ns: NS) {
    ns.tail();
    ns.disableLog("ALL");
    let thrownBD: string[] = [];
    while (true) {
        let servers = scan(ns);
        servers = bblSortMany(servers.map(serv => evaluateServer(serv, ns)), [servers])[0].filter(serv => ns.getServerMaxMoney(serv) !== 0).toReversed().slice(0, Math.min(48, servers.filter(server => ns.getServerMaxMoney(server) !== 0).length));
        let headers: string[][] = [["Server", "Money", "Security", "Ports", "Backdoored", "Ram"]];
        let headerColours: string[][] = [[fgCyan]];
        let data: string[][] = [];
        let colours: string[][] = [];
        for (let i = 0; i < servers.length; i++) {
            while (data.length <= i) data.push([]);
            while (colours.length <= i) colours.push([]);
            const server = servers[i];
            if (openPorts(server, ns) >= ns.getServerNumPortsRequired(server) && ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() && !thrownBD.includes(server)) backdoor(server, ns);
            if ((hasNode(4, ns) && openPorts(server, ns) >= ns.getServerNumPortsRequired(server) && ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() && !thrownBD.includes(server)) || (!hasNode(4, ns) && ns.getServer(server).backdoorInstalled && !thrownBD.includes(server))) thrownBD.push(server);

            data[i].push(server);
            colours[i].push(fgGreen);
            data[i].push(`${ns.formatNumber(ns.getServerMoneyAvailable(server), 1)} / ${ns.formatNumber(ns.getServerMaxMoney(server), 1)} (${ns.formatPercent(Number.isNaN(ns.getServerMaxMoney(server) / ns.getServerMoneyAvailable(server)) ? 0 : ns.getServerMoneyAvailable(server) / ns.getServerMaxMoney(server))})`);
            colours[i].push(getColor(0, ns.getServerMaxMoney(server), ns.getServerMoneyAvailable(server), false));
            data[i].push(`${ns.formatNumber(ns.getServerSecurityLevel(server), 1)} / ${ns.formatNumber(ns.getServerMinSecurityLevel(server), 1)} (${ns.formatPercent(Number.isNaN(ns.getServerSecurityLevel(server) / ns.getServerMinSecurityLevel(server)) || ns.getServerMaxMoney(server) === 0 ? 0 : ns.getServerSecurityLevel(server) / ns.getServerMinSecurityLevel(server))})`);
            colours[i].push(getColor(ns.getServerMinSecurityLevel(server), 99, ns.getServerSecurityLevel(server), false));
            data[i].push(`${openPorts(server, ns)} / ${ns.getServerNumPortsRequired(server)}`);
            colours[i].push(getColor(0, ns.getServerNumPortsRequired(server), ns.getServerNumPortsRequired(server) - openPorts(server, ns), false));
            data[i].push(`${thrownBD.indexOf(server) !== -1 ? "YES" : "NO"}`);
            colours[i].push(ns.getServer(server).backdoorInstalled ? fgGreen : fgRed);
            data[i].push(`${ns.formatRam(ns.getServerUsedRam(server))} / ${ns.formatRam(ns.getServerMaxRam(server))}`);
            colours[i].push(getColor(0, ns.getServerMaxRam(server), ns.getServerUsedRam(server), false));
        }
        table(ns, headers.concat(data), headerColours.concat(colours));
        ns.clearLog();
        await ns.sleep(10);
    }
}