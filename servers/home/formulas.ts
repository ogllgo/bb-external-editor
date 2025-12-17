import { Formulas, Person, Player, Server } from "@/NetscriptDefinitions";
import { PersonDefaultMultipliers } from "./forms/person";
import { NSEnums } from "./forms/enums";
import { clamp } from "./utils";
import { CONSTANTS } from "./forms/internalConstants";
import { gCurrentNode, getBitNodeMultipliers } from "./forms/nodeInfo";
import { calculateEffectiveThreads } from "./forms/hacking";
import { gPlayer } from "./forms/player";
import { calculateInteligenceBonus as calculateIntelligenceBonus } from "./forms/intelligence";

const FORMULAS: Formulas = {
    /**
     * Returns a default Server value
     * @returns A default Server
     */
    mockServer(): Server {
        return {
            cpuCores: 0,
            ftpPortOpen: false,
            hasAdminRights: false,
            hostname: "",
            httpPortOpen: false,
            ip: "",
            isConnectedTo: false,
            maxRam: 0,
            organizationName: "",
            ramUsed: 0,
            smtpPortOpen: false,
            sqlPortOpen: false,
            sshPortOpen: false,
            purchasedByPlayer: false,
            backdoorInstalled: false,
            baseDifficulty: 0,
            hackDifficulty: 0,
            minDifficulty: 0,
            moneyAvailable: 0,
            moneyMax: 0,
            numOpenPortsRequired: 0,
            openPortCount: 0,
            requiredHackingSkill: 0,
            serverGrowth: 0,
        };
    },
    /**
     * Returns a default Player value
     * @returns A default Player
     */
    mockPlayer(): Player {
        return {
            // Person
            hp: { current: 0, max: 0 },
            skills: { hacking: 0, strength: 0, defense: 0, dexterity: 0, agility: 0, charisma: 0, intelligence: 0 },
            exp: { hacking: 0, strength: 0, defense: 0, dexterity: 0, agility: 0, charisma: 0, intelligence: 0 },
            mults: PersonDefaultMultipliers(),
            city: NSEnums.CityName.Sector12,
            // Player-specific
            numPeopleKilled: 0,
            money: 0,
            location: NSEnums.LocationName.TravelAgency,
            totalPlaytime: 0,
            jobs: {},
            factions: [],
            entropy: 0,
            karma: 0
        };
    },
    /**
     * Returns a default Person value
     * @returns A default Person
     */
    mockPerson(): Person {
        return {
            // Person
            hp: { current: 0, max: 0 },
            skills: { hacking: 0, strength: 0, defense: 0, dexterity: 0, agility: 0, charisma: 0, intelligence: 0 },
            exp: { hacking: 0, strength: 0, defense: 0, dexterity: 0, agility: 0, charisma: 0, intelligence: 0 },
            mults: PersonDefaultMultipliers(),
            city: NSEnums.CityName.Sector12,
        };
    },
    reputation: {
        /**
         * Calculate the total required amount of faction reputation to reach a target favor.
         * @param favor — target faction favor.
         * @returns — The calculated faction reputation required.
         */
        calculateFavorToRep(favor: number): number {
            const MaxFavor = 35331;
            const log1point02 = 0.019802627296179712;
            return clamp(25000 * Math.expm1(log1point02 * favor), 0);
        },
        calculateRepToFavor(rep: number): number {
            const MaxFavor = 35331;
            const log1point02 = 0.019802627296179712;
            return clamp(Math.log1p(rep / 25000) / log1point02, 0, MaxFavor);
        },
        repFromDonation(amount: number, player: Person): number {
            return (amount / CONSTANTS.DonateMoneyToRepDivisor) * player.mults.faction_rep * getBitNodeMultipliers(gCurrentNode).FactionWorkRepGain
        },
        donationForRep(reputation: number, player: Person): number {
            return (reputation * CONSTANTS.DonateMoneyToRepDivisor) / player.mults.faction_rep * getBitNodeMultipliers(gCurrentNode).FactionWorkRepGain;
        },
        sharePower(threads: number, cpuCores: number = 1, player: Person = gPlayer): number {
            const effectiveThreads = calculateEffectiveThreads(threads, player, cpuCores);
            const bonus = 1 + Math.log(effectiveThreads) / 25;
            if (!Number.isFinite(bonus)) {
                return 1;
            }
            return bonus;
        }
    },
    skills: {
        calculateSkill(exp: number, skillMult: number = 1): number {
            const value = Math.floor(skillMult * (32 * Math.log(exp + 534.6) - 200));
            return clamp(value, 1);
        },
        calculateExp(skill: number, skillMult: number) {
            const floorSkill = Math.floor(skill);
            let value = Math.exp((skill / skillMult + 200) / 32) - 534.6;
            if (skill === floorSkill && Number.isFinite(skill)) {
                // Check for floating point rounding issues that would cause the inverse
                // operation to return the wrong result.
                let calcSkill = FORMULAS.skills.calculateSkill(value, skillMult);
                let diff = Math.abs(value * Number.EPSILON);
                let newValue = value;
                while (calcSkill < skill) {
                    newValue = value + diff;
                    diff *= 2;
                    calcSkill = FORMULAS.skills.calculateSkill(newValue, skillMult);
                }
                value = newValue;
            }
            return clamp(value, 0);
        }
    },
    hacking: {
        hackChance(server: Server, player: Person): number {
            const hackDifficulty = server.hackDifficulty ?? 100;
            const requiredHackingSkill = server.requiredHackingSkill ?? 1e9;
            // Unrooted or unhackable server
            if (!server.hasAdminRights || hackDifficulty >= 100) return 0;
            const hackFactor = 1.75;
            const difficultyMult = (100 - hackDifficulty) / 100;
            const skillMult = clamp(hackFactor * player.skills.hacking, 1);
            const skillChance = (skillMult - requiredHackingSkill) / skillMult;
            const chance =
                skillChance *
                difficultyMult *
                player.mults.hacking_chance *
                calculateIntelligenceBonus(player.skills.intelligence, 1);
            return clamp(chance, 0, 1);
        },
        hackExp(server: Server, player: Person): number {
            const baseDifficulty = server.baseDifficulty;
            if (!baseDifficulty) return 0;
            const baseExpGain = 3;
            const diffFactor = 0.3;
            let expGain = baseExpGain;
            expGain += baseDifficulty * diffFactor;
            return expGain * player.mults.hacking_exp * getBitNodeMultipliers(gCurrentNode).HackExpGain;
        }
    }
}
export default FORMULAS;

function t(ns: NS) {
    ns.getBitNodeMultipliers()
}