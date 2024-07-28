import { NS } from "@/NetscriptDefinitions";
export async function main(ns: NS) {
    const beforeSec = ns.getServerSecurityLevel("n00dles");
    const waitTime = ns.getGrowTime("n00dles");
    ns.run("toastTime.js", 1, false, waitTime, 1000, false, "info", " until operation is complete");
    await ns.sleep(waitTime);
    const afterSec = ns.getServerSecurityLevel("n00dles");
    ns.tprint(`before: ${beforeSec}, after: ${afterSec}, difference: ${afterSec - beforeSec}`);
}