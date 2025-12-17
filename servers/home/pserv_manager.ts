import { getUsableMoney, getSetting } from "./utils";

export async function main(ns: NS) {
  let prefix: string | null = null;
  if (ns.getPurchasedServers().length !== ns.getPurchasedServerLimit()) {
    let input: string;
    const setting = getSetting(ns, "pserv_prefix");
    if (setting === null && ns.fileExists("settings.json")) {
      ns.tprint("Bad prefix in settings.json, or no 'pserv_prefix' key in settings.json, falling back to 'pserv' as defualt");
    } else {
      prefix = setting;
    }
    if (prefix)
      input = (await ns.prompt(`Purchased server prefix (e.g., 'pserv' results in 'pserv-20'). Leave blank to go with default of '${prefix}'`, { type: "text" })).toString();
    else
      input = (await ns.prompt("Purchased server prefix (e.g., 'pserv' results in 'pserv-20'). Leave blank to go with default of 'pserv'", { type: "text" })).toString();

    prefix = input || prefix || "pserv";
  } else if (ns.getPurchasedServers().every(serv => ns.getServerMaxRam(serv) === ns.getPurchasedServerMaxRam())) {
    ns.tprint("You have every purchased server maxxed already!");
    return;
  }
  while (ns.getPurchasedServers().length !== ns.getPurchasedServerLimit() || !ns.getPurchasedServers().every(serv => ns.getServerMaxRam(serv) === ns.getPurchasedServerMaxRam())) {
    let softcap = Math.min(...ns.getPurchasedServers().map(serv => ns.getServerMaxRam(serv))) * 4;
    while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit() && getUsableMoney(ns) >= ns.getPurchasedServerCost(2)) {
      ns.purchaseServer(`${prefix}-${ns.getPurchasedServers().length}`, 2);
    }

    for (const serv of ns.getPurchasedServers()) {
      let maxram = ns.getServerMaxRam(serv);
      if (maxram === ns.getPurchasedServerMaxRam()) continue;
      while (maxram * 2 < softcap && maxram < ns.getPurchasedServerMaxRam() && getUsableMoney(ns) >= ns.getPurchasedServerUpgradeCost(serv, maxram * 2)) {
        ns.upgradePurchasedServer(serv, maxram * 2);
        maxram *= 2;
      }
    }
    await ns.sleep(300);
  }
}
