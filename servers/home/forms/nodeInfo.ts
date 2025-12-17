import { BitNodeMultipliers, BitNodeOptions } from "@/NetscriptDefinitions";
type BN<N extends number, LvlRange> = {
    n: N;
    lvl: LvlRange;
}
type BitNodeMap = {
    [K in 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 13 | 14]: BN<K, 0 | 1 | 2 | 3>;
} & {
    [K in 12]: BN<K, number>
};
/**
 * An alias to combinations of all possible bitnodeN/level combinations.
 */
export type BitNode = BitNodeMap[keyof BitNodeMap];

/** 
 * It is on the startup sript's shoulders to initialise this with the value from `identifyBitnode()`
 * 
 * Do not write to this variable. If properly initialised, it will never desync.
*/
export let gCurrentNode: Readonly<BitNode>;
export function setGCurrentNode(ns: NS) {
    gCurrentNode = identifyBitnode(ns);
}
/**
 * Identifies the current bitnode using minimal RAM
 */
export function identifyBitnode(ns: NS): BitNode {
    // @TODO: this whole function
    return {
        n: 1,
        lvl: 0
    };
}
/**
 * The default bitnode (bn1.1) multipliers.
 */
export const defaultBitNodeMults: BitNodeMultipliers = {
    AgilityLevelMultiplier: 1,
    AugmentationMoneyCost: 1,
    AugmentationRepCost: 1,
    BladeburnerRank: 1,
    BladeburnerSkillCost: 1,
    CharismaLevelMultiplier: 1,
    ClassGymExpGain: 1,
    CodingContractMoney: 1,
    CompanyWorkExpGain: 1,
    CompanyWorkMoney: 1,
    CompanyWorkRepGain: 1,
    CorporationDivisions: 1,
    CorporationSoftcap: 1,
    CorporationValuation: 1,
    CrimeExpGain: 1,
    CrimeMoney: 1,
    CrimeSuccessRate: 1,
    DaedalusAugsRequirement: 30,
    DefenseLevelMultiplier: 1,
    DexterityLevelMultiplier: 1,
    FactionPassiveRepGain: 1,
    FactionWorkExpGain: 1,
    FactionWorkRepGain: 1,
    FourSigmaMarketDataApiCost: 1,
    FourSigmaMarketDataCost: 1,
    GangSoftcap: 1,
    GangUniqueAugs: 1,
    GoPower: 1,
    HackExpGain: 1,
    HackingLevelMultiplier: 1,
    HackingSpeedMultiplier: 1,
    HacknetNodeMoney: 1,
    HomeComputerRamCost: 1,
    InfiltrationMoney: 1,
    InfiltrationRep: 1,
    ManualHackMoney: 1,
    FavorToDonateToFaction: 1,
    ScriptHackMoney: 1,
    ScriptHackMoneyGain: 1,
    ServerGrowthRate: 1,
    ServerMaxMoney: 1,
    ServerStartingMoney: 1,
    ServerStartingSecurity: 1,
    ServerWeakenRate: 1,
    StrengthLevelMultiplier: 1,
    StaneksGiftPowerMultiplier: 1,
    StaneksGiftExtraSize: 0,
    WorldDaemonDifficulty: 1,
    CloudServerCost: 1,
};
/**
 * Gets the bitnode multipliers for a given bitnode. Replacement for `ns.getBitNodeMultipliers` (4gb)
 * @param node The bitnode to get multipliers for
 * @returns The multipliers for bitnode `node`
 */
export function getBitNodeMultipliers(node: BitNode): BitNodeMultipliers {
    // @TODO: this whole function
    console.error("custom getBitNodeMultipliers: IMPLEMENT ME!");
    return defaultBitNodeMults;
}

export function getBitNodeOptions(node: BitNode): BitNodeOptions {
    return {
        sourceFileOverrides: new Map(),
        intelligenceOverride: undefined,
        restrictHomePCUpgrade: false,
        disableGang: false,
        disableCorporation: false,
        disableBladeburner: false,
        disable4SData: false,
        disableHacknetServer: false,
        disableSleeveExpAndAugmentation: false
    };
}