(function () {
  "use strict";

  const SELECTORS = {
    reference: '[fs-selectcustom-element^="dropdown"]',
    label: '[fs-selectcustom-element^="label"]',
    clearOption: '[fs-selectcustom-element^="clear"]',
    resetFallback:
      '[fs-selectcustom-element^="option-reset"]',

    webflowDropdown: ".w-dropdown",
    webflowToggle: ".w-dropdown-toggle",
    webflowList: ".w-dropdown-list",
  };

  const CLASSES = {
    current: "w--current",
    open: "w--open",
  };

  const ATTRIBUTES = {
    hideInitial: "fs-selectcustom-hideinitial",
    initialized: "data-selectcustom-initialized",
  };

  const KEYS = {
    space: " ",
    tab: "Tab",
    arrowUp: "ArrowUp",
    arrowDown: "ArrowDown",
  };

  /**
   * Dispatches bubbling DOM events.
   */
  function dispatchEvents(element, eventNames) {
    eventNames.forEach((eventName) => {
      element.dispatchEvent(
        new Event(eventName, {
          bubbles: true,
        })
      );
    });
  }

  /**
   * Finds the first non-empty text node.
   */
  function findFirstTextNode(element) {
    for (const node of element.childNodes) {
      if (
        node.nodeType === Node.TEXT_NODE &&
        node.textContent &&
        node.textContent.trim()
      ) {
        return node;
      }

      if (node instanceof HTMLElement) {
        const nestedTextNode =
          findFirstTextNode(node);

        if (nestedTextNode) {
          return nestedTextNode;
        }
      }
    }

    return null;
  }

  /**
   * Replaces the visible text inside an element.
   */
  function setElementText(element, text) {
    const textNode =
      findFirstTextNode(element);

    if (textNode) {
      textNode.textContent = text;
      return;
    }

    element.textContent = text;
  }

  /**
   * Simulates a Webflow dropdown toggle click.
   */
  function activateToggle(
    toggle,
    focusToggle = true
  ) {
    if (focusToggle) {
      toggle.focus();
    }

    toggle.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      })
    );

    toggle.dispatchEvent(
      new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
      })
    );
  }

  /**
   * Finds all elements required for one custom select.
   */
  function collectSettings(referenceElement) {
    const dropdown =
      referenceElement.closest(
        SELECTORS.webflowDropdown
      );

    if (!dropdown) {
      console.warn(
        "Select Custom: reference element is not inside a Webflow dropdown.",
        referenceElement
      );

      return null;
    }

    const select =
      dropdown.querySelector("select");

    const toggle =
      dropdown.querySelector(
        SELECTORS.webflowToggle
      );

    const list =
      dropdown.querySelector(
        SELECTORS.webflowList
      );

    if (!select || !toggle || !list) {
      console.warn(
        "Select Custom: dropdown is missing a select, toggle, or list.",
        dropdown
      );

      return null;
    }

    const label =
      toggle.querySelector(SELECTORS.label) ||
      toggle.querySelector(".date-text") ||
      findFirstTextNode(toggle) ||
      toggle;

    const excludedTemplates = [
      SELECTORS.clearOption,
      SELECTORS.resetFallback,
    ].join(", ");

    const optionTemplate =
      list.querySelector(
        `a:not(${excludedTemplates})`
      );

    if (
      !(
        optionTemplate instanceof
        HTMLAnchorElement
      )
    ) {
      console.warn(
        "Select Custom: no option template was found.",
        dropdown
      );

      return null;
    }

    const optionsContainer =
      optionTemplate.parentElement;

    if (!optionsContainer) {
      return null;
    }

    const resetTemplate =
      list.querySelector(excludedTemplates);

    const hideInitial =
      referenceElement.getAttribute(
        ATTRIBUTES.hideInitial
      ) === "true";

    /*
     * Save clean copies before removing
     * the Webflow template elements.
     */
    const optionTemplateClone =
      optionTemplate.cloneNode(true);

    const resetTemplateClone =
      resetTemplate
        ? resetTemplate.cloneNode(true)
        : null;

    optionTemplate.remove();
    resetTemplate?.remove();

    return {
      referenceElement,
      dropdown,
      select,
      toggle,
      list,
      label,
      optionsContainer,
      optionTemplate:
        optionTemplateClone,
      resetTemplate:
        resetTemplateClone,
      options: [],
      hideInitial,
      isSyncing: false,
    };
  }

  /**
   * Shows Reset only when a real value is selected.
   *
   * Empty field:
   * - Reset is hidden
   *
   * Filled field:
   * - Reset is visible
   */
  function updateInitialOptionVisibility(
    settings
  ) {
    /*
     * Only control the empty option when:
     * - a Reset template exists, or
     * - hideinitial is enabled.
     */
    if (
      !settings.resetTemplate &&
      !settings.hideInitial
    ) {
      return;
    }

    const emptyOption =
      settings.options.find(
        (option) => option.value === ""
      );

    if (!emptyOption) {
      return;
    }

    const hasSelectedValue =
      settings.select.value !== "";

    /*
     * Show Reset after selecting a value.
     * Hide Reset when the field is empty.
     */
    emptyOption.hidden =
      !hasSelectedValue;

    emptyOption.element.style.display =
      hasSelectedValue ? "" : "none";

    emptyOption.element.setAttribute(
      "aria-hidden",
      String(!hasSelectedValue)
    );

    if (!hasSelectedValue) {
      emptyOption.element.setAttribute(
        "tabindex",
        "-1"
      );
    }
  }

  /**
   * Selects a custom option.
   */
  function selectOption(
    settings,
    selectedOption,
    updateNativeSelect = true
  ) {
    if (!selectedOption) {
      return;
    }

    if (updateNativeSelect) {
      settings.isSyncing = true;

      settings.select.value =
        selectedOption.value;

      dispatchEvents(
        settings.select,
        ["input", "change"]
      );

      settings.isSyncing = false;
    }

    settings.options.forEach((option) => {
      const isSelected =
        option === selectedOption;

      option.selected = isSelected;

      option.element.classList.toggle(
        CLASSES.current,
        isSelected
      );

      option.element.setAttribute(
        "aria-selected",
        String(isSelected)
      );

      option.element.setAttribute(
        "tabindex",
        isSelected ? "0" : "-1"
      );

      if (isSelected) {
        option.element.setAttribute(
          "aria-current",
          "true"
        );
      } else {
        option.element.removeAttribute(
          "aria-current"
        );
      }
    });

    if (settings.label instanceof Node) {
      settings.label.textContent =
        selectedOption.text;
    }

    updateInitialOptionVisibility(
      settings
    );
  }

  /**
   * Rebuilds custom options from the native select.
   */
  function populateOptions(settings) {
    settings.options.forEach((option) => {
      option.element.remove();
    });

    settings.options = [];

    let selectedOption = null;

    Array.from(
      settings.select.options
    ).forEach((nativeOption) => {
      const useResetTemplate =
        nativeOption.value === "" &&
        settings.resetTemplate;

      const template =
        useResetTemplate
          ? settings.resetTemplate
          : settings.optionTemplate;

      const customElement =
        template.cloneNode(true);

      if (!useResetTemplate) {
        setElementText(
          customElement,
          nativeOption.text
        );
      }

      customElement.href = "#";

      customElement.setAttribute(
        "role",
        "option"
      );

      customElement.setAttribute(
        "tabindex",
        "-1"
      );

      customElement.removeAttribute(
        "aria-current"
      );

      settings.optionsContainer.appendChild(
        customElement
      );

      const option = {
        text: nativeOption.text,
        value: nativeOption.value,
        element: customElement,

        selected:
          nativeOption.value ===
          settings.select.value,

        focused: false,
        hidden: false,
      };

      if (option.selected) {
        selectedOption = option;
      }

      settings.options.push(option);
    });

    /*
     * Fall back to the empty option
     * or the first available option.
     */
    if (!selectedOption) {
      selectedOption =
        settings.options.find(
          (option) =>
            option.value === ""
        ) ||
        settings.options[0];
    }

    selectOption(
      settings,
      selectedOption,
      false
    );
  }

  /**
   * Finds the custom option related to an event.
   */
  function getOptionFromEvent(
    event,
    settings
  ) {
    if (
      !(event.target instanceof Element)
    ) {
      return null;
    }

    const anchor =
      event.target.closest("a");

    if (!anchor) {
      return null;
    }

    return (
      settings.options.find(
        (option) =>
          option.element === anchor
      ) || null
    );
  }

  /**
   * Handles option clicks.
   */
  function handleListClick(
    event,
    settings
  ) {
    const option =
      getOptionFromEvent(
        event,
        settings
      );

    if (!option) {
      return;
    }

    event.preventDefault();

    if (!option.selected) {
      selectOption(
        settings,
        option,
        true
      );
    }

    activateToggle(settings.toggle);
  }

  /**
   * Tracks the currently focused option.
   */
  function handleFocusChange(
    event,
    focused,
    settings
  ) {
    const option =
      getOptionFromEvent(
        event,
        settings
      );

    if (option) {
      option.focused = focused;
    }
  }

  /**
   * Moves keyboard focus through options.
   */
  function moveOptionFocus(
    key,
    settings
  ) {
    const currentIndex =
      settings.options.findIndex(
        (option) => option.focused
      );

    if (currentIndex < 0) {
      return;
    }

    const direction =
      key === KEYS.arrowUp
        ? -1
        : 1;

    let nextIndex =
      currentIndex + direction;

    while (
      nextIndex >= 0 &&
      nextIndex <
        settings.options.length
    ) {
      const nextOption =
        settings.options[nextIndex];

      if (!nextOption.hidden) {
        nextOption.element.focus();
        return;
      }

      nextIndex += direction;
    }
  }

  /**
   * Handles keyboard input inside the option list.
   */
  function handleListKeydown(
    event,
    settings
  ) {
    switch (event.key) {
      case KEYS.space:
        handleListClick(
          event,
          settings
        );
        break;

      case KEYS.tab:
        if (event.shiftKey) {
          event.preventDefault();
        }

        activateToggle(
          settings.toggle,
          event.shiftKey
        );
        break;

      case KEYS.arrowUp:
      case KEYS.arrowDown:
        event.preventDefault();

        moveOptionFocus(
          event.key,
          settings
        );
        break;
    }
  }

  /**
   * Focuses the first visible option
   * when ArrowDown is pressed.
   */
  function handleToggleKeydown(
    event,
    settings
  ) {
    if (
      event.key !==
      KEYS.arrowDown
    ) {
      return;
    }

    const firstVisibleOption =
      settings.options.find(
        (option) =>
          !option.hidden
      );

    firstVisibleOption?.element.focus();
  }

  /**
   * Synchronizes the custom UI when
   * another script changes the native select.
   */
  function handleNativeSelectChange(
    settings
  ) {
    if (settings.isSyncing) {
      return;
    }

    const selectedOption =
      settings.options.find(
        (option) =>
          option.value ===
          settings.select.value
      );

    if (selectedOption) {
      selectOption(
        settings,
        selectedOption,
        false
      );
    }
  }

/**
 * Resets one custom select without dispatching
 * input/change events for every individual field.
 *
 * The calculator performs one recalculation after
 * the complete group of fields has been reset.
 */
    function resetCustomSelect(settings) {
    const emptyOption = settings.options.find(
        (option) => option.value === ""
    );

    if (!emptyOption) {
        console.warn(
        "Select Custom: no empty option exists.",
        settings.select
        );

        return;
    }

    // Reset the real native select silently.
    settings.select.value = "";

    // Update the custom dropdown UI without firing
    // input and change events for this individual field.
    selectOption(
        settings,
        emptyOption,
        false
    );

    const isOpen =
        settings.toggle.getAttribute(
        "aria-expanded"
        ) === "true" ||
        settings.list.classList.contains(
        CLASSES.open
        );

    if (isOpen) {
        activateToggle(
        settings.toggle,
        false
        );
    }
    }

  /**
   * Adds listeners for one custom select.
   */
  function listenEvents(settings) {
    const onToggleKeydown =
      (event) => {
        handleToggleKeydown(
          event,
          settings
        );
      };

    const onListClick =
      (event) => {
        handleListClick(
          event,
          settings
        );
      };

    const onListKeydown =
      (event) => {
        handleListKeydown(
          event,
          settings
        );
      };

    const onFocusIn =
      (event) => {
        handleFocusChange(
          event,
          true,
          settings
        );
      };

    const onFocusOut =
      (event) => {
        handleFocusChange(
          event,
          false,
          settings
        );
      };

    const onNativeChange =
      () => {
        handleNativeSelectChange(
          settings
        );
      };

    const onReset =
      () => {
        resetCustomSelect(
          settings
        );
      };

    settings.toggle.addEventListener(
      "keydown",
      onToggleKeydown
    );

    settings.list.addEventListener(
      "click",
      onListClick
    );

    settings.list.addEventListener(
      "keydown",
      onListKeydown
    );

    settings.list.addEventListener(
      "focusin",
      onFocusIn
    );

    settings.list.addEventListener(
      "focusout",
      onFocusOut
    );

    settings.select.addEventListener(
      "change",
      onNativeChange
    );

    /*
     * Listen only on the Webflow dropdown.
     *
     * Reset events fired from the reference
     * element bubble up to this dropdown.
     */
    settings.dropdown.addEventListener(
      "selectcustom:reset",
      onReset
    );

    return function removeEventListeners() {
      settings.toggle.removeEventListener(
        "keydown",
        onToggleKeydown
      );

      settings.list.removeEventListener(
        "click",
        onListClick
      );

      settings.list.removeEventListener(
        "keydown",
        onListKeydown
      );

      settings.list.removeEventListener(
        "focusin",
        onFocusIn
      );

      settings.list.removeEventListener(
        "focusout",
        onFocusOut
      );

      settings.select.removeEventListener(
        "change",
        onNativeChange
      );

      settings.dropdown.removeEventListener(
        "selectcustom:reset",
        onReset
      );
    };
  }

  /**
   * Rebuilds options when native option elements change.
   */
  function observeNativeOptions(settings) {
    const observer =
      new MutationObserver(
        (mutations) => {
          const optionsChanged =
            mutations.some(
              (mutation) => {
                return [
                  ...mutation.addedNodes,
                  ...mutation.removedNodes,
                ].some(
                  (node) =>
                    node instanceof
                    HTMLOptionElement
                );
              }
            );

          if (optionsChanged) {
            populateOptions(settings);
          }
        }
      );

    observer.observe(
      settings.select,
      {
        childList: true,
      }
    );

    return function stopObserving() {
      observer.disconnect();
    };
  }

  /**
   * Keeps option focus aligned
   * when Webflow opens the dropdown.
   */
  function observeDropdownState(settings) {
    let timeoutId = null;

    const observer =
      new MutationObserver(() => {
        clearTimeout(timeoutId);

        timeoutId =
          window.setTimeout(() => {
            const isOpen =
              settings.toggle.getAttribute(
                "aria-expanded"
              ) === "true";

            if (!isOpen) {
              updateInitialOptionVisibility(
                settings
              );

              return;
            }

            const selectedOption =
              settings.options.find(
                (option) =>
                  option.selected
              );

            const firstVisibleOption =
              settings.options.find(
                (option) =>
                  !option.hidden
              );

            const optionToFocus =
              selectedOption?.hidden
                ? firstVisibleOption
                : selectedOption;

            optionToFocus?.element.focus();
          }, 20);
      });

    observer.observe(
      settings.list,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "style",
        ],
      }
    );

    return function stopObserving() {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }

  /**
   * Initializes one custom select.
   */
  function initCustomSelect(
    referenceElement
  ) {
    if (
      referenceElement.hasAttribute(
        ATTRIBUTES.initialized
      )
    ) {
      return null;
    }

    const settings =
      collectSettings(
        referenceElement
      );

    if (!settings) {
      return null;
    }

    referenceElement.setAttribute(
      ATTRIBUTES.initialized,
      "true"
    );

    settings.toggle.setAttribute(
      "aria-haspopup",
      "listbox"
    );

    settings.list.setAttribute(
      "role",
      "listbox"
    );

    settings.list.setAttribute(
      "aria-multiselectable",
      "false"
    );

    populateOptions(settings);

    const stopObservingNativeOptions =
      observeNativeOptions(settings);

    const stopObservingDropdown =
      observeDropdownState(settings);

    const removeEventListeners =
      listenEvents(settings);

    return function destroy() {
      stopObservingNativeOptions();
      stopObservingDropdown();
      removeEventListeners();

      referenceElement.removeAttribute(
        ATTRIBUTES.initialized
      );
    };
  }

  /**
   * Initializes every custom select.
   */
  function initSelectCustom() {
    const referenceElements =
      Array.from(
        document.querySelectorAll(
          SELECTORS.reference
        )
      );

    const cleanupFunctions =
      referenceElements
        .map(initCustomSelect)
        .filter(Boolean);

    /*
     * Public reset API.
     *
     * Reset all custom selects:
     *
     * window.selectCustomReadable.reset();
     *
     * Reset custom selects inside a trip:
     *
     * window.selectCustomReadable.reset(trip);
     */
    window.selectCustomReadable = {
      destroy() {
        cleanupFunctions.forEach(
          (cleanup) => {
            cleanup();
          }
        );
      },

      reset(scope = document) {
        scope
          .querySelectorAll(
            SELECTORS.reference
          )
          .forEach(
            (referenceElement) => {
              referenceElement.dispatchEvent(
                new CustomEvent(
                  "selectcustom:reset",
                  {
                    bubbles: true,
                  }
                )
              );
            }
          );
      },
    };
  }

  /*
   * Match Webflow initialization timing.
   */
  window.Webflow =
    window.Webflow || [];

  window.Webflow.push(
    initSelectCustom
  );
})();