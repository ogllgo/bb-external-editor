import * as React from "react";

import ports from "./ports.json";
function Clock() {
    const [time, setTime] = React.useState<Date>(new Date(Date.now()));
    React.useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date(Date.now()));
        });
        return () => clearInterval(interval);
    }, []);
    return <p>{time.toLocaleString()}</p>;
}
export async function main(ns: NS) {
    ns.tprint(`port: ${ports.CLOCK}`);
    ns.printRaw(<Clock />);
    return new Promise(() => {});
}