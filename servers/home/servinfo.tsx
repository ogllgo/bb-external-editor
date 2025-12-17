import * as React from "react";

import { getAllServers } from "./utils";

function ServerLink({ serv, ns }: { serv: string, ns: NS }) {
  return (
    <p
      onClick={() => { ns.run("path.ts", undefined, serv); ns.toast(`Check the terminal for your path to ${serv}`) }}
      style={{
        textDecoration: "underline",
        cursor: "pointer",
        display: "inline",
        margin: 0,
        padding: 0,
      }}
    >
      {serv}
    </p>
  )
}
function ServerRow({ serv, ns }: { serv: string, ns: NS }) {
  return (
    <tr>
      <td
        style={{
          border: "1px solid white",
          borderCollapse: "collapse",
        }}
      > <ServerLink serv={serv} ns={ns} /> </td>
      <td
        style={{
          border: "1px solid white",
          borderCollapse: "collapse",
        }}
      > {ns.getServerMaxRam(serv)} </td>
      <td
        style={{
          border: "1px solid white",
          borderCollapse: "collapse",
        }}
      > {ns.getServerRequiredHackingLevel(serv)} </td>
      <td
        style={{
          border: "1px solid white",
          borderCollapse: "collapse",
        }}
      > {ns.getServerNumPortsRequired(serv)} </td>
      <td
        style={{
          border: "1px solid white",
          borderCollapse: "collapse",
        }}
      > {ns.hasRootAccess(serv) ? "Yes" : "No"} </td>
    </tr>
  )
}

function ServerBrowser({ ns }: { ns: NS }) {
  const [currentPos, setCurrentPos] = React.useState(0);

  const visibleServers = getAllServers(ns)
    .filter(s => !ns.getPurchasedServers().includes(s));

  const PAGE_SIZE = 25;

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();

    setCurrentPos(pos => {
      if (e.deltaY > 0) {
        // scroll down
        return Math.min(pos + PAGE_SIZE, visibleServers.length - PAGE_SIZE);
      } else {
        // scroll up
        return Math.max(pos - PAGE_SIZE, 0);
      }
    });
  }

  return (
    <div
      onWheel={onWheel}
      style={{
        maxHeight: "1000px",
        overflow: "hidden",
      }}
    >      <p>at {currentPos + 1}</p>

      <table
        style={{
          border: "1px solid white",
          borderCollapse: "collapse",
        }}
      >
        <tr>
          <td>Server</td>
          <td>Max Ram</td>
          <td>Hacking Requirement</td>
          <td>Ports Requirement</td>
          <td>Rooted</td>
        </tr>
        {visibleServers
          .slice(currentPos, currentPos + PAGE_SIZE)
          .map(s => (
            <ServerRow key={s} serv={s} ns={ns} />
          ))}
      </table>
    </div>
  );
}

export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.ui.openTail();
  ns.clearLog();
  ns.printRaw(<ServerBrowser ns={ns} />)
  return new Promise(() => { });
}
