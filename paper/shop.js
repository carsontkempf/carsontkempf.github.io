/**
 * Shop - Skin catalog, purchase logic, and shop UI rendering.
 */

const SKIN_CATALOG = {
    colors: [
        { id: "default", name: "Cyan", color: "#00d2ff", price: 0 },
        { id: "red", name: "Ruby", color: "#ff4757", price: 50 },
        { id: "green", name: "Emerald", color: "#2ed573", price: 50 },
        { id: "gold", name: "Gold", color: "#ffa502", price: 75 },
        { id: "purple", name: "Amethyst", color: "#7b2ff7", price: 75 },
        { id: "pink", name: "Rose", color: "#ff6b81", price: 100 },
        { id: "lime", name: "Lime", color: "#7bed9f", price: 100 },
        { id: "ocean", name: "Ocean", color: "#1e90ff", price: 125 },
        { id: "sunset", name: "Sunset", color: "#ff6348", price: 150 },
        { id: "midnight", name: "Midnight", color: "#2f3542", price: 200 },
        { id: "ice", name: "Ice", color: "#a4f4ff", price: 200 },
        { id: "lava", name: "Lava", color: "#ff3838", price: 250 },
    ],
    patterns: [
        { id: "solid", name: "Solid", price: 0 },
        { id: "stripes", name: "Stripes", price: 100 },
        { id: "dots", name: "Dots", price: 100 },
        { id: "gradient", name: "Gradient", price: 150 },
        { id: "camo", name: "Camo", price: 200 },
        { id: "checker", name: "Checker", price: 200 },
        { id: "diamond", name: "Diamond", price: 250 },
        { id: "neon", name: "Neon Glow", price: 300 },
    ],
    shapes: [
        { id: "droplet", name: "Droplet", price: 0 },
        { id: "bunny", name: "Bunny", price: 150 },
        { id: "chick", name: "Chick", price: 150 },
        { id: "frog", name: "Frog", price: 200 },
        { id: "penguin", name: "Penguin", price: 200 },
        { id: "fox", name: "Fox", price: 250 },
        { id: "panda", name: "Panda", price: 300 },
        { id: "owl", name: "Owl", price: 350 },
        { id: "skateboard", name: "Skater", price: 400 },
        { id: "skis", name: "Skier", price: 450 },
        { id: "hoverboard", name: "Hoverboard", price: 500 },
        { id: "ninja", name: "Ninja", price: 500 },
        { id: "astronaut", name: "Astronaut", price: 600 },
    ],
    powerups: [
        { id: "none", name: "None", price: 0, desc: "No powerup equipped" },
        { id: "big_start_1", name: "Big Start I", price: 100, desc: "20% bigger starting territory", tier: 1 },
        { id: "big_start_2", name: "Big Start II", price: 250, desc: "40% bigger starting territory", tier: 2, requires: "big_start_1" },
        { id: "big_start_3", name: "Big Start III", price: 500, desc: "70% bigger starting territory", tier: 3, requires: "big_start_2" },
        { id: "big_start_4", name: "Big Start IV", price: 1000, desc: "100% bigger starting territory", tier: 4, requires: "big_start_3" },
        { id: "big_start_5", name: "Big Start V", price: 2000, desc: "150% bigger starting territory", tier: 5, requires: "big_start_4" },
        { id: "magnet", name: "Magnet", price: 300, desc: "Tokens attracted from 2x range" },
        { id: "shield", name: "Shield", price: 500, desc: "Survive one trail hit" },
        { id: "thick_trail", name: "Wide Trail", price: 250, desc: "Trail is 50% wider (harder to dodge)" },
        { id: "quick_fill", name: "Quick Fill", price: 400, desc: "Territory fills 30% more area" },
        { id: "heart_1", name: "1 Heart", price: 100, desc: "1 extra life per game" },
        { id: "heart_3", name: "3 Hearts", price: 250, desc: "3 extra lives per game" },
    ]
};

class Shop {
    constructor(game) {
        this.game = game;
        this.activeTab = "colors";
        this.loadoutTab = "colors";
    }

    render() {
        const container = document.getElementById("shop-items");
        if (!container) return;

        let html = this.renderTabs();
        const items = SKIN_CATALOG[this.activeTab] || [];

        html += '<div class="shop-grid">';
        for (const item of items) {
            const owned = this.game.unlockedSkins.includes(item.id);
            const equipped = this.isEquipped(item);
            const canAfford = this.game.coins >= item.price;
            const prereqMet = !item.requires || this.game.unlockedSkins.includes(item.requires);

            let stateClass = "";
            let stateText = "";
            if (equipped) { stateClass = "equipped"; stateText = "Equipped"; }
            else if (owned) { stateClass = "owned"; stateText = "Owned"; }
            else if (!prereqMet) { stateClass = "locked"; stateText = "Requires " + (item.requires || "").replace(/_/g, " "); }
            else if (canAfford) { stateText = `● ${item.price}`; }
            else { stateClass = "locked"; stateText = `● ${item.price}`; }

            html += `<div class="shop-item ${stateClass}" data-id="${item.id}" data-tab="${this.activeTab}">
                <div class="shop-item-preview">${this.renderPreview(item)}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-price ${owned ? 'price-owned' : ''}">${stateText}</div>
            </div>`;
        }
        html += '</div>';

        container.innerHTML = html;
        this.bindShopEvents(container);
    }

    renderTabs() {
        const tabs = [
            { id: "colors", label: "Colors" },
            { id: "patterns", label: "Patterns" },
            { id: "shapes", label: "Characters" },
            { id: "powerups", label: "Powerups" },
        ];
        let html = '<div class="shop-tabs">';
        for (const tab of tabs) {
            html += `<button class="shop-tab ${this.activeTab === tab.id ? 'active' : ''}" data-tab="${tab.id}">${tab.label}</button>`;
        }
        html += '</div>';
        return html;
    }

    renderPreview(item) {
        if (this.activeTab === "colors") {
            return `<div style="width:36px;height:36px;border-radius:8px;background:${item.color};margin:0 auto;"></div>`;
        } else if (this.activeTab === "patterns") {
            return `<div class="pattern-preview pattern-${item.id}"></div>`;
        } else if (this.activeTab === "powerups") {
            return `<div class="shape-preview" style="font-size:1.2em;">${item.desc ? '⚡' : ''}</div>`;
        } else {
            return `<div class="shape-preview shape-${item.id}"></div>`;
        }
    }

    isEquipped(item) {
        if (this.activeTab === "colors") return this.game.equippedColor === item.color;
        if (this.activeTab === "patterns") return this.game.equippedPattern === item.id;
        if (this.activeTab === "shapes") return this.game.equippedShape === item.id;
        if (this.activeTab === "powerups") return this.game.equippedPowerup === item.id;
        return false;
    }

    bindShopEvents(container) {
        // Tab switching
        container.querySelectorAll(".shop-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                this.activeTab = tab.dataset.tab;
                this.render();
            });
        });

        // Item click
        container.querySelectorAll(".shop-item").forEach(el => {
            el.addEventListener("click", () => {
                const id = el.dataset.id;
                const tab = el.dataset.tab;
                this.handleItemClick(id, tab);
            });
        });
    }

    handleItemClick(id, tab) {
        const catalog = SKIN_CATALOG[tab];
        const item = catalog.find(i => i.id === id);
        if (!item) return;

        const owned = this.game.unlockedSkins.includes(id);

        if (owned) {
            // Equip it
            this.equip(item, tab);
        } else {
            // Check prerequisite
            if (item.requires && !this.game.unlockedSkins.includes(item.requires)) {
                // Can't buy - need prerequisite first
                return;
            }
            if (this.game.coins >= item.price) {
                // Purchase
                this.game.coins -= item.price;
                this.game.unlockedSkins.push(id);
                this.equip(item, tab);
                this.game.saveUserData();
                this.game.updateCoinDisplays();
            }
        }

        this.render();
    }

    equip(item, tab) {
        if (tab === "colors") this.game.equippedColor = item.color;
        else if (tab === "patterns") this.game.equippedPattern = item.id;
        else if (tab === "shapes") this.game.equippedShape = item.id;
        else if (tab === "powerups") this.game.equippedPowerup = item.id;
        this.game.saveUserData();
    }

    /**
     * Render the loadout screen (only owned items, equip only).
     */
    renderLoadout() {
        const container = document.getElementById("loadout-items");
        if (!container) return;

        let html = this.renderLoadoutTabs();
        const items = SKIN_CATALOG[this.loadoutTab] || [];

        html += '<div class="shop-grid">';
        for (const item of items) {
            // Show item if owned OR if it's free (price === 0)
            const owned = this.game.unlockedSkins.includes(item.id) || item.price === 0;
            if (!owned) continue;

            const equipped = this.isLoadoutEquipped(item);
            const stateClass = equipped ? "equipped" : "owned";
            const stateText = equipped ? "Equipped" : "Tap to equip";
            const desc = item.desc ? `<div class="shop-item-desc">${item.desc}</div>` : "";

            html += `<div class="shop-item ${stateClass}" data-id="${item.id}" data-tab="${this.loadoutTab}">
                <div class="shop-item-preview">${this.renderPreview(item)}</div>
                <div class="shop-item-name">${item.name}</div>
                ${desc}
                <div class="shop-item-price price-owned">${stateText}</div>
            </div>`;
        }
        html += '</div>';
        container.innerHTML = html;
        this.bindLoadoutEvents(container);
    }

    renderLoadoutTabs() {
        const tabs = [
            { id: "colors", label: "Colors" },
            { id: "shapes", label: "3D Skins" },
            { id: "powerups", label: "Powerups" },
            { id: "patterns", label: "Trails" },
        ];
        let html = '<div class="shop-tabs">';
        for (const tab of tabs) {
            html += `<button class="shop-tab ${this.loadoutTab === tab.id ? 'active' : ''}" data-tab="${tab.id}">${tab.label}</button>`;
        }
        html += '</div>';
        return html;
    }

    isLoadoutEquipped(item) {
        if (this.loadoutTab === "colors") return this.game.equippedColor === item.color;
        if (this.loadoutTab === "patterns") return this.game.equippedPattern === item.id;
        if (this.loadoutTab === "shapes") return this.game.equippedShape === item.id;
        if (this.loadoutTab === "powerups") return this.game.equippedPowerup === item.id;
        return false;
    }

    bindLoadoutEvents(container) {
        container.querySelectorAll(".shop-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                this.loadoutTab = tab.dataset.tab;
                this.renderLoadout();
            });
        });
        container.querySelectorAll(".shop-item").forEach(el => {
            el.addEventListener("click", () => {
                const id = el.dataset.id;
                const tab = el.dataset.tab;
                const catalog = SKIN_CATALOG[tab];
                const item = catalog.find(i => i.id === id);
                if (item) this.equip(item, tab);
                this.renderLoadout();
            });
        });
    }
}
