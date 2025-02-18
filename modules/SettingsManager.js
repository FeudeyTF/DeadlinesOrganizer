class SettingsManager {
    constructor() {
        this.defaultSettings = {
            colorPalette: {
                primary: '#4a90e2',
                primaryDark: '#357abd',
                secondary: '#f5f6fa',
                accent: '#2ecc71',
                warning: '#f1c40f',
                danger: '#e74c3c',
                text: '#2c3e50'
            }
        };
        
        this.settings = this.loadSettings();
        // Apply settings immediately when constructed
        this.applySettings();
        this.initializeEventListeners();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('appSettings');
        return savedSettings ? JSON.parse(savedSettings) : this.defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('appSettings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        const root = document.documentElement;
        const colors = this.settings.colorPalette;
        
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--${this.kebabCase(key)}-color`, value);
        });

        // Dispatch event for other components that might need to react to settings changes
        window.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { settings: this.settings }
        }));
    }

    resetSettings() {
        this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
        this.saveSettings();
        this.populateSettingsForm();
    }

    initializeEventListeners() {
        // Ensure DOM is loaded before trying to access elements
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeSettings());
        } else {
            this.initializeSettings();
        }
    }

    initializeSettings() {
        // First generate the color settings HTML
        this.generateColorSettings();
        // Then populate the form with current values
        this.populateSettingsForm();
        // Then initialize tabs and color pickers
        this.initializeTabs();
        this.initializeColorPickers();

        const settingsForm = document.getElementById('settingsForm');
        const resetButton = document.getElementById('resetSettings');

        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettingsFromForm();
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to reset all settings to default?')) {
                    this.resetSettings();
                }
            });
        }
    }

    generateColorSettings() {
        const container = document.getElementById('colorSettingsGrid');
        if (!container) return;

        const colorLabels = {
            primary: 'Primary Color',
            primaryDark: 'Primary Dark',
            secondary: 'Secondary Color',
            accent: 'Accent Color',
            warning: 'Warning Color',
            danger: 'Danger Color',
            text: 'Text Color'
        };

        container.innerHTML = Object.entries(colorLabels)
            .map(([key, label]) => `
                <div class="color-setting">
                    <div class="color-setting-header">
                        <label for="settings-${this.kebabCase(key)}">${label}</label>
                        <span class="color-value" data-color="${key}"></span>
                    </div>
                    <div class="color-preview" style="height: 60px" data-for="settings-${this.kebabCase(key)}"></div>
                    <input type="color" id="settings-${this.kebabCase(key)}" data-setting="${key}">
                </div>
            `).join('');
    }

    initializeTabs() {
        const tabs = document.querySelectorAll('.settings-tab');
        const panels = document.querySelectorAll('.settings-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.getAttribute('data-tab');
                
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                document.querySelector(`.settings-panel[data-panel="${targetPanel}"]`)
                    .classList.add('active');
            });
        });
    }

    initializeColorPickers() {
        const colorSettings = document.querySelectorAll('.color-setting');
        const colors = this.settings.colorPalette;
        
        colorSettings.forEach(setting => {
            const input = setting.querySelector('input[type="color"]');
            const preview = setting.querySelector('.color-preview');
            const valueDisplay = setting.querySelector('.color-value');

            if (input && preview) {
                // Get color key from data-setting attribute
                const colorKey = input.getAttribute('data-setting');
                const currentColor = colors[colorKey] || this.defaultSettings.colorPalette[colorKey];

                // Set initial values
                input.value = currentColor;
                preview.style.backgroundColor = currentColor;
                if (valueDisplay) {
                    valueDisplay.textContent = currentColor.toUpperCase();
                }

                // Update preview and value display
                const updateColor = (color) => {
                    preview.style.backgroundColor = color;
                    if (valueDisplay) {
                        valueDisplay.textContent = color.toUpperCase();
                    }
                    document.documentElement.style.setProperty(
                        `--${this.kebabCase(colorKey)}-color`,
                        color
                    );
                };

                // Click preview to open color picker
                preview.addEventListener('click', () => {
                    input.click();
                });

                // Update on color change
                input.addEventListener('input', (e) => {
                    updateColor(e.target.value);
                });
            }
        });
    }

    populateSettingsForm() {
        Object.entries(this.settings.colorPalette).forEach(([key, value]) => {
            const input = document.querySelector(`#settings-${this.kebabCase(key)}`);
            if (input) {
                input.value = value;
            }
        });
    }

    saveSettingsFromForm() {
        const newColors = {};
        Object.keys(this.settings.colorPalette).forEach(key => {
            const input = document.querySelector(`#settings-${this.kebabCase(key)}`);
            if (input) {
                newColors[key] = input.value;
            }
        });

        this.settings.colorPalette = newColors;
        this.saveSettings();

        // Show success message
        if (window.notificationManager) {
            window.notificationManager.success('Settings saved successfully');
        }
    }

    kebabCase(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }
}
