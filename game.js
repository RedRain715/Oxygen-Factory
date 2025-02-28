class Settings {
    constructor(game) {
        this.game = game;
        this.autoSaveInterval = 0;
        this.autoSaveTimer = null;
        this.currentTheme = 'default';
        this.fontSize = 100;
        this.highContrast = false;
        this.showTooltips = true;
        this.animationSpeed = 'normal';
        this.autoSellThreshold = 0.9;

        // Set initial theme based on user's system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.currentTheme = 'dark';
        }

        this.initializeSettings();
        this.loadSettings();

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('oxygenFactory_settings')) {
                this.setTheme(e.matches ? 'dark' : 'default');
            }
        });

        // Initialize tooltips
        this.initializeTooltips();
    }

    initializeSettings() {
        // Settings button
        const settingsBtn = document.getElementById('settings-button');
        const settingsModal = document.getElementById('settings-modal');
        const closeBtn = document.getElementById('close-settings');

        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.add('active');
        });

        closeBtn.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });

        // Auto-save settings
        const autoSaveSelect = document.getElementById('auto-save');
        autoSaveSelect.addEventListener('change', (e) => {
            this.setAutoSave(parseInt(e.target.value));
        });

        // Font size settings
        const fontSizeInput = document.getElementById('font-size');
        const fontSizeValue = document.getElementById('font-size-value');
        fontSizeInput.addEventListener('input', (e) => {
            this.setFontSize(e.target.value);
            fontSizeValue.textContent = e.target.value + '%';
        });

        // High contrast settings
        const highContrastInput = document.getElementById('high-contrast');
        highContrastInput.addEventListener('change', (e) => {
            this.setHighContrast(e.target.checked);
        });

        // Theme settings
        const themeSelect = document.getElementById('theme-select');
        themeSelect.addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        // Save management
        document.getElementById('save-game').addEventListener('click', () => this.saveGame());
        document.getElementById('load-game').addEventListener('click', () => this.loadGame());
        document.getElementById('reset-game').addEventListener('click', () => this.resetGame());
        document.getElementById('export-game').addEventListener('click', () => this.exportGame());
        document.getElementById('import-game').addEventListener('click', () => document.getElementById('import-file').click());
        document.getElementById('import-file').addEventListener('change', (e) => this.importGame(e));

        // Auto-sell settings
        const autoSellSelect = document.getElementById('auto-sell');
        autoSellSelect.addEventListener('change', (e) => {
            this.autoSellThreshold = parseFloat(e.target.value);
            this.saveSettings();
        });

        // Animation speed settings
        const animationSpeedSelect = document.getElementById('animation-speed');
        animationSpeedSelect.addEventListener('change', (e) => {
            this.setAnimationSpeed(e.target.value);
        });

        // Tooltip settings
        const tooltipCheckbox = document.getElementById('show-tooltips');
        tooltipCheckbox.addEventListener('change', (e) => {
            this.showTooltips = e.target.checked;
            this.updateTooltipVisibility();
            this.saveSettings();
        });
    }

    initializeTooltips() {
        // Add tooltips to resources
        const resources = document.querySelectorAll('.resource');
        resources.forEach(resource => {
            const type = resource.querySelector('span:first-child').textContent.toLowerCase().replace(':', '');
            let tooltip = '';
            switch(type) {
                case 'oxygen':
                    tooltip = 'Current oxygen level / Maximum storage capacity';
                    break;
                case 'credits':
                    tooltip = 'Currency earned from selling oxygen';
                    break;
                case 'research':
                    tooltip = 'Points earned from scientific discoveries';
                    break;
                case 'artifacts':
                    tooltip = 'Alien technology found during expeditions';
                    break;
                case 'population':
                    tooltip = 'Number of colonists in your settlement';
                    break;
                case 'day':
                    tooltip = 'Days survived on the colony';
                    break;
            }
            resource.setAttribute('data-tooltip', tooltip);
        });
    }

    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
        document.body.className = `animation-speed-${speed}`;
        this.saveSettings();
    }

    updateTooltipVisibility() {
        document.body.classList.toggle('show-tooltips', this.showTooltips);
    }

    setAutoSave(interval) {
        this.autoSaveInterval = parseInt(interval);
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        if (this.autoSaveInterval > 0) {
            this.autoSaveTimer = setInterval(() => this.saveGame(), this.autoSaveInterval);
            console.log(`Auto-save set to ${this.autoSaveInterval}ms`);
        }
        this.saveSettings();
    }

    showSaveNotification() {
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.textContent = 'Game saved!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    setFontSize(size) {
        this.fontSize = size;
        document.documentElement.style.fontSize = size + '%';
        this.saveSettings();
    }

    setHighContrast(enabled) {
        this.highContrast = enabled;
        if (enabled) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        this.saveSettings();
    }

    setTheme(theme) {
        // Remove previous theme
        document.body.classList.remove('theme-' + this.currentTheme);
        // Add new theme
        this.currentTheme = theme;
        document.body.classList.add('theme-' + theme);
        this.saveSettings();

        // Update game visuals based on theme
        this.updateGameVisuals(theme);
    }

    updateGameVisuals(theme) {
        const extractor = document.getElementById('oxygen-extractor');
        if (theme === 'dark' || theme === 'cyberpunk') {
            extractor.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.2)';
        } else if (theme === 'light') {
            extractor.style.boxShadow = '0 0 30px rgba(33, 150, 243, 0.2)';
        } else if (theme === 'nature') {
            extractor.style.boxShadow = '0 0 30px rgba(76, 175, 80, 0.2)';
        } else if (theme === 'retro') {
            extractor.style.boxShadow = '0 0 30px rgba(255, 183, 77, 0.2)';
        } else {
            extractor.style.boxShadow = '0 0 30px rgba(33, 150, 243, 0.2)';
        }
    }

    saveGame() {
        const gameState = {
            oxygen: this.game.oxygen,
            maxOxygen: this.game.maxOxygen,
            credits: this.game.credits,
            oxygenPerClick: this.game.oxygenPerClick,
            autoOxygenRate: this.game.autoOxygenRate,
            alienArtifacts: this.game.alienArtifacts,
            researchPoints: this.game.researchPoints,
            colonyPopulation: this.game.colonyPopulation,
            daysSurvived: this.game.daysSurvived,
            upgrades: this.game.upgrades,
            storyEvents: this.game.storyEvents,
            settings: {
                autoSaveInterval: this.autoSaveInterval,
                currentTheme: this.currentTheme,
                fontSize: this.fontSize,
                highContrast: this.highContrast,
                showTooltips: this.showTooltips,
                animationSpeed: this.animationSpeed,
                autoSellThreshold: this.autoSellThreshold
            },
            lastSaveTime: Date.now()
        };

        try {
            localStorage.setItem('oxygenFactory_gameState', JSON.stringify(gameState));
            console.log('Game saved successfully:', new Date().toLocaleTimeString());
        } catch (error) {
            console.error('Error saving game:', error);
        }
    }

    loadGame() {
        try {
            const savedState = localStorage.getItem('oxygenFactory_gameState');
            if (savedState) {
                const gameState = JSON.parse(savedState);
                
                // Load game state
                Object.assign(this.game, {
                    oxygen: gameState.oxygen || 0,
                    maxOxygen: gameState.maxOxygen || 100,
                    credits: gameState.credits || 0,
                    oxygenPerClick: gameState.oxygenPerClick || 1,
                    autoOxygenRate: gameState.autoOxygenRate || 0,
                    alienArtifacts: gameState.alienArtifacts || 0,
                    researchPoints: gameState.researchPoints || 0,
                    colonyPopulation: gameState.colonyPopulation || 10,
                    daysSurvived: gameState.daysSurvived || 0,
                    upgrades: gameState.upgrades || {},
                    storyEvents: gameState.storyEvents || []
                });

                // Load settings
                if (gameState.settings) {
                    this.autoSaveInterval = gameState.settings.autoSaveInterval || 60000;
                    this.setTheme(gameState.settings.currentTheme || 'default');
                    this.setFontSize(gameState.settings.fontSize || 100);
                    this.setHighContrast(gameState.settings.highContrast || false);
                    this.showTooltips = gameState.settings.showTooltips ?? true;
                    this.setAnimationSpeed(gameState.settings.animationSpeed || 'normal');
                    this.autoSellThreshold = gameState.settings.autoSellThreshold || 0.9;
                }

                // Update UI
                this.game.updateDisplay();
                this.game.updateUpgradesList();
                console.log('Game loaded successfully:', new Date().toLocaleTimeString());
            }
        } catch (error) {
            console.error('Error loading game:', error);
        }
    }

    exportGame() {
        const gameState = {
            oxygen: this.game.oxygen,
            oxygenPerClick: this.game.oxygenPerClick,
            oxygenPerSecond: this.game.oxygenPerSecond,
            upgrades: this.game.upgrades,
            settings: {
                autoSaveInterval: this.autoSaveInterval,
                currentTheme: this.currentTheme,
                fontSize: this.fontSize,
                highContrast: this.highContrast,
                showTooltips: this.showTooltips,
                animationSpeed: this.animationSpeed,
                autoSellThreshold: this.autoSellThreshold
            },
            exportTime: Date.now()
        };

        const blob = new Blob([JSON.stringify(gameState, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `oxygen-factory-save-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importGame(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const gameState = JSON.parse(e.target.result);
                    this.loadGameState(gameState);
                    this.saveGame(); // Save the imported state to localStorage
                } catch (error) {
                    console.error('Error importing save file:', error);
                }
            };
            reader.readAsText(file);
        }
        event.target.value = ''; // Reset file input
    }

    resetGame() {
        if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
            localStorage.removeItem('gameState');
            location.reload();
        }
    }

    saveSettings() {
        const settings = {
            autoSaveInterval: this.autoSaveInterval,
            fontSize: this.fontSize,
            highContrast: this.highContrast,
            theme: this.currentTheme,
            showTooltips: this.showTooltips,
            animationSpeed: this.animationSpeed,
            autoSellThreshold: this.autoSellThreshold
        };
        localStorage.setItem('oxygenFactory_settings', JSON.stringify(settings));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('oxygenFactory_settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // Apply saved settings
            document.getElementById('auto-save').value = settings.autoSaveInterval;
            this.setAutoSave(settings.autoSaveInterval);

            document.getElementById('font-size').value = settings.fontSize;
            document.getElementById('font-size-value').textContent = settings.fontSize + '%';
            this.setFontSize(settings.fontSize);

            document.getElementById('high-contrast').checked = settings.highContrast;
            this.setHighContrast(settings.highContrast);

            document.getElementById('theme-select').value = settings.theme;
            this.setTheme(settings.theme);

            document.getElementById('show-tooltips').checked = settings.showTooltips;
            this.showTooltips = settings.showTooltips;
            this.updateTooltipVisibility();

            document.getElementById('animation-speed').value = settings.animationSpeed;
            this.setAnimationSpeed(settings.animationSpeed);

            document.getElementById('auto-sell').value = settings.autoSellThreshold;
            this.autoSellThreshold = settings.autoSellThreshold;
        } else {
            // Set default theme
            this.setTheme('default');
        }
    }
}

class OxygenFactory {
    constructor() {
        this.oxygen = 0;
        this.maxOxygen = 100;
        this.credits = 0;
        this.oxygenPerClick = 1;
        this.autoOxygenRate = 0;
        this.lastUpdate = Date.now();
        this.storyProgress = 0;
        this.alienArtifacts = 0;
        this.researchPoints = 0;
        this.colonyPopulation = 10;
        this.daysSurvived = 0;
        
        this.upgrades = {
            algaeDome: {
                name: "Algae Bio-Dome",
                description: "Generates oxygen passively",
                cost: 25,
                oxygenRate: 0.2,
                count: 0,
                unlocked: true,
                category: "basic"
            },
            deepCoreExtractor: {
                name: "Deep-Core Extractor",
                description: "Increases oxygen per click",
                cost: 50,
                clickBonus: 1,
                count: 0,
                unlocked: true,
                category: "basic"
            },
            cryoTank: {
                name: "Cryo Storage Tank",
                description: "Increases oxygen storage capacity",
                cost: 75,
                storageBonus: 100,
                count: 0,
                unlocked: true,
                category: "basic"
            },
            researchLab: {
                name: "Research Laboratory",
                description: "Generates research points from oxygen production",
                cost: 150,
                researchRate: 0.1,
                count: 0,
                unlocked: false,
                category: "research"
            },
            expeditionTeam: {
                name: "Expedition Team",
                description: "Searches ruins for alien artifacts",
                cost: 200,
                artifactRate: 0.05,
                count: 0,
                unlocked: false,
                category: "exploration"
            },
            aiDrone: {
                name: "AI Drone",
                description: "Automates oxygen collection",
                cost: 300,
                oxygenRate: 0.5,
                count: 0,
                unlocked: false,
                category: "automation"
            },
            habitationPod: {
                name: "Habitation Pod",
                description: "Increases colony population capacity",
                cost: 400,
                populationBonus: 5,
                count: 0,
                unlocked: false,
                category: "colony"
            },
            alienReactor: {
                name: "Alien Reactor Core",
                description: "Mysterious technology that boosts all production",
                cost: 1000,
                productionMultiplier: 1.5,
                artifactCost: 5,
                count: 0,
                unlocked: false,
                category: "alien"
            },
            terraformEngine: {
                name: "Terraforming Engine",
                description: "Slowly transforms the planet",
                cost: 2000,
                oxygenRate: 2,
                researchCost: 100,
                count: 0,
                unlocked: false,
                category: "endgame"
            }
        };

        this.storyEvents = [
            { trigger: 50, type: "oxygen", message: "Basic life support established. The colony's first week looks promising." },
            { trigger: 150, type: "oxygen", message: "Unusual energy readings detected from nearby geological formations..." },
            { trigger: 3, type: "population", message: "More colonists are requesting to join our successful operation." },
            { trigger: 20, type: "researchPoints", message: "Research team has made a breakthrough in understanding local mineral compositions." },
            { trigger: 1, type: "alienArtifacts", message: "First alien artifact discovered! It appears to be a data crystal of some kind." },
            { trigger: 5, type: "alienArtifacts", message: "Decoded artifacts reveal an ancient civilization that mastered atmospheric manipulation." },
            { trigger: 50, type: "population", message: "Colony has grown significantly. We're establishing a real foothold on this world." },
            { trigger: 100, type: "researchPoints", message: "Research suggests the planet was once terraformed by the ancient civilization." },
            { trigger: 10, type: "alienArtifacts", message: "Major discovery: Found plans for an advanced reactor design in the ruins." },
            { trigger: 1000, type: "oxygen", message: "With our current technology, we could attempt planetary terraforming..." }
        ];

        this.settings = new Settings(this);
        this.initializeGame();
        this.startDayCounter();
    }

    initializeGame() {
        document.getElementById('oxygen-extractor').addEventListener('click', () => this.generateOxygen());
        this.updateUpgradesList();
        this.gameLoop();
        this.addStoryMessage("Welcome to Colony X17. Your mission: ensure our survival.");
    }

    startDayCounter() {
        setInterval(() => {
            this.daysSurvived++;
            if (this.daysSurvived % 10 === 0) {
                this.addStoryMessage(`Day ${this.daysSurvived}: Colony continues to survive under your management.`);
            }
        }, 30000); // Each real-world 30 seconds represents one colony day
    }

    generateOxygen() {
        const generated = this.oxygenPerClick * (this.upgrades.alienReactor.count > 0 ? this.upgrades.alienReactor.productionMultiplier : 1);
        this.oxygen = Math.min(this.maxOxygen, this.oxygen + generated);
        
        // Generate research points from oxygen production
        this.researchPoints += this.upgrades.researchLab.count * this.upgrades.researchLab.researchRate;
        
        this.updateDisplay();
        
        const extractor = document.getElementById('oxygen-extractor');
        extractor.classList.add('pulse');
        setTimeout(() => extractor.classList.remove('pulse'), 200);
    }

    updateUpgradesList() {
        const upgradesList = document.getElementById('upgrades-list');
        upgradesList.innerHTML = '';

        // Group upgrades by category
        const categories = {
            basic: "Basic Operations",
            research: "Research & Development",
            exploration: "Exploration",
            automation: "Automation",
            colony: "Colony Management",
            alien: "Alien Technology",
            endgame: "Advanced Projects"
        };

        for (const [category, title] of Object.entries(categories)) {
            const categoryUpgrades = Object.entries(this.upgrades)
                .filter(([_, upgrade]) => upgrade.category === category && upgrade.unlocked);
            
            if (categoryUpgrades.length > 0) {
                const categoryElement = document.createElement('div');
                categoryElement.className = 'upgrade-category';
                categoryElement.innerHTML = `<h4 class="category-title">${title}</h4>`;
                
                categoryUpgrades.forEach(([id, upgrade]) => {
                    const upgradeElement = document.createElement('div');
                    upgradeElement.className = 'upgrade-item';
                    let costText = `Cost: ${upgrade.cost} credits`;
                    if (upgrade.artifactCost) costText += ` + ${upgrade.artifactCost} artifacts`;
                    if (upgrade.researchCost) costText += ` + ${upgrade.researchCost} research`;
                    
                    upgradeElement.innerHTML = `
                        <h4>${upgrade.name} (${upgrade.count})</h4>
                        <p>${upgrade.description}</p>
                        <p>${costText}</p>
                    `;
                    upgradeElement.onclick = () => this.purchaseUpgrade(id);
                    categoryElement.appendChild(upgradeElement);
                });
                
                upgradesList.appendChild(categoryElement);
            }
        }
    }

    purchaseUpgrade(upgradeId) {
        const upgrade = this.upgrades[upgradeId];
        const canAffordCredits = this.credits >= upgrade.cost;
        const canAffordArtifacts = !upgrade.artifactCost || this.alienArtifacts >= upgrade.artifactCost;
        const canAffordResearch = !upgrade.researchCost || this.researchPoints >= upgrade.researchCost;

        if (canAffordCredits && canAffordArtifacts && canAffordResearch) {
            this.credits -= upgrade.cost;
            if (upgrade.artifactCost) this.alienArtifacts -= upgrade.artifactCost;
            if (upgrade.researchCost) this.researchPoints -= upgrade.researchCost;
            
            upgrade.count++;
            upgrade.cost = Math.floor(upgrade.cost * 1.5);

            // Apply upgrade effects
            if (upgrade.oxygenRate) {
                this.autoOxygenRate += upgrade.oxygenRate;
            }
            if (upgrade.clickBonus) {
                this.oxygenPerClick += upgrade.clickBonus;
            }
            if (upgrade.storageBonus) {
                this.maxOxygen += upgrade.storageBonus;
            }
            if (upgrade.populationBonus) {
                this.colonyPopulation += upgrade.populationBonus;
                this.addStoryMessage(`Colony population increased to ${this.colonyPopulation}`);
            }

            // Unlock new upgrades based on progress
            this.checkUpgradeUnlocks();
            this.updateUpgradesList();
            this.updateDisplay();
        }
    }

    checkUpgradeUnlocks() {
        if (this.credits >= 150 && !this.upgrades.researchLab.unlocked) {
            this.upgrades.researchLab.unlocked = true;
            this.addStoryMessage("New upgrade available: Research Laboratory");
        }
        if (this.researchPoints >= 10 && !this.upgrades.expeditionTeam.unlocked) {
            this.upgrades.expeditionTeam.unlocked = true;
            this.addStoryMessage("New upgrade available: Expedition Team");
        }
        if (this.credits >= 250 && !this.upgrades.aiDrone.unlocked) {
            this.upgrades.aiDrone.unlocked = true;
            this.addStoryMessage("New upgrade available: AI Drone");
        }
        if (this.colonyPopulation >= 20 && !this.upgrades.habitationPod.unlocked) {
            this.upgrades.habitationPod.unlocked = true;
            this.addStoryMessage("New upgrade available: Habitation Pod");
        }
        if (this.alienArtifacts >= 5 && !this.upgrades.alienReactor.unlocked) {
            this.upgrades.alienReactor.unlocked = true;
            this.addStoryMessage("New upgrade available: Alien Reactor Core");
        }
        if (this.researchPoints >= 100 && this.alienArtifacts >= 10 && !this.upgrades.terraformEngine.unlocked) {
            this.upgrades.terraformEngine.unlocked = true;
            this.addStoryMessage("New upgrade available: Terraforming Engine");
        }
    }

    sellOxygen() {
        if (this.oxygen >= 10) {
            const sellAmount = Math.min(10, this.oxygen);
            this.oxygen -= sellAmount;
            this.credits += sellAmount * (this.upgrades.alienReactor.count > 0 ? 1.5 : 1);
            this.updateDisplay();
        }
    }

    checkStoryProgress() {
        for (const event of this.storyEvents) {
            if (!event.shown) {
                let triggered = false;
                switch (event.type) {
                    case "oxygen":
                        triggered = this.oxygen >= event.trigger;
                        break;
                    case "population":
                        triggered = this.colonyPopulation >= event.trigger;
                        break;
                    case "researchPoints":
                        triggered = this.researchPoints >= event.trigger;
                        break;
                    case "alienArtifacts":
                        triggered = this.alienArtifacts >= event.trigger;
                        break;
                }
                if (triggered) {
                    this.addStoryMessage(event.message);
                    event.shown = true;
                }
            }
        }
    }

    addStoryMessage(message) {
        const storyContent = document.getElementById('story-content');
        const messageElement = document.createElement('p');
        messageElement.textContent = `Day ${this.daysSurvived}: ${message}`;
        storyContent.appendChild(messageElement);
        storyContent.scrollTop = storyContent.scrollHeight;
    }

    updateDisplay() {
        document.getElementById('oxygen').textContent = this.oxygen.toFixed(1);
        document.getElementById('maxOxygen').textContent = this.maxOxygen;
        document.getElementById('credits').textContent = Math.floor(this.credits);
        document.getElementById('research').textContent = Math.floor(this.researchPoints);
        document.getElementById('artifacts').textContent = Math.floor(this.alienArtifacts);
        document.getElementById('population').textContent = this.colonyPopulation;
        document.getElementById('days').textContent = this.daysSurvived;
    }

    gameLoop() {
        const now = Date.now();
        const delta = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;

        // Add resources from automatic sources
        const productionMultiplier = this.upgrades.alienReactor.count > 0 ? this.upgrades.alienReactor.productionMultiplier : 1;
        
        this.oxygen = Math.min(this.maxOxygen, this.oxygen + (this.autoOxygenRate * productionMultiplier * delta));
        
        if (this.upgrades.expeditionTeam.count > 0) {
            this.alienArtifacts += this.upgrades.expeditionTeam.artifactRate * this.upgrades.expeditionTeam.count * delta;
        }

        // Auto-sell oxygen if storage is near full (90% capacity)
        if (this.oxygen >= this.maxOxygen * 0.9) {
            this.sellOxygen();
        }

        this.checkStoryProgress();
        this.updateDisplay();
        this.checkUpgradeUnlocks();

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game
const game = new OxygenFactory();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        game.generateOxygen();
    } else if (e.code === 'KeyS') {
        game.sellOxygen();
    }
}); 