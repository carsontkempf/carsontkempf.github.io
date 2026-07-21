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
        { id: "cube", name: "Cube", price: 0 },
        { id: "sphere", name: "Sphere", price: 150 },
        { id: "star", name: "Star", price: 200 },
        { id: "diamond", name: "Diamond", price: 250 },
        { id: "arrow", name: "Arrow", price: 300 },
        { id: "crown", name: "Crown", price: 400 },
        { id: "bear", name: "Bear", price: 500 },
        { id: "cat", name: "Cat", price: 500 },
        { id: "rocket", name: "Rocket", price: 750 },
        { id: "ghost", name: "Ghost", price: 1000 },
    ]
};

class Shop {
    constructor(game) {
        this.game = game;
        this.activeTab = "colors"; // colors, patterns, shapes
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

            let stateClass = "";
            let stateText = "";
            if (equipped) { stateClass = "equipped"; stateText = "Equipped"; }
            else if (owned) { stateClass = "owned"; stateText = "Owned"; }
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
        } else {
            return `<div class="shape-preview shape-${item.id}"></div>`;
        }
    }

    isEquipped(item) {
        if (this.activeTab === "colors") return this.game.equippedColor === item.color;
        if (this.activeTab === "patterns") return this.game.equippedPattern === item.id;
        if (this.activeTab === "shapes") return this.game.equippedShape === item.id;
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
        } else if (this.game.coins >= item.price) {
            // Purchase
            this.game.coins -= item.price;
            this.game.unlockedSkins.push(id);
            this.equip(item, tab);
            this.game.saveUserData();
            this.game.updateCoinDisplays();
        }

        this.render();
    }

    equip(item, tab) {
        if (tab === "colors") this.game.equippedColor = item.color;
        else if (tab === "patterns") this.game.equippedPattern = item.id;
        else if (tab === "shapes") this.game.equippedShape = item.id;
        this.game.saveUserData();
    }
}
