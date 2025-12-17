import { Player } from "@/NetscriptDefinitions";

/** It is on the startup script's shoulders to initialise this with the value from `ns.getPlayer()`
 * 
 *  Only write to this by updating its value with `ns.getPlayer()` (preferrably, once per frame). This is to avoid horrible desync issues.
*/
export let gPlayer: Player;