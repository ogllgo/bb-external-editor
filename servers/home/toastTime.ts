import { NS } from "@/NetscriptDefinitions";
const max = Math.max;
const min = Math.min;
export async function main(ns: NS) {
    if (ns.args.length === 0) {
        ns.tprint("when making toasts   , no arguments were specified. It goes:\n\nDo we print data [true] or count down [false]\nTotal time between message\nDelay between messages\nWhether we toast [true] or print [false]\nthe data to display\n\n");
        ns.toast("when making toasts, no arguments were specified. Check the terminal.", "error", 5000);
        ns.writePort(ns.pid, "FAIL");
        return;
    }
    if (Boolean(ns.args[0])) {
        let toastDelay = 5000; // ms delay between toasts
        let makeToast = true; // do we use toasts [true] or prints [false]
        let waitTime: number; // how long do we print
        let data: string; // what do we print
        let toastType: "success" | "warning" | "error" | "info"; // if we're toasting, what type?
        if (ns.args.length > 1 && typeof ns.args[1] === "number") {
            waitTime = ns.args[1];
        } else {
            ns.tprint("when making toasts, no total time was specified.");
            ns.toast("when making toasts, no total time was specified.", "error", 5000);
            ns.writePort(ns.pid, "FAIL");
            return;
        }
        if (ns.args.length > 2 && typeof ns.args[2] === "number") {
            toastDelay = ns.args[2];
        } else {
            ns.tprint("When making toasts, delay between toasts wasn't a number.");
            ns.toast("When making toasts, delay between toasts wasn't a number.", "error", 5000);
            ns.writePort(ns.pid, "FAIL");
            return;
        }
        if (ns.args.length > 3 && typeof ns.args[3] === "boolean") {
            makeToast = ns.args[3];
        } else {
            ns.tprint(`When making toasts, whether we toast or print wasn't specified, or was bad data. \"${ns.args[3]}\" was given. Use true if you're toasting, and false if you're printing.`);
            ns.toast("When making toasts, whether we toast or print wasn't specified, or was bad data. Use true if you're toasting, and false if you're printing.", "error", 5000);
            ns.writePort(ns.pid, "FAIL");
            return;
        }
        if (ns.args.length > 4) {
            toastType = ns.args[4] + "";
        } else {
            ns.tprint("When making toasts, the type wasn't specified. Use any string without spaces or newlines if you're printing to the terminal.");
            ns.toast("When making toasts, the type wasn't specified. Use any string without spaces or newlines if you're printing to the terminal.", "error", 5000);
            ns.writePort(ns.pid, "FAIL");
            return;
        }
        if (ns.args.length > 5) {
            data = ns.args.slice(5).join(" ");
        } else {
            ns.tprint("When making toasts, there was no data.");
            ns.toast("When making toasts, there was no data.", "error", 5000);
            ns.writePort(ns.pid, "FAIL");
            return;
        }
        let startingTimeStamp = Date.now();
        while (Date.now() < waitTime + startingTimeStamp) {
            if ((Date.now() - startingTimeStamp) % toastDelay < min(max(toastDelay, 10), 10)) {
                if (makeToast) {
                    //@ts-expect-error
                    ns.toast(data, toastType, 2000)
                } else {
                    ns.tprint(data);
                }
            }
            await ns.asleep(10);
        }
        
        ns.writePort(ns.pid, "SUCCESS");
        return;
    }
    let toastDelay = 5000; // ms delay between toasts
    let makeToast = true; // do we use toasts [true] or prints [false]
    let waitTime: number; // how long do we print
    let toastType: "success" | "warning" | "error" | "info"; // if we're toasting, what type?
    let data: string; // what do we print
    if (ns.args.length > 1 && typeof ns.args[1] === "number") {
        waitTime = ns.args[1];
    } else {
        ns.tprint("when making toasts, no arguments were specified. It goes:\nTotal time\nDelay between messages\nWhether we toast [true] or print [false]\nthe data to print");
        ns.toast("when making toasts, no arguments were specified. Check the terminal.", "error", 5000);
        ns.writePort(ns.pid, "FAIL");
        return;
    }
    if (ns.args.length > 2 && typeof ns.args[2] === "number") {
        toastDelay = ns.args[2];
    } else {
        ns.tprint("When making toasts, delay between toasts wasn't a number. This defaults to 5000.");
        ns.toast("When making toasts, delay between toasts wasn't a number. This defaults to 5000.", "error", 5000);
        ns.writePort(ns.pid, "FAIL");
        return;
    }
    if (typeof ns.args[3] === "boolean") makeToast = ns.args[3];
    if (ns.args.length > 4) {
        toastType = ns.args[4] + "";
    } else if (makeToast) {
        ns.tprint(`When making toasts, toast type wasn't an allowed string. Allowed strings: "info", "error", "warning", "success", but "${ns.args[4]}" was specified.`);
        ns.toast(`When making toasts, toast type wasn't an allowed string. Allowed strings: "info", "error", "warning", "success", but "${ns.args[4]}" was specified.`, "error", 5000);
        ns.writePort(ns.pid, "FAIL");
        return;
    }
    if (ns.args.length > 5) {
        data = ns.args.slice(5).join(" ");
    }
    let startingTimeStamp = Date.now();
    ns.tprint(toastType);
    while (Date.now() < waitTime + startingTimeStamp) {
        if ((Date.now() - startingTimeStamp) % toastDelay < 10) {
            const printString = ns.tFormat(Math.round((waitTime - (Date.now() - startingTimeStamp)) / toastDelay) * toastDelay, true) + " " + data;
            if (makeToast) {
                ns.toast(printString, toastType, 4000)
            } else {
                ns.tprint(printString);
            }
        }
        await ns.asleep(10);
    }
    
    ns.writePort(ns.pid, "SUCCESS");
}