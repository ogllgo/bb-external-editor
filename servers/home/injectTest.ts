import { NS } from "@/NetscriptDefinitions";
import { evaluateServer, scan } from "./useful";
import { backdoor, openPorts, bblSortMany, hasNode } from "./useful";
import { getColor } from "./printStyle";
const doc = eval("document");
const win = eval("window");
async function terminalCommand(inputValue: string) {
    [...doc.querySelectorAll('.MuiButtonBase-root.MuiListItem-root.MuiListItem-gutters.MuiListItem-padding.MuiListItem-button')].slice(2)[0].click();
    const terminal = doc.getElementById("terminal-input");
    terminal.value = inputValue;
    terminal[Object.keys(terminal)[1]].onChange({ target: terminal });
    terminal.focus();
    await terminal[Object.keys(terminal)[1]].onKeyDown({ key: 'Enter', preventDefault: () => 0 });
}

async function connect(server: string, ns: NS) {
    let servers: string[] = [server];
    let toScan = server;
    if (server === "home") {
        await terminalCommand("home");
    }
    while (ns.scan(toScan)[0] !== "home") {
        servers.push(ns.scan(toScan)[0]);
        toScan = ns.scan(toScan)[0];
    }
    servers.push("home");
    servers.reverse();
    if (servers.length === 0) {
        return;
    }
    let command = "connect " + servers[0];
    for (let i = 1; i < servers.length; i++)
        command += "; connect " + servers[i];
    await terminalCommand(command);
}

function makeServerElement(server: string, ns: NS): HTMLElement {
    
    const serverText: HTMLElement = doc.createElement("div");
    serverText.style.fontSize = (parseInt(win.getComputedStyle(doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-size'), 10) - 5) + "px";
    serverText.style.fontFamily = win.getComputedStyle(doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-family');
    serverText.style.color = "green";
    serverText.textContent = server;
    serverText.classList.add('server-element');
    return serverText;
}
type ServerData = {
    money: number,
    maxMoney: number,

    security: number,
    minSecurity: number,
    
    portsOpen: number,
    portsTotal: number,

    backdoored: boolean,

    ramUsed: number,
    ramTotal: number,
}

async function manRoot(server: string, ns: NS) {
    await connect(server, ns);
    let openedPorts: string[] = []
    if (ns.fileExists("brutessh.exe"))  {await terminalCommand("brutessh.exe");  openedPorts.push("brutessh");  } 
    if (ns.fileExists("ftpcrack.exe"))  {await terminalCommand("ftpcrack.exe");  openedPorts.push("ftpcrack");  } 
    if (ns.fileExists("relaysmtp.exe")) {await terminalCommand("relaysmtp.exe"); openedPorts.push("relaysmtp"); } 
    if (ns.fileExists("httpworm.exe"))  {await terminalCommand("httpworm.exe");  openedPorts.push("httpworm");  } 
    if (ns.fileExists("sqlinject.exe")) {await terminalCommand("sqlinject.exe"); openedPorts.push("sqlinject"); } 
    if (openedPorts.length > ns.getServerNumPortsRequired(server)) {
        await terminalCommand("nuke.exe");
    }
    await terminalCommand("clear");
    ns.tprintRaw(`Connecting: ${server}`);
    for (const method of openedPorts) {
        ns.tprintRaw(`Opening port with ${method}.exe`);
    }
}

function makeHTMLTable(servers: Element[], data: ServerData[], ns: NS, backdoorServers: string[] | undefined = undefined): Element {
    const table: HTMLElement = doc.createElement('table');
    table.style.width = "800px";
    const headerRow = doc.createElement('tr');
    headerRow.innerHTML = '<th>Server</th><th>Security</th><th>Money</th><th>Ports   </th><th>Backdoor</th>';
    headerRow.style.color = 'rgb(0, 255, 255)'
    headerRow.style.fontSize = (parseInt(win.getComputedStyle(doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-size'), 10) - 5) + "px";
    headerRow.style.fontFamily = win.getComputedStyle(doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-family');
    table.appendChild(headerRow);
    
    const tbody = doc.createElement("tbody");
    servers.forEach((server, index) => {
        const row = doc.createElement("tr");

        const serverCell: Element = doc.createElement("td");
        const clonedServer = server.cloneNode(true) as HTMLElement;
        serverCell.appendChild(clonedServer);
        serverCell.addEventListener('click', async function() {
            manRoot(server.textContent, ns);
        });
        row.appendChild(serverCell);

        const securityCell: HTMLElement = doc.createElement("td");
        const securityString = `${data[index].security} / ${data[index].minSecurity} (${ns.formatPercent(data[index].security / data[index].minSecurity)})`;
        const securityColour = getColor(data[index].minSecurity, 4 * data[index].minSecurity, data[index].security, true);
        securityCell.style.fontSize = (parseInt(win.getComputedStyle(doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-size'), 10) - 5) + "px";
        securityCell.style.fontFamily = win.getComputedStyle(doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-family');
        securityCell.style.color = `rgb(${securityColour.red}, ${securityColour.green}, ${securityColour.blue})`;
        securityCell.textContent = securityString;
        row.appendChild(securityCell);

        const moneyCell: HTMLElement = doc.createElement("td");
        const moneyString = `${ns.formatNumber(data[index].money)} / ${ns.formatNumber(data[index].maxMoney)} (${ns.formatPercent(data[index].money / data[index].maxMoney)})`;
        const moneyColour = getColor(0, data[index].maxMoney, data[index].maxMoney - data[index].money, true);
        moneyCell.style.fontSize = (parseInt(win.getComputedStyle(doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-size'), 10) - 5) + "px";
        moneyCell.style.fontFamily = win.getComputedStyle(doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-family');
        moneyCell.style.color = `rgb(${moneyColour.red}, ${ moneyColour.green}, ${moneyColour.blue})`;
        moneyCell.textContent = moneyString;
        row.appendChild(moneyCell);

        const portCell: HTMLElement = doc.createElement("td");
        const portString = `${data[index].portsOpen} / ${data[index].portsTotal}`;
        const portColour = getColor(0, data[index].portsTotal, data[index].portsTotal - data[index].portsOpen, true);
        portCell.style.fontSize = (parseInt(win.getComputedStyle(doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-size'), 10) - 5) + "px";
        portCell.style.fontFamily = win.getComputedStyle(doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-family');
        portCell.style.color = `rgb(${portColour.red}, ${ portColour.green}, ${portColour.blue})`;
        if (data[index].portsTotal === 0) {
            portCell.style.color = "cyan";
        }
        portCell.textContent = portString;
        row.appendChild(portCell);


        const backdoorCell: HTMLElement = doc.createElement("td");
        const backdoorString = data[index].backdoored ? "YES" : "NO";
        let backdoorColour = data[index].backdoored ? {red: 0, green: 235, blue: 20} : {red: 235, green: 20, blue: 0};
        backdoorCell.style.fontSize = (parseInt(win.getComputedStyle(doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-size'), 10) - 5) + "px";
        backdoorCell.style.fontFamily = win.getComputedStyle(doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-family');
        if (!hasNode(4, ns) && backdoorServers !== undefined) {
            backdoorColour = {red: 100, green: 100, blue: 100};
        }
        backdoorCell.style.color = `rgb(${backdoorColour.red}, ${backdoorColour.green}, ${backdoorColour.blue})`;
        backdoorCell.textContent = backdoorString;
        backdoorCell.onclick = async function() {
            if (ns.getServer(server.textContent).backdoorInstalled || (!hasNode(4, ns) && backdoorServers !== undefined)) return;
            if (hasNode(4, ns)) {
                backdoor(server.textContent, ns);
                return;
            }
            await connect(server.textContent, ns);
            await terminalCommand("brutessh.exe; ftpcrack.exe; relaysmtp.exe; httpworm.exe; sqlinject.exe; nuke.exe; backdoor");
        };
        row.appendChild(backdoorCell);

        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    table.style.borderColor = "red";
    return table;
}

function makeServerData(servers: string[], ns: NS): ServerData[] {
    const data: ServerData[] = [];
    for (const server of servers) {
        data.push({
            money: ns.getServerMoneyAvailable(server),
            maxMoney: ns.getServerMaxMoney(server),
            security: ns.getServerSecurityLevel(server),
            minSecurity: ns.getServerMinSecurityLevel(server),
            portsOpen: openPorts(server, ns),
            portsTotal: ns.getServerNumPortsRequired(server),
            backdoored: ns.getServer(server).backdoorInstalled,
            ramUsed: ns.getServerUsedRam(server),
            ramTotal: ns.getServerMaxRam(server)
        });
    }
    return data;
}

export async function main(ns: NS) {
    const factionServers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "w0r1d_d43m0n", "fulcrumassets"];
    ns.disableLog("ALL");
    ns.clearLog();
    [...doc.querySelectorAll(`.MuiTypography-root.MuiTypography-h6[title="${ns.getScriptName()} "]`)].map(ele => ele.parentElement.children[1].children[2]).forEach(ele => ele.click());
    ns.tail();
    const tailWindow: Element = doc.querySelector(`.MuiTypography-root.MuiTypography-h6[title="${ns.getScriptName()} "]`).parentElement.parentElement.children[1];
    let counter = 0;
    while (counter !== -1) {
        counter++;
        if (doc.getElementById("DrawTable")) {
            doc.getElementById("DrawTable").remove();
        }
        let servers: Element[] = [];
        let textServers = scan(ns).filter(serv => !factionServers.includes(serv) && ns.getServerMaxMoney(serv) !== 0);
        textServers = bblSortMany(textServers.map(serv => evaluateServer(serv, ns)), [textServers])[0].slice(10).toReversed();
        for (const stringServer of textServers) {
            servers.push(makeServerElement(stringServer, ns));
        }
        let bdServers: string[] = [];
        let bdTimes: number[] = [];
        for (const server of textServers) {
            if (openPorts(server, ns) >= ns.getServerNumPortsRequired(server) && ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() && !bdServers.includes(server)) {
                bdServers.push(server);
                bdTimes.push(Date.now() + ns.getHackTime(server));
            }
        }
        for (let i = 0; i < bdServers.length; i++) {
            if (bdTimes[i] < Date.now()) {
                bdServers.splice(i, 1);
                bdTimes.splice(i, 1);
                i--;
            }
        }
        const table = makeHTMLTable(servers, makeServerData(textServers, ns), ns);
        table.id = "DrawTable";
        tailWindow.appendChild(table);
        await ns.asleep(1000);
    }
}