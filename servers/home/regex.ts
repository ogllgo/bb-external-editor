import { NS } from "@/NetscriptDefinitions";

export async function main(ns: NS) {
    const regex = RegExp("^(pserv-|I.I.I.I|NiteSec|)")
    ns.tprint(regex.test("I.I.I.I"))
}