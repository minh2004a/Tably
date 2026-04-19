function Tably(selector, options = {}) {
    this.container = document.querySelector(selector);
    if (!this.container) {
        console.error(`Tably: ${selector} does not exist`);
        return;
    }
    this.tabs = Array.from(this.container.querySelectorAll("li a"));
    if (!this.tabs.length) {
        console.error(`Tably: No tabs found in ${selector}`);
        return;
    }
    this.panels = this.getPanels();
    if (this.panels.includes(null)) return;
    this.opt = Object.assign(
        {
            remember: false,
            onChange: null,
        },
        options,
    );

    this.paramKey = selector.replace(/[^a-zA-Z0-9]/g, "");

    this._init();
}

Tably.prototype._init = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const tab =
        this.tabs.find(
            (tab) =>
                urlParams.get(this.paramKey) ===
                tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g, ""),
        ) || this.tabs[0];
    this._activateTab(tab, false);
    this._boundHandleClickTab = this._handleClickTab.bind(this);
    this.tabs.forEach((tab) => {
        tab.addEventListener("click", this._boundHandleClickTab);
    });
    this.currentTab = tab;
};

Tably.prototype.getPanels = function () {
    return this.tabs.map((tab) => {
        const panel = document.querySelector(tab.getAttribute("href"));
        if (!panel) {
            console.error(
                `Tably: Panel ${tab.getAttribute("href")} does not exist`,
            );
        }
        return panel;
    });
};

Tably.prototype._handleClickTab = function (e) {
    e.preventDefault();
    this._tryActivateTab(e.currentTarget);
};

Tably.prototype._tryActivateTab = function (tab, isClick = true) {
    if (tab !== this.currentTab) {
        this.currentTab = tab;
        this._activateTab(tab, isClick);
    }
};

Tably.prototype._activateTab = function (tab, isClick = true) {
    this.tabs.forEach((t) => {
        t.closest("li").classList.remove("tably--active");
    });
    tab.closest("li").classList.add("tably--active");

    this.panels.forEach((panel) => (panel.hidden = true));
    const panel = this.panels[this.tabs.indexOf(tab)];
    panel.hidden = false;

    if (isClick && typeof this.opt.onChange === "function") {
        this.opt.onChange({ tab, panel });
    }

    if (this.opt.remember) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set(
            this.paramKey,
            tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g, ""),
        );
        history.replaceState(null, null, `?${urlParams}`);
    }
};

Tably.prototype.switch = function (input) {
    let tab;
    if (typeof input === "string") {
        tab = this.tabs.find((tab) => tab.getAttribute("href") === input);
    } else if (this.tabs.includes(input)) {
        tab = input;
    }
    if (!tab) {
        console.error(`Tably: Tab ${input} not found`);
        return;
    }
    this._tryActivateTab(tab, false);
};

Tably.prototype.destroy = function () {
    this.tabs.forEach((tab) => {
        tab.removeEventListener("click", this._boundHandleClickTab);
    });

    this.tabs.forEach((tab) => {
        tab.closest("li").classList.remove("tably--active");
    });

    this.panels.forEach((panel) => (panel.hidden = false));
    this.tabs = null;
    this.panels = null;
    this.container = null;
    this._boundHandleClickTab = null;
    this.currentTab = null;
};
