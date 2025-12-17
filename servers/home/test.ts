import { getBestServer } from "./utils";

export async function main(ns: NS) {
    ns.tprint(getBestServer(ns));
}