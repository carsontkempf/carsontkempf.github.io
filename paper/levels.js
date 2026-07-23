/**
 * Levels - Progression system. Each level has a circular arena.
 * Higher levels = bigger arena, more AI, more aggressive bots.
 */

const LEVELS = [
    { id: 1, name: "Pond",      radius: 15000, aiCount: 2, aiTypes: ["cautious", "cautious"],                   reward: 20 },
    { id: 2, name: "Lake",      radius: 18000, aiCount: 3, aiTypes: ["cautious", "cautious", "expansive"],      reward: 30 },
    { id: 3, name: "River",     radius: 20000, aiCount: 3, aiTypes: ["cautious", "expansive", "expansive"],     reward: 40 },
    { id: 4, name: "Bay",       radius: 22000, aiCount: 4, aiTypes: ["expansive", "expansive", "aggressive", "cautious"], reward: 55 },
    { id: 5, name: "Sea",       radius: 25000, aiCount: 4, aiTypes: ["expansive", "aggressive", "aggressive", "expansive"], reward: 70 },
    { id: 6, name: "Ocean",     radius: 28000, aiCount: 5, aiTypes: ["aggressive", "aggressive", "expansive", "aggressive", "expansive"], reward: 90 },
    { id: 7, name: "Abyss",     radius: 32000, aiCount: 5, aiTypes: ["aggressive", "aggressive", "aggressive", "aggressive", "expansive"], reward: 120 },
    { id: 8, name: "Void",      radius: 36000, aiCount: 6, aiTypes: ["aggressive", "aggressive", "aggressive", "aggressive", "aggressive", "expansive"], reward: 160 },
    { id: 9, name: "Infinity",  radius: 40000, aiCount: 7, aiTypes: ["aggressive", "aggressive", "aggressive", "aggressive", "aggressive", "aggressive", "aggressive"], reward: 200 },
];

function getLevel(id) {
    return LEVELS.find(l => l.id === id) || LEVELS[0];
}

function getMaxUnlockedLevel(stats) {
    // Unlock next level after winning the current one
    return Math.min(LEVELS.length, (stats.maxLevel || 1));
}
