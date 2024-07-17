import { NS } from "@/NetscriptDefinitions";
import { table } from "./printStyle";
import { fgGreen, fgRed, fgYellow } from "./printStyle";
export async function main(ns: NS) {
    ns.tail();
    table(ns, [["abc", "ab", "aaa", "b"], ["bc", "bc", "aaaa"], ["123", "1"]], [[fgGreen, fgYellow], [fgRed]]);
}