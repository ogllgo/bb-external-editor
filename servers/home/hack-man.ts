import { NS } from "@/NetscriptDefinitions";

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
    
}