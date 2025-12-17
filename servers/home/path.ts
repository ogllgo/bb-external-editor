import { getAllServers } from "./utils";

export async function main(ns: NS) {
  const target = ns.args[0];
  if (!target || target == '-h' || target == '--help') {
    ns.tprintRaw(`Usage: \`run ${ns.getScriptName()} SERVER_NAME\`, where SERVER_NAME is the name of the server to connect to.`);
    ns.tprintRaw("Output: a command to paste into the terminal in order to connect to SERVER_NAME");
    return;
  }
  let servs = getAllServers(ns);
  if (typeof target != "string" || servs.indexOf(target) == -1) {
    ns.tprintRaw(`Usage: \`run ${ns.getScriptName()} SERVER_NAME\`, where SERVER_NAME is the name of the server to connect to.`);
    ns.tprintRaw("Output: a command to paste into the terminal in order to connect to SERVER_NAME");
    return;
  }
  const path: string[] = [target];
  let serv = target;
  while (serv != "home") {
    let next = ns.scan(serv)[0];
    path.push(next);
    serv = next;
  }
  path.reverse();
  ns.tprint(path.join("; connect "));
}
