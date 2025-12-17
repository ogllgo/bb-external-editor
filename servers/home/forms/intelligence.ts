import { gCurrentNode, getBitNodeOptions } from "./nodeInfo";

export function calculateInteligenceBonus(intelligence: number, weight: number = 1): number {
    const nodeOptions = getBitNodeOptions(gCurrentNode);
    const effectiveIntelligence = 
    nodeOptions.intelligenceOverride !== undefined  
        ? Math.min(nodeOptions.intelligenceOverride, intelligence)
        : intelligence;  
    return 1 + (weight * Math.pow(effectiveIntelligence, 0.8)) / 600;
}