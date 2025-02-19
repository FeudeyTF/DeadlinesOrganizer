class SettingsManager {
    constructor() {
        this.prebuiltPalettes = {
            Light: {
                primary: '#4a90e2',
                primaryDark: '#357abd',
                secondary: '#f5f6fa',
                accent: '#2ecc71',
                warning: '#f1c40f',
                danger: '#e74c3c',
                text: '#2c3e50',
                secondaryText: '#2c3e50',
                dashboardItem: '#ffffff',
                dashboardItemHover: '#f8f9fa',
                dashboardItemActive: '#e9ecef',
                modalBackground: '#ffffff'
            },
            Dark: {
                primary: '#3498db',
                primaryDark: '#2980b9',
                secondary: '#2c3e50',
                accent: '#27ae60',
                warning: '#f39c12',
                danger: '#c0392b',
                text: '#ecf0f1',
                secondaryText: '#2c3e50',
                dashboardItem: '#2c3e50',
                dashboardItemHover: '#34495e',
                dashboardItemActive: '#2980b9',
                modalBackground: '#34495e'
            },
            SoftDark: {
                primary: '#6c5ce7',
                primaryDark: '#5849c2',
                secondary: '#2d3436',
                accent: '#00b894',
                warning: '#fdcb6e',
                danger: '#d63031',
                text: '#dfe6e9',
                secondaryText: '#2c3e50',
                dashboardItem: '#2d3436',
                dashboardItemHover: '#353b48',
                dashboardItemActive: '#5849c2',
                modalBackground: '#353b48'
            },
            Ocean: {
                primary: '#00BCD4',
                primaryDark: '#0097A7',
                secondary: '#78909C',
                accent: '#009688',
                warning: '#FFB300',
                danger: '#FF5252',
                text: '#263238',
                secondaryText: '#607D8B',
                dashboardItem: '#E0F7FA',
                modalBackground: '#ECEFF1'
            },
            Monokai: {
                primary: '#66D9EF',
                primaryDark: '#49B6CD',
                secondary: '#75715E',
                accent: '#A6E22E',
                warning: '#FD971F',
                danger: '#F92672',
                text: '#F8F8F2',
                secondaryText: '#919288',
                dashboardItem: '#272822',
                modalBackground: '#1E1F1C'
            },
            Coffee: {
                primary: '#6F4E37',     // coffee brown
                primaryDark: '#513726',  // dark roast
                secondary: '#8B7355',    // mocha
                accent: '#C4A484',       // coffee cream
                warning: '#DAA520',      // golden brown
                danger: '#800000',       // deep maroon
                text: '#2C1810',         // dark coffee
                secondaryText: '#5C4033', // milk chocolate
                dashboardItem: '#FFF5E6', // creamy white
                dashboardItemHover: '#FFE6CC',
                dashboardItemActive: '#D2B48C',
                modalBackground: '#FFF8DC' // cream
            }
        };

        this.defaultSettings = {
            colorPalette: this.prebuiltPalettes.Light
        };
        
        this.settings = this.loadSettings();
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
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeSettings());
        } else {
            this.initializeSettings();
        }
    }

    initializeSettings() {
        this.generateColorSettings();
        this.populateSettingsForm();
        this.initializePaletteSelector();
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

    initializePaletteSelector() {
        const container = document.querySelector('.palette-previews');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.prebuiltPalettes).forEach(([paletteName, palette]) => {
            const option = document.createElement('div');
            option.className = 'palette-option';
            option.setAttribute('data-palette', paletteName);
            option.title = `${paletteName} Theme`;

            const pie = document.createElement('div');
            pie.className = 'palette-pie';

            const svg = `
                <svg viewBox="0 0 32 32">
                    <circle r="16" cx="16" cy="16" fill="${palette.primary}"/>
                    <path d="M16 16L16 0A16 16 0 0 1 29.8 24L16 16Z" fill="${palette.accent}"/>
                    <path d="M16 16L29.8 24A16 16 0 0 1 16 32L16 16Z" fill="${palette.warning}"/>
                </svg>
            `;
            pie.innerHTML = svg;
            option.appendChild(pie);
            container.appendChild(option);
        });

        const previewWindow = document.createElement('div');
        previewWindow.className = 'theme-preview-window';
        previewWindow.innerHTML = `
            <div class="preview-header">
                <span class="preview-title">Theme Preview</span>
                <button class="preview-apply">Apply Theme</button>
                <button class="preview-close">&times;</button>
            </div>
            <div class="preview-content">
                <div class="preview-card">
                    <div class="card-header">Example Card</div>
                    <div class="card-content">
                        <div class="preview-button btn-primary">Primary Button</div>
                        <div class="preview-button btn-secondary">Secondary Button</div>
                        <div class="preview-alert warning">Warning Message</div>
                        <div class="preview-alert danger">Error Message</div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(previewWindow);

        let currentPreviewPalette = null;

        const paletteOptions = document.querySelectorAll('.palette-option');
        paletteOptions.forEach(option => {
            option.addEventListener('click', () => {
                const paletteName = option.getAttribute('data-palette');
                const palette = this.prebuiltPalettes[paletteName];
                
                paletteOptions.forEach(opt => opt.classList.remove('active'));
                
                if (currentPreviewPalette === paletteName) {
                    previewWindow.classList.remove('active');
                    this.applySettings();
                    currentPreviewPalette = null;
                } else {
                    option.classList.add('active');
                    this.previewPalette(palette);
                    previewWindow.classList.add('active');
                    currentPreviewPalette = paletteName;
                }
            });
        });

        const closeBtn = previewWindow.querySelector('.preview-close');
        closeBtn.addEventListener('click', () => {
            previewWindow.classList.remove('active');
            this.applySettings();
            paletteOptions.forEach(opt => opt.classList.remove('active'));
            currentPreviewPalette = null;
        });

        const applyBtn = previewWindow.querySelector('.preview-apply');
        applyBtn.addEventListener('click', () => {
            if (currentPreviewPalette) {
                this.settings.colorPalette = {...this.prebuiltPalettes[currentPreviewPalette]};
                this.saveSettings();
                this.populateSettingsForm();
                this.updateColorPickers();
                previewWindow.classList.remove('active');
                if (window.notificationManager) {
                    window.notificationManager.success('Theme applied successfully');
                }
            }
        });
    }

    previewPalette(palette) {
        const root = document.documentElement;
        
        if (!this._originalValues) {
            this._originalValues = {};
            Object.keys(palette).forEach(key => {
                this._originalValues[key] = getComputedStyle(root)
                    .getPropertyValue(`--${this.kebabCase(key)}-color`).trim();
            });
        }

        Object.entries(palette).forEach(([key, value]) => {
            root.style.setProperty(`--${this.kebabCase(key)}-color`, value);
        });
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
            text: 'Text Color',
            secondaryText: 'Secondary Text Color',
            dashboardItem: 'Dashboard Block Background',
            modalBackground: 'Modal Background'
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
                const colorKey = input.getAttribute('data-setting');
                const currentColor = colors[colorKey] || this.defaultSettings.colorPalette[colorKey];

                input.value = currentColor;
                preview.style.backgroundColor = currentColor;
                if (valueDisplay) {
                    valueDisplay.textContent = currentColor.toUpperCase();
                }

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

                preview.addEventListener('click', () => {
                    input.click();
                });

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

        if (window.notificationManager) {
            window.notificationManager.success('Settings saved successfully');
        }
    }

    updateColorPickers() {
        const colorSettings = document.querySelectorAll('.color-setting');
        const colors = this.settings.colorPalette;
        
        colorSettings.forEach(setting => {
            const input = setting.querySelector('input[type="color"]');
            const preview = setting.querySelector('.color-preview');
            const valueDisplay = setting.querySelector('.color-value');
            const colorKey = input?.getAttribute('data-setting');

            if (input && preview && colorKey && colors[colorKey]) {
                input.value = colors[colorKey];
                preview.style.backgroundColor = colors[colorKey];
                if (valueDisplay) {
                    valueDisplay.textContent = colors[colorKey].toUpperCase();
                }
            }
        });
    }

    kebabCase(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }
}
