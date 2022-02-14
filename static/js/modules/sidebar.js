/**
 * Sidebar UI component
 * This depends on using the template which is documented above
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

  const SIDEBAR_DEFAULT_COLOR = 'white';
  class Sidebar {
    constructor({
      direction = SidebarDirection.RIGHT,
      color = SIDEBAR_DEFAULT_COLOR
    } = {}) {
      this.direction = direction;
      this.color = color;
      this.state = {
        templateRendered: false,
        sidebarEl: null,
        isShown: false
      };

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
      sidebarPanelEl.classList.add(
        `${ClassNames.SIDEBAR_PANEL}--${this.direction}`
      );

      if (this.color) {
        sidebarPanelEl.style.backgroundColor = this.color;
      }
      document.body.prepend(sidebarEl);
      document.head.append(this._createSidebarStyles());

      this._updateState({
        templateRendered: true,
        sidebarEl,
        sidebarPanelEl
      });

      this._bindEvents();
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

      .sidebar__panel {
        background: white;
        position: absolute;
        padding: 2rem;
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

  return Sidebar;
})();
