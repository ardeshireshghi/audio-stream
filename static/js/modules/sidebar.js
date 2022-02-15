/**
 * Sidebar UI component
 */
const Sidebar = (() => {
  const ClassNames = {
    SIDEBAR: 'js-sidebar',
    SIDEBAR_PANEL_JS: 'js-sidebar__panel',
    SIDEBAR_PANEL: 'sidebar__panel',
    SIDEBAR_SHOWN: 'sidebar--shown',
    SIDEBAR_PANEL_BASE_ANIMATION_OUT: 'sidebar__panel--out-animation',
    SIDEBAR_PANEL_BASE_ANIMATION_IN: 'sidebar__panel--in-animation'
  };

  const SidebarDirection = {
    LEFT: 'left',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    TOP: 'top'
  };

  class Sidebar {
    constructor({
      direction = SidebarDirection.RIGHT,
      customClassName = '',
      panelStyles = {}
    } = {}) {
      this.direction = direction;
      this.customClassName = customClassName;
      this.panelStyles = panelStyles;

      this.state = {
        templateRendered: false,
        sidebarEl: null,
        isShown: false
      };
      this.id = `sidebar-panel-${Math.round(Math.random() * 10000000)}`;
      this._insertStyles();
      this._renderTemplate();
    }

    static get direction() {
      return SidebarDirection;
    }

    renderContent(elOrHTMLOrCollection) {
      if (
        (elOrHTMLOrCollection instanceof HTMLElement &&
          elOrHTMLOrCollection !== this.state.contentEl) ||
        elOrHTMLOrCollection instanceof HTMLCollection
      ) {
        this.state.sidebarPanelEl.innerHTML = '';
        this.state.sidebarPanelEl.append(
          ...(typeof elOrHTMLOrCollection[Symbol.iterator] !== 'function'
            ? [elOrHTMLOrCollection]
            : elOrHTMLOrCollection)
        );
      } else if (typeof elOrHTMLOrCollection === 'string') {
        this.state.sidebarPanelEl.innerHTML = elOrHTMLOrCollection;
      }
    }

    show() {
      if (this.state.isShown) {
        return;
      }

      const { sidebarEl, sidebarPanelEl } = this.state;

      sidebarEl.classList.toggle(ClassNames.SIDEBAR_SHOWN);
      sidebarPanelEl.classList.remove(
        `${ClassNames.SIDEBAR_PANEL_BASE_ANIMATION_OUT}--${this.direction}`
      );
      sidebarPanelEl.classList.add(
        `${ClassNames.SIDEBAR_PANEL_BASE_ANIMATION_IN}--${this.direction}`
      );

      this._updateState({
        isShown: true
      });
    }

    hide() {
      if (!this.state.isShown) {
        return;
      }

      const { sidebarEl, sidebarPanelEl } = this.state;

      sidebarPanelEl.classList.add(
        `${ClassNames.SIDEBAR_PANEL_BASE_ANIMATION_OUT}--${this.direction}`
      );
      sidebarPanelEl.classList.remove(
        `${ClassNames.SIDEBAR_PANEL_BASE_ANIMATION_IN}--${this.direction}`
      );

      sidebarPanelEl.addEventListener(
        'animationend',
        () => {
          sidebarEl.classList.toggle(ClassNames.SIDEBAR_SHOWN);
        },
        {
          once: true
        }
      );

      this._updateState({
        isShown: false
      });
    }

    _renderTemplate() {
      if (document.readyState === 'loading' || !document.body) {
        throw new Error('Document not ready, cannot access DOM');
      }

      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.template;

      const sidebarEl = wrapper.querySelector(`.${ClassNames.SIDEBAR}`);
      const sidebarPanelEl = wrapper.querySelector(
        `.${ClassNames.SIDEBAR_PANEL_JS}`
      );
      sidebarPanelEl.id = this.id;
      sidebarPanelEl.classList.add(
        `${ClassNames.SIDEBAR_PANEL}--${this.direction}`
      );

      // Adds custom class name to the panel
      if (this.customClassName !== '') {
        sidebarPanelEl.classList.add(this.customClassName);
      }

      document.body.prepend(sidebarEl);

      this._updateState({
        templateRendered: true,
        sidebarEl,
        sidebarPanelEl
      });

      this._bindEvents();
    }

    _insertStyles() {
      document.head.append(this._createSidebarStyles());

      // Add custom styles if they are defined
      if (Object.keys(this.panelStyles).length > 0) {
        this._insertPanelCustomStyles();
        return;
      }
    }

    _insertPanelCustomStyles() {
      insertCustomStyles(
        `#${this.id}.${ClassNames.SIDEBAR_PANEL}`,
        this.panelStyles
      );
    }

    _bindEvents() {
      const { sidebarEl, sidebarPanelEl } = this.state;

      // Close sidebar event
      sidebarEl.addEventListener('click', (event) => {
        if (
          event.target !== sidebarPanelEl &&
          event.target.contains(sidebarPanelEl)
        ) {
          this.hide();
        }
      });
    }

    _createSidebarStyles() {
      const style = document.createElement('style');
      style.innerHTML = this.styles;
      return style;
    }

    _updateState(newPartialState) {
      this.state = { ...this.state, ...newPartialState };
    }

    get styles() {
      return `
      .sidebar {
        position: fixed;
        z-index: 2000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: #41445c82;
        display: none;
      }

      .sidebar--shown {
        display: block;
      }

      #${this.id}.sidebar__panel {
        background-color: white;
        position: absolute;
        box-shadow: rgb(67 90 111 / 30%) 0px 0px 1px,
          rgb(67 90 111 / 47%) 0px 16px 24px -8px;

        transition: transform 0.25s ease;
        will-change: transform;
      }

      .sidebar__panel--right {
        transform: translateX(100%);
        right: 0;
        max-width: 90%;
        height: 100%;
        overflow: auto;
      }

      .sidebar__panel--bottom {
        transform: translateY(100%);
        bottom: 0;
        max-height: 90%;
        width: 100%;
      }

      .sidebar__panel--top {
        transform: translateY(-100%);
        top: 0;
        max-height: 90%;
        width: 100%;
      }

      .sidebar__panel--left {
        transform: translateX(-100%);
        left: 0;
        max-width: 90%;
        height: 100%;
        overflow: auto;
      }

      .sidebar__panel--in-animation--right {
        animation-duration: 0.35s;
        animation-fill-mode: forwards;
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        animation-name: slideInFromRight;
      }

      .sidebar__panel--out-animation--right {
        animation-duration: 0.25s;
        animation-fill-mode: forwards;
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        animation-name: slideOutFromRight;
      }

      .sidebar__panel--in-animation--left {
        animation-duration: 0.35s;
        animation-fill-mode: forwards;
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        animation-name: slideInFromLeft;
      }

      .sidebar__panel--out-animation--left {
        animation-duration: 0.25s;
        animation-fill-mode: forwards;
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        animation-name: slideOutFromLeft;
      }

      .sidebar__panel--in-animation--bottom {
        animation-duration: 0.35s;
        animation-fill-mode: forwards;
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        animation-name: slideInFromBottom;
      }

      .sidebar__panel--out-animation--bottom {
        animation-duration: 0.25s;
        animation-fill-mode: forwards;
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        animation-name: slideOutFromBottom;
      }

      .sidebar__panel--in-animation--top {
        animation-duration: 0.35s;
        animation-fill-mode: forwards;
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        animation-name: slideInFromTop;
      }

      .sidebar__panel--out-animation--top {
        animation-duration: 0.25s;
        animation-fill-mode: forwards;
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        animation-name: slideOutFromTop;
      }

      @keyframes slideInFromRight {
        0% {
          transform: translateX(100%);
        }

        100% {
          transform: translateX(0);
        }
      }

      @keyframes slideOutFromRight {
        0% {
          transform: translateX(0);
        }

        100% {
          transform: translateX(100%);
        }
      }

      @keyframes slideInFromLeft {
        0% {
          transform: translateX(-100%);
        }

        100% {
          transform: translateX(0);
        }
      }

      @keyframes slideOutFromLeft {
        0% {
          transform: translateX(0);
        }

        100% {
          transform: translateX(-100%);
        }
      }

      @keyframes slideInFromBottom {
        0% {
          transform: translateY(100%);
        }

        100% {
          transform: translateY(0);
        }
      }

      @keyframes slideOutFromBottom {
        0% {
          transform: translateY(0);
        }

        100% {
          transform: translateY(100%);
        }
      }

      @keyframes slideInFromTop {
        0% {
          transform: translateY(-100%);
        }

        100% {
          transform: translateY(0);
        }
      }

      @keyframes slideOutFromTop {
        0% {
          transform: translateY(0);
        }

        100% {
          transform: translateY(-100%);
        }
      }
      `;
    }

    get template() {
      return `<div class="js-sidebar sidebar">
        <div class="sidebar__panel js-sidebar__panel">
          <!-- sidebar content goes here-->
        </div>
      </div>`;
    }
  }

  /*
  * Styles are objects of key values and they can have media
  * queries as the keys
  * 
  * Example:
  * 
    {
      backgroundColor: '#fefeff',
      padding: '2rem',
      '@media screen and (max-width: 400px)': {
        padding: '1rem'
      }
    }
  */
  function insertCustomStyles(selector, styles) {
    const customStyles = document.createElement('style');
    document.head.appendChild(customStyles);

    const styleSheet = customStyles.sheet;

    Object.entries(styles).forEach(([ruleName, valueOrStyles]) => {
      const ruleKababCase = ruleName.replace(/([A-Z])/g, (match) =>
        `-${match}`.toLowerCase()
      );

      if (
        ruleKababCase.startsWith('@media') &&
        typeof valueOrStyles === 'object'
      ) {
        let rule = `
            ${ruleKababCase} {
              ${selector} {`;

        rule = Object.keys(valueOrStyles).reduce((result, mediaRuleName) => {
          const mediaRuleValue = valueOrStyles[mediaRuleName];
          const mediaRuleNameKababCase = mediaRuleName.replace(
            /([A-Z])/g,
            (match) => `-${match}`.toLowerCase()
          );

          result += `${mediaRuleNameKababCase}: ${mediaRuleValue};\n`;
          return result;
        }, rule);

        rule += `}
          }`;

        styleSheet.insertRule(rule, styleSheet.cssRules.length);
      } else {
        styleSheet.insertRule(
          `${selector} { ${ruleKababCase}: ${valueOrStyles}}`,
          styleSheet.cssRules.length
        );
      }
    });
  }

  return Sidebar;
})();
