import { Person } from "@/NetscriptDefinitions";
import { calculateInteligenceBonus } from "./intelligence";

export function getCoreBonus(cores: number = 1): number {
  return 1 + (cores - 1) / 16;
}

export function calculateEffectiveThreads(threads: number, player: Person, cpuCores: number = 1): number {
  const coreBonus = getCoreBonus(cpuCores);
  return threads * calculateInteligenceBonus(player.skills.intelligence, 2) * coreBonus;
}