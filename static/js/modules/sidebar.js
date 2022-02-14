const SIDEBAR_TEMPLATE_ID = 'sidebar-template';

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
  BOTTOM: 'bottom'
};

// Sidebar template (needs to be put in the html file or dynamically loaded)
/* 
 <script id="sidebar-template" type="text/template">
      <div class="js-sidebar sidebar">
        <div class="sidebar__panel js-sidebar__panel">
          <!-- sidebar content goes here-->
        </div>
      </div>
    </script>
*/

/**
 * Sidebar UI component
 * This depends on using the template which is documented above
 */
const Sidebar = (() => {
  class Sidebar {
    constructor(direction = SidebarDirection.RIGHT) {
      this.direction = direction;
      this.state = {
        templateRendered: false,
        sidebarEl: null,
        isShown: false
      };

      this._renderTemplate();
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

      const template = document.getElementById(SIDEBAR_TEMPLATE_ID);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = template.textContent;

      const sidebarEl = wrapper.querySelector(`.${ClassNames.SIDEBAR}`);
      const sidebarPanelEl = wrapper.querySelector(
        `.${ClassNames.SIDEBAR_PANEL_JS}`
      );
      sidebarPanelEl.classList.add(
        `${ClassNames.SIDEBAR_PANEL}--${this.direction}`
      );

      document.body.prepend(sidebarEl);

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

    _updateState(newPartialState) {
      this.state = { ...this.state, ...newPartialState };
    }
  }

  return Sidebar;
})();
