import { Server } from "@/NetscriptDefinitions";
import { getAllServers, getBestServer, getRemainingDifficulty, getRemainingRam, getSetting, hasAccess } from "./utils";

const HACK_SEC_INCREASE = 0.002;
const GROW_SEC_INCREASE = 0.004;
const WEAKEN_SEC_DECREASE = 0.05;
type ServerBatch = {
  hack: number;
  grow: number;
  weak: number;
}

function calculateBatch(ns: NS, target: string, serversToUse: string[]): Record<string, ServerBatch> {
  const s1 = serversToUse[0];
  return {
    s1: {
      hack: 0,
      grow: 0,
      weak: 0
    }
  };
}
export async function main(ns: NS) {
  // 1. find target
  let target = ns.getServer(getSetting(ns, "hack_target") ?? getBestServer(ns));

  // 2. prep
  // 2.a. w1
  while (target.hackDifficulty! > target.minDifficulty!) {
    let weakThreads = Math.ceil(getRemainingDifficulty(target) * (1 / WEAKEN_SEC_DECREASE));
    for (const serv of getAllServers(ns)) {
      let so: Server;
      let threads: number;
      let launchThreads: number;
      if (!hasAccess(ns, serv)) continue;

      so = ns.getServer(serv);
      threads = Math.floor(getRemainingRam(ns, so) / 1.75);
      if (threads <= 0) continue;

      launchThreads = Math.min(threads, weakThreads);
      ns.exec("shared/weak.js", serv, launchThreads, target.hostname);

      weakThreads -= launchThreads;
      target.hackDifficulty = Math.max(target.minDifficulty!, target.hackDifficulty! - launchThreads * WEAKEN_SEC_DECREASE);
      if (weakThreads <= 0) break;
    }
    if (target.hackDifficulty! > target.minDifficulty!) {
      await ns.sleep(ns.getWeakenTime(target.hostname));
    }
  }
  
  // 2.b. g
  ns.growthAnalyze()
  // 2.c. w2
  while (target.hackDifficulty! > target.minDifficulty!) {
    let weakThreads = Math.ceil(getRemainingDifficulty(target) * (1 / WEAKEN_SEC_DECREASE));
    for (const serv of getAllServers(ns)) {
      let so: Server;
      let threads: number;
      let launchThreads: number;
      if (!hasAccess(ns, serv)) continue;

      so = ns.getServer(serv);
      threads = Math.floor(getRemainingRam(ns, so) / 1.75);
      if (threads <= 0) continue;

      launchThreads = Math.min(threads, weakThreads);
      ns.exec("shared/weak.js", serv, launchThreads, target.hostname);

      weakThreads -= launchThreads;
      target.hackDifficulty = Math.max(target.minDifficulty!, target.hackDifficulty! - launchThreads * WEAKEN_SEC_DECREASE);
      if (weakThreads <= 0) break;
    }
    if (target.hackDifficulty! > target.minDifficulty!) {
      await ns.sleep(ns.getWeakenTime(target.hostname));
    }
  }

  // loop forever:
    // 3. calculate batches
    // 4. launch batches
    // 5. wait for all batches to end
}
