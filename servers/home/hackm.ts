import { getAllServers, hasAccess, roundPrecision, getRemainingDifficulty, getRemainingRam, getSetting, getBestServer } from "./utils";
import { COLOR_RED, COLOR_GREEN, COLOR_YELLOW, COLOR_WHITE } from "./colors";
import { Server } from "@/NetscriptDefinitions";

export async function main(ns: NS) {
  let lastusedservers: number = 0;
  let timeSinceServerChange: number = 0;
  const servs: string[] = getAllServers(ns);
  let target: Server = ns.getServer(getSetting(ns, "hack_target") ?? getBestServer(ns));
  ns.disableLog("ALL");
  for (const serv of servs) {
    ns.scp(["shared/hack.js", "shared/weak.js", "shared/grow.js"], serv);
  }
  while (true) {
    let usedservers: number = 0;
    let mode: 0 | 1 | 2;

    let usableservs: string[] = [];
    let msg: string = COLOR_WHITE;

    ns.clearLog();

    if (timeSinceServerChange >= 5 * 60 * 1000) {
      target.hostname = getSetting(ns, "hack_target") ?? getBestServer(ns);
    }
    target = ns.getServer(target.hostname);


    msg += `${COLOR_GREEN}H: ${roundPrecision(ns.getHackTime(target.hostname), -2) / 1000}s `;
    msg += `${COLOR_YELLOW}G: ${roundPrecision(ns.getGrowTime(target.hostname), -2) / 1000}s `;
    msg += `${COLOR_RED}W: ${roundPrecision(ns.getWeakenTime(target.hostname), -2) / 1000}s\n`;

    msg += `${COLOR_WHITE}Targeting ${COLOR_GREEN}${target.hostname}${COLOR_WHITE}\n`;
    if (getRemainingDifficulty(target) > 0) {
      mode = 0;
    } else if (target.moneyAvailable! < target.moneyMax!) {
      mode = 1;
    } else {
      mode = 2;
    }

    if (getRemainingDifficulty(target) > 0) msg += COLOR_RED;
    else msg += COLOR_GREEN;
    msg += `${roundPrecision(target.hackDifficulty!, 2)}/${roundPrecision(target.minDifficulty!, 2)}${COLOR_WHITE} security\n`;

    if (target.moneyAvailable! < target.moneyMax!) msg += COLOR_RED;
    else msg += COLOR_GREEN;
    msg += `${roundPrecision(target.moneyAvailable!, -6) / 1e7}m\$/${roundPrecision(target.moneyMax!, -6) / 1e7}m\$${COLOR_WHITE} money\n`;

    for (const serv of servs) {
      if (hasAccess(ns, serv)) usableservs.push(serv);
    }

    msg += `${usableservs.length}/${servs.length} servers available\n`;

    // loop to hack
    for (const serv of usableservs) {
      const server = ns.getServer(serv);
      const MAX_SCRIPT_RAM = mode === 2 ? 1.7 : 1.75;
      let threads = Math.floor(getRemainingRam(ns, server) / MAX_SCRIPT_RAM);
      if (threads <= 0) continue;
      switch (mode) {
        case 0:
          ns.exec("shared/weak.js", serv, threads, target.hostname);
          break;
        case 1:
          ns.exec("shared/grow.js", serv, threads, target.hostname);
          break;
        case 2:
          ns.exec("shared/hack.js", serv, threads, target.hostname);
          break;
      }
      ++usedservers;
    }
    if (usedservers == 0) {
      if (lastusedservers != 0) {
        if (lastusedservers / usableservs.length > 0.9) msg += COLOR_GREEN;
        else msg += COLOR_YELLOW;

        msg += `${lastusedservers}${COLOR_WHITE} servers used in last cycle\n`;
      } else msg += `${COLOR_RED}0${COLOR_WHITE} servers used in last cycle\n`;
    } else {
      if (usedservers / usableservs.length > 0.9) msg += COLOR_GREEN;
      else msg += COLOR_YELLOW;

      msg += `${usedservers}${COLOR_WHITE} servers used in last cycle\n`;
      lastusedservers = usedservers;
    }

    timeSinceServerChange += 200;
    ns.print(msg);
    await ns.asleep(200);
  }
}
