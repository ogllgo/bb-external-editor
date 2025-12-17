import { Server } from "@/NetscriptDefinitions";

export function getAllServers(ns: NS) {
  let servs = ["home", ...ns.scan("home")];
  for (let i = 1; i < servs.length; i++) {
    servs.push(...ns.scan(servs[i]).slice(1));
  }
  return servs;
}

export function hasAccess(ns: NS, serv: string): boolean {
  if (ns.hasRootAccess(serv)) return true;

  ns.brutessh(serv);
  ns.ftpcrack(serv);
  ns.relaysmtp(serv);
  ns.httpworm(serv);
  ns.sqlinject(serv);

  return ns.nuke(serv);
}


export function clamp(n: number, min: number = -Number.MAX_VALUE, max: number = Number.MAX_VALUE) {
  return Math.min(Math.max(n, min), max);
}

export function roundPrecision(n: number, d: number) {
  return Math.round(n * 10 ** d) / 10 ** d;
}

/**
 * Returns the remaining difficulty of a server - that is, its min difficulty subtracted from its hack difficulty
 */
export const getRemainingDifficulty = (server: Server): number => server.hackDifficulty! - server.minDifficulty!;

/**
 * Returns the remaining ram on a server, accounting for ram reservations on specific servers
 */
export const getRemainingRam = (ns: NS, server: Server): number => {
  if (ns.fileExists("settings.json")) {
    const json = JSON.parse(ns.read("settings.json"));
    return server.hostname === "home" ? server.maxRam - server.ramUsed - json.home_reserved_ram : server.maxRam - server.ramUsed;
  }
  return server.maxRam - server.ramUsed;
}

/**
 * Returns the amount of usable money on home, computed by
 * using whatever reserves more money, the fractional or absolute reservations in settings.json
 */
export const getUsableMoney = (ns: NS): number => {
  const homeMoney = ns.getServer("home").moneyAvailable!;
  const reserved_money: number = getSetting(ns, "home_reserved_money") ?? 0;
  return homeMoney - reserved_money;
};

type Settings = {
  home_reserved_money: number;
  home_reserved_ram: number;
  hack_target: string;
  pserv_prefix: string;
}
export const getSetting = <K extends keyof Settings>(ns: NS, key: K, filePath?: string): Settings[K] | null => {
  if (!ns.fileExists(filePath || "settings.json")) {
    return null;
  }
  try {
    const json = JSON.parse(ns.read(filePath || "settings.json"));
    return json[key];
  } catch {
    return null;
  }
}

export function rankServer(ns: NS, server: string): number {
  if (server.startsWith("hacknet-node")) return 0;
  if (!hasAccess(ns, server)) return 0;
  let po = ns.getPlayer();
  let so = ns.getServer(server);

  if (so.requiredHackingSkill! > po.skills.hacking) return 0;

  so.hackDifficulty = so.minDifficulty;

  let weight: number;
  if (ns.fileExists("Formulas.exe")) {
    weight = so.moneyMax! / ns.formulas.hacking.weakenTime(so, po) * ns.formulas.hacking.hackChance(so, po);
  } else {
    if (so.requiredHackingSkill! > po.skills.hacking / 2)
      return 0;
    weight = so.moneyMax! / so.minDifficulty!;
  }
  return weight;
}
export function getBestServer(ns: NS) {
  const [target] = getAllServers(ns).reduce(
    ([bestServer, bestRank], s): [string, number] => {
      const r = rankServer(ns, s);
      return r > bestRank ? [s, r] : [bestServer, bestRank];
    },
    ["", -Infinity]
  );
  return target;
}