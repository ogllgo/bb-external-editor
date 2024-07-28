import { NS, Server, Person } from "@/NetscriptDefinitions";
import { fixPlayerSkills } from "./useful";

const max = Math.max;
const min = Math.min;

export async function main(ns: NS) {
    ns.write("share/hack.js", `// this was made automatically
/** @param {NS} ns */
export async function main(ns) {
  await ns.hack(ns.args[0], {additionalMsec: ns.args[1] ?? 0})
}`, "w");
    ns.write("share/grow.js", `// this was made automatically
/** @param {NS} ns */
export async function main(ns) {
  await ns.grow(ns.args[0], {additionalMsec: ns.args[1] ?? 0})
}`, "w");
    ns.write("share/weak.js", `// this was made automatically
/** @param {NS} ns */
export async function main(ns) {
  await ns.weaken(ns.args[0], {additionalMsec: ns.args[1] ?? 0})
}`, "w");
    ns.tprint("ok this is gonna be hell");
    // pick a server
    // to hack it, it needs full money and no security, and gets rid of money
    // to increase money, it needs no security
    // doing either of these increases security
    // so like
    // <-----> hack
    // <------> grow
    // <-------> weaken
    // but how would you cycle up the next set
    // like
    // <-----> hack
    // <------> grow
    // <-------> weaken
    ///////////////////
    // <--------> hack
    // <---------> grow
    // <----------> weaken
    // right now, the goal is that we get a single cycle of hack/grow/weak
    

}
// so we want to hack enough money to take ~25% [0.25]
// then grow enough to bring it back to full
// then weaken enough to bring security back
function getThreadsForOneCycle(server: Server, player: Person, ns: NS) {

    let hackEffect: number = ns.formulas.hacking.hackPercent(server, player);
    let expChange: number = ns.formulas.hacking.hackExp(server, player);
    let hackThreads: number = Math.ceil(0.25 / hackEffect);
    server.hackDifficulty = min(server.hackDifficulty + 0.002 * hackThreads, 99);
    player.exp.hacking += expChange * hackThreads;
    server.moneyAvailable -= hackEffect * hackThreads;
    player = fixPlayerSkills(player);

    let growThreads: number = ns.formulas.hacking.growThreads(server, player, server.moneyMax);
    let growEffect: number = ns.formulas.hacking.growAmount(server, player, growThreads);
    expChange = ns.formulas.hacking.hackExp(server, player);
    player.exp.hacking += expChange * growThreads;
    server.moneyAvailable += growThreads * growEffect;
    server.hackDifficulty = min(server.hackDifficulty + 1)
}

