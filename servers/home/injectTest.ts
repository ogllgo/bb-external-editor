import { NS } from "@/NetscriptDefinitions";

async function terminalCommand(inputValue: string) {
    const doc = eval("document");
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

function makeServerElement(server: string, ns: NS) {
    
    const serverText = eval("document").createElement("div");
    serverText.textContent = server;
    serverText.style.fontSize = eval("window").getComputedStyle(eval("document").querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-size') - 1;
    serverText.style.fontFamily = eval("window").getComputedStyle(eval("document").querySelector(`.MuiTypography-root.MuiTypography-h6[title="injectTest.js "]`)).getPropertyValue('font-family');
    serverText.style.color = "red";
    serverText.addEventListener("click", async function () {
        await connect(server, ns);
    });
    return serverText;
}

export async function main(ns: NS) {
    ns.disableLog("asleep");
    ns.disableLog("scan");
    ns.tprint("closing tails");
    // clear tail windows
    [...eval("document").querySelectorAll(`.MuiTypography-root.MuiTypography-h6[title="${ns.getScriptName()} "]`)].map(ele => ele.parentElement.children[1].children[2]).forEach(ele => ele.click());
    // get tail window
    const tailWindow = eval("document").querySelector(`.MuiTypography-root.MuiTypography-h6[title="${ns.getScriptName()} "]`).parentElement.parentElement.children[1];

    ns.tail();
    const n00dles = makeServerElement("n00dles", ns);
    tailWindow.appendChild(n00dles);
    while (true) {
        await ns.asleep(1);
    }
}