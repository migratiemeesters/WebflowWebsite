function initCalculator() {
  const monthMap = {
    januari: 0, january: 0,
    februari: 1, february: 1,
    maart: 2, march: 2,
    april: 3,
    mei: 4, may: 4,
    juni: 5, june: 5,
    juli: 6, july: 6,
    augustus: 7, august: 7,
    september: 8,
    oktober: 9, october: 9,
    november: 10,
    december: 11
  };

  function getSourceElement(key, scope = document) {
    return scope.querySelector(`[data-tempres-source="${key}"]`);
  }

  function getSource(key, scope = document) {
    const el = getSourceElement(key, scope);
    if (!el) return "";

    if (el.matches("input, select, textarea")) return String(el.value || "").trim();

    const nestedField = el.querySelector("input, select, textarea");
    if (nestedField) return String(nestedField.value || "").trim();

    return String(el.textContent || "").trim();
  }

  function getTripSource(part, group, scope) {
    const el = scope.querySelector(
      `:scope [data-trip-group="${group}"] [data-tempres-source="${part}"]`
    );

    if (!el) return "";

    if (el.matches("input, select, textarea")) return String(el.value || "").trim();

    const nestedField = el.querySelector("input, select, textarea");
    if (nestedField) return String(nestedField.value || "").trim();

    return String(el.textContent || "").trim();
  }

  function setOutput(key, value) {
    document.querySelectorAll(`[data-tempres-output="${key}"]`).forEach((el) => {
      el.textContent = value;
    });
  }

  function setStepComplete(stepNumber, isComplete) {
    document.querySelectorAll(`[data-step-icon="${stepNumber}"]`).forEach((el) => {
      el.classList.toggle("is-complete", !!isComplete);
    });
  }

  function setTripValidationMessage(messages) {
    setOutput("trip-validation-message", messages.length ? messages.join(" ") : "");
  }

  function isVisible(el) {
    return !!el && window.getComputedStyle(el).display !== "none";
  }

  function hide(el) {
    if (!el) return;
    el.style.display = "none";
    el.hidden = true;
  }

  function showBlock(el) {
    if (!el) return;
    el.style.display = "block";
    el.hidden = false;
  }

  function hideAllConditionalSections() {
    hide(document.querySelector('[data-step3-branch="yes"]'));
    hide(document.querySelector('[data-step3-branch="no"]'));
    hide(document.querySelector('[data-step3-followup="yes"]'));
    hide(document.querySelector('[data-step3-followup="no"]'));
    hide(document.querySelector('[data-step4-branch="main"]'));
    hide(document.querySelector('[data-step4-followup="yes"]'));
    hide(document.querySelector('[data-step4-followup="no"]'));
    hide(document.querySelector('[data-step5-branch="main"]'));
  }

  function hideAllPrStatusIcons() {
    document.querySelectorAll('[data-pr-status-icon="too-early"]').forEach(hide);
    document.querySelectorAll('[data-pr-status-icon="can-start"]').forEach(hide);
    document.querySelectorAll('[data-pr-status-icon="too-late"]').forEach(hide);
  }

  function showPrStatusIcon(state) {
    hideAllPrStatusIcons();
    document.querySelectorAll(`[data-pr-status-icon="${state}"]`).forEach(showBlock);
  }

  function hideAllStep3NoStatusIcons() {
    document.querySelectorAll('[data-step3-no-status-icon="return-needed"]').forEach(hide);
    document.querySelectorAll('[data-step3-no-status-icon="can-start"]').forEach(hide);
    document.querySelectorAll('[data-step3-no-status-icon="too-late"]').forEach(hide);
  }

  function showStep3NoStatusIcon(state) {
    hideAllStep3NoStatusIcons();
    document.querySelectorAll(`[data-step3-no-status-icon="${state}"]`).forEach(showBlock);
  }

  function hideAllReturnStatusIcons() {
    document.querySelectorAll('[data-return-status-icon="return-needed"]').forEach(hide);
    document.querySelectorAll('[data-return-status-icon="can-start"]').forEach(hide);
    document.querySelectorAll('[data-return-status-icon="too-late"]').forEach(hide);
  }

  function showReturnStatusIcon(state) {
    hideAllReturnStatusIcons();
    document.querySelectorAll(`[data-return-status-icon="${state}"]`).forEach(showBlock);
  }

  function hideAllFinalStatusIcons() {
    document.querySelectorAll('[data-final-status-icon="return-needed"]').forEach(hide);
    document.querySelectorAll('[data-final-status-icon="can-start"]').forEach(hide);
    document.querySelectorAll('[data-final-status-icon="too-late"]').forEach(hide);
  }

  function showFinalStatusIcon(state) {
    hideAllFinalStatusIcons();
    document.querySelectorAll(`[data-final-status-icon="${state}"]`).forEach(showBlock);
  }

  function resetFinalStatusOutputs() {
    setOutput("final-status-title", "");
    setOutput("final-status-description", "");
    setOutput("final-status-cta", "Aanvraag starten");
    setOutput("final-return-deadline-text", "");
    hideAllFinalStatusIcons();
  }

  function getMonthIndex(monthText) {
    const cleaned = String(monthText).toLowerCase().trim();

    if (Object.prototype.hasOwnProperty.call(monthMap, cleaned)) {
      return monthMap[cleaned];
    }

    const numeric = parseInt(cleaned, 10);
    if (!isNaN(numeric) && numeric >= 1 && numeric <= 12) return numeric - 1;

    return null;
  }

  function createDateParts(dayValue, monthValue, yearValue) {
    const day = parseInt(dayValue, 10);
    const year = parseInt(yearValue, 10);
    const month = getMonthIndex(monthValue);

    if (isNaN(day) || isNaN(year) || month === null) return null;

    const utcMs = Date.UTC(year, month, day);
    const check = new Date(utcMs);

    if (
      check.getUTCFullYear() !== year ||
      check.getUTCMonth() !== month ||
      check.getUTCDate() !== day
    ) {
      return null;
    }

    return { day, month, year, utcMs };
  }

  function formatDateParts(parts) {
    return new Date(parts.utcMs).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });
  }

  function addYears(parts, yearsToAdd) {
    const targetYear = parts.year + yearsToAdd;
    const shifted = new Date(Date.UTC(targetYear, parts.month, parts.day));

    if (shifted.getUTCFullYear() !== targetYear || shifted.getUTCMonth() !== parts.month) {
      const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, parts.month + 1, 0)).getUTCDate();
      return createDateParts(lastDayOfTargetMonth, parts.month + 1, targetYear);
    }

    return createDateParts(parts.day, parts.month + 1, targetYear);
  }

  function addMonths(parts, monthsToAdd) {
    const shifted = new Date(Date.UTC(parts.year, parts.month + monthsToAdd, parts.day));
    return createDateParts(
      shifted.getUTCDate(),
      shifted.getUTCMonth() + 1,
      shifted.getUTCFullYear()
    );
  }

  function addDays(parts, daysToAdd) {
    const shifted = new Date(parts.utcMs + (daysToAdd * 24 * 60 * 60 * 1000));
    return createDateParts(
      shifted.getUTCDate(),
      shifted.getUTCMonth() + 1,
      shifted.getUTCFullYear()
    );
  }

  function daysBetweenParts(startParts, endParts) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((endParts.utcMs - startParts.utcMs) / msPerDay);
  }

  function getIssueDateParts() {
    return createDateParts(getSource("day"), getSource("month"), getSource("year"));
  }

  function getTodayDateParts() {
    const now = new Date();
    return createDateParts(now.getDate(), now.getMonth() + 1, now.getFullYear());
  }

  function getSelectedDepartureChoice() {
    const yesRadio = document.querySelector('[data-departure-toggle="yes"]');
    const noRadio = document.querySelector('[data-departure-toggle="no"]');
    if (yesRadio?.checked) return "yes";
    if (noRadio?.checked) return "no";
    return null;
  }

  function getSelectedFollowupChoice() {
    const yesRadio = document.querySelector('[data-followup-toggle="yes"]');
    const noRadio = document.querySelector('[data-followup-toggle="no"]');
    if (yesRadio?.checked) return "yes";
    if (noRadio?.checked) return "no";
    return null;
  }

  function getSelectedExtraTripsChoice() {
    const yesRadio = document.querySelector('[data-extra-trips-toggle="yes"]');
    const noRadio = document.querySelector('[data-extra-trips-toggle="no"]');
    if (yesRadio?.checked) return "yes";
    if (noRadio?.checked) return "no";
    return null;
  }

  function getDepartureDateParts() {
    const yesBranch = document.querySelector('[data-step3-branch="yes"]');
    if (!yesBranch) return null;

    return createDateParts(
      getSource("departure-day", yesBranch),
      getSource("departure-month", yesBranch),
      getSource("departure-year", yesBranch)
    );
  }

  function getTripReturnDateParts(card) {
    return createDateParts(
      getTripSource("day", "return", card),
      getTripSource("month", "return", card),
      getTripSource("year", "return", card)
    );
  }

  function getTripDepartureDateParts(card) {
    return createDateParts(
      getTripSource("day", "departure", card),
      getTripSource("month", "departure", card),
      getTripSource("year", "departure", card)
    );
  }

  function getTripErrorElements(card, type = "return") {
    const messageAttr = type === "departure" ? "departure-message" : "return-message";
    const textAttr = type === "departure" ? "departure-text" : "return-text";

    return {
      wrap: card.querySelector(`[data-trip-error="${messageAttr}"]`),
      text: card.querySelector(`[data-trip-error="${textAttr}"]`)
    };
  }

  function showTripError(card, message, type = "return") {
    const { wrap, text } = getTripErrorElements(card, type);

    if (!wrap || !text) return;

    text.textContent = message;
    wrap.hidden = false;
    wrap.style.display = "flex";

    card.classList.add("has-trip-error");
  }

  function clearTripError(card) {
    card.querySelectorAll(
      '[data-trip-error="return-message"], [data-trip-error="departure-message"]'
    ).forEach((wrap) => {
      wrap.hidden = true;
      wrap.style.display = "none";
    });

    card.querySelectorAll(
      '[data-trip-error="return-text"], [data-trip-error="departure-text"]'
    ).forEach((text) => {
      text.textContent = "";
    });

    card.classList.remove("has-trip-error");
  }

  function isDepartureQuestionAnswered() {
    return getSelectedDepartureChoice() !== null;
  }

  function isFollowupQuestionAnswered() {
    return getSelectedFollowupChoice() !== null;
  }

  function isExtraTripsQuestionAnswered() {
    return getSelectedExtraTripsChoice() !== null;
  }

  function resetRadioInput(radio) {
    if (!radio) return;

    radio.checked = false;
    radio.removeAttribute("checked");

    const customRadio =
      radio.closest(".w-radio")?.querySelector(".w-radio-input") ||
      radio.parentElement?.querySelector(".w-radio-input") ||
      (radio.previousElementSibling?.matches?.(".w-radio-input") ? radio.previousElementSibling : null);

    if (customRadio) {
      customRadio.classList.remove("w--redirected-checked");
      customRadio.classList.remove("w--redirected-focus");
    }
  }

  function resetExtraTripsQuestion() {
    resetRadioInput(document.querySelector('[data-extra-trips-toggle="yes"]'));
    resetRadioInput(document.querySelector('[data-extra-trips-toggle="no"]'));
  }

  function clearStep3DateError() {
    const wrap = document.querySelector('[data-step3-date-error="wrap"]');
    if (wrap) hide(wrap);
  }

  function resetDependentQuestions() {
    resetRadioInput(document.querySelector('[data-departure-toggle="yes"]'));
    resetRadioInput(document.querySelector('[data-departure-toggle="no"]'));
    resetRadioInput(document.querySelector('[data-followup-toggle="yes"]'));
    resetRadioInput(document.querySelector('[data-followup-toggle="no"]'));
    resetExtraTripsQuestion();
    hideAllConditionalSections();
    clearStep3DateError();
  }




  function resetCustomDateField(trip, group, part, placeholder) {
    const source = trip.querySelector(
      `[data-trip-group="${group}"] [data-tempres-source="${part}"]`
    );

    if (!source) return;

    const dropdown =
      source.matches(".date-dropdown")
        ? source
        : source.closest(".date-dropdown") ||
          source.querySelector(".date-dropdown");

    const visibleText =
      source.matches(".date-text")
        ? source
        : source.querySelector(".date-text") ||
          dropdown?.querySelector(".date-text");

    if (visibleText) {
      visibleText.textContent = placeholder;
    }

    dropdown?.classList.remove("w--open");

    const toggle = dropdown?.querySelector(".date-dropdown-toggle");
    const list = dropdown?.querySelector(".date-dropdown-list");

    toggle?.classList.remove("w--open");
    list?.classList.remove("w--open");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }

    dropdown
      ?.querySelectorAll("input, select, textarea")
      .forEach((field) => {
        if (field.type === "checkbox" || field.type === "radio") {
          field.checked = false;
        } else if (field.tagName === "SELECT") {
          field.selectedIndex = 0;
        } else {
          field.value = "";
        }
      });
  }

  function resetTripCardData() {
    document.querySelectorAll('[data-trip-card="item"]').forEach((trip) => {
      // Inreisdatum
      resetCustomDateField(trip, "return", "day", "Dag");
      resetCustomDateField(trip, "return", "month", "Maand");
      resetCustomDateField(trip, "return", "year", "Jaar");

      // Vertrekdatum
      resetCustomDateField(trip, "departure", "day", "Dag");
      resetCustomDateField(trip, "departure", "month", "Maand");
      resetCustomDateField(trip, "departure", "year", "Jaar");

      clearTripError(trip);
      trip.classList.remove("is-entering", "is-on-top");
      hide(trip);
    });
  }




  function shouldShowStep4(issueDateParts) {
    if (!issueDateParts) return false;
    const departureDateParts = getDepartureDateParts();

    return (
      getSelectedDepartureChoice() === "yes" &&
      !!departureDateParts &&
      departureDateParts.utcMs >= issueDateParts.utcMs
    );
  }

  function shouldShowStep5(issueDateParts) {
    if (!shouldShowStep4(issueDateParts)) return false;
    return getSelectedExtraTripsChoice() === "yes";
  }

  function updateDepartureQuestionState(issueDateParts) {
    const yesRadio = document.querySelector('[data-departure-toggle="yes"]');
    const noRadio = document.querySelector('[data-departure-toggle="no"]');
    const questionWrap = document.querySelector('[data-departure-question="wrap"]');

    const isReady = !!issueDateParts;

    if (yesRadio) yesRadio.disabled = !isReady;
    if (noRadio) noRadio.disabled = !isReady;

    if (questionWrap) {
      questionWrap.classList.toggle("is-disabled", !isReady);
    }

    if (isReady) {
      const wrap = document.querySelector('[data-departure-notification="wrap"]');
      if (wrap) hide(wrap);
    } else {
      const wrap = document.querySelector('[data-departure-notification="wrap"]');
      if (wrap) showBlock(wrap);
      resetDependentQuestions();
      resetTripCardData();
    }
  }

  function hasTripCardInputStarted() {
    return getTripCards().some((card) => {
      const returnParts = getTripReturnDateParts(card);
      const departureParts = getTripDepartureDateParts(card);

      if (returnParts || departureParts) return true;

      const fields = Array.from(card.querySelectorAll("input, select, textarea")).filter((field) => {
        if (field.type === "hidden" || field.type === "submit" || field.type === "button") return false;
        return true;
      });

      return fields.some((field) => {
        if (field.type === "radio" || field.type === "checkbox") return field.checked;
        return String(field.value || "").trim() !== "";
      });
    });
  }

  function updateBranchVisibility(issueDateParts) {
    const departureChoice = getSelectedDepartureChoice();
    const departureDateParts = getDepartureDateParts();
    const extraTripsChoice = getSelectedExtraTripsChoice();

    const yesBranch = document.querySelector('[data-step3-branch="yes"]');
    const noBranch = document.querySelector('[data-step3-branch="no"]');
    const step3FollowupYes = document.querySelector('[data-step3-followup="yes"]');
    const step3FollowupNo = document.querySelector('[data-step3-followup="no"]');
    const step4Wrap = document.querySelector('[data-step4-branch="main"]');
    const step4FollowupYes = document.querySelector('[data-step4-followup="yes"]');
    const step4FollowupNo = document.querySelector('[data-step4-followup="no"]');
    const step5Wrap = document.querySelector('[data-step5-branch="main"]');

    hide(yesBranch);
    hide(noBranch);
    hide(step3FollowupYes);
    hide(step3FollowupNo);
    hide(step4Wrap);
    hide(step4FollowupYes);
    hide(step4FollowupNo);
    hide(step5Wrap);

    if (!issueDateParts || !departureChoice) return;

    if (departureChoice === "yes") {
      showBlock(yesBranch);

      const isValidStep3 =
        !!departureDateParts && departureDateParts.utcMs >= issueDateParts.utcMs;

      if (isValidStep3) {
        showBlock(step4Wrap);

        if (extraTripsChoice === "yes") {
          showBlock(step5Wrap);

          if (canShowStep4YesResult()) {
            showBlock(step4FollowupYes);
          } else {
            hide(step4FollowupYes);
          }
        }

        if (extraTripsChoice === "no") {
          showBlock(step4FollowupNo);
        }
      }

      return;
    }

    if (departureChoice === "no") {
      showBlock(noBranch);

      const followupChoice = getSelectedFollowupChoice();
      if (followupChoice === "yes") showBlock(step3FollowupYes);
      if (followupChoice === "no") showBlock(step3FollowupNo);
    }
  }

  function getTripCards() {
    return Array.from(document.querySelectorAll('[data-trip-card="item"]'));
  }

  function getVisibleTrips() {
    return getTripCards().filter(isVisible);
  }

  function hasVisibleTripWithReturnDate() {
    return getVisibleTrips().some((card) => {
      return !!getTripReturnDateParts(card);
    });
  }

  function canShowStep4YesResult() {
    if (!hasVisibleTripWithReturnDate()) return false;

    const tripChain = buildTripChain();

    return !tripChain.messages.length;
  }

  function hasStartedTripCard(card) {
    if (!isVisible(card)) return false;

    const returnParts = getTripReturnDateParts(card);
    const departureParts = getTripDepartureDateParts(card);
    if (returnParts || departureParts) return true;

    const fields = Array.from(card.querySelectorAll("input, select, textarea")).filter((field) => {
      if (!isVisible(field) || field.disabled) return false;
      if (field.type === "hidden" || field.type === "submit" || field.type === "button") return false;
      return true;
    });

    const seenRadioNames = new Set();

    return fields.some((field) => {
      if (field.type === "radio") {
        if (!field.name || seenRadioNames.has(field.name)) return false;
        seenRadioNames.add(field.name);
        const form = field.closest("form") || document;
        return !!form.querySelector(`input[type="radio"][name="${CSS.escape(field.name)}"]:checked`);
      }

      if (field.type === "checkbox") return field.checked;
      return String(field.value || "").trim() !== "";
    });
  }

  function getLatestKnownDepartureDateParts() {
    const dates = [];
    const firstDeparture = getDepartureDateParts();

    if (firstDeparture) dates.push(firstDeparture);

    if (!shouldShowStep5(getIssueDateParts())) {
      return dates.length ? dates[0] : null;
    }

    getVisibleTrips().forEach((card) => {
      const departureParts = getTripDepartureDateParts(card);
      if (departureParts) dates.push(departureParts);
    });

    if (!dates.length) return null;

    return dates.reduce((latest, current) => {
      return current.utcMs > latest.utcMs ? current : latest;
    }, dates[0]);
  }

  function getLatestKnownReturnDateParts() {
    if (!shouldShowStep5(getIssueDateParts())) return null;

    const dates = [];

    getVisibleTrips().forEach((card) => {
      const returnParts = getTripReturnDateParts(card);
      if (returnParts) dates.push(returnParts);
    });

    if (!dates.length) return null;

    return dates.reduce((latest, current) => {
      return current.utcMs > latest.utcMs ? current : latest;
    }, dates[0]);
  }

  function buildTripChain() {
    const issueDateParts = getIssueDateParts();

    if (!shouldShowStep5(issueDateParts)) {
      getTripCards().forEach(clearTripError);
      return { absences: [], messages: [] };
    }

    const cards = getVisibleTrips();
    const firstDeparture = getDepartureDateParts();
    const messages = [];
    const absences = [];

    cards.forEach(clearTripError);

    if (!firstDeparture) {
      return { absences, messages };
    }

    let previousDeparture = firstDeparture;
    let chainStopped = false;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardNumber = i + 1;

      clearTripError(card);

      if (chainStopped) {
        if (hasStartedTripCard(card)) {
          const msg = `Reis ${cardNumber} kan pas worden ingevuld nadat de vorige reis volledig is ingevuld.`;
          messages.push(msg);
          showTripError(card, msg, "return");
        }
        continue;
      }

      const returnParts = getTripReturnDateParts(card);
      const nextDepartureParts = getTripDepartureDateParts(card);
      const started = hasStartedTripCard(card);

      if (!started) {
        chainStopped = true;
        continue;
      }

      if (!returnParts && !nextDepartureParts) {
        chainStopped = true;
        continue;
      }

      if (!returnParts && nextDepartureParts) {
        const msg = `Vul eerst een geldige inreisdatum in.`;
        messages.push(msg);
        showTripError(card, msg, "return");
        chainStopped = true;
        continue;
      }

      if (returnParts.utcMs < previousDeparture.utcMs) {
        const msg = `De inreisdatum kan niet vóór je eerste vertrek uit Paraguay liggen.`;
        messages.push(msg);
        showTripError(card, msg, "return");
        chainStopped = true;
        continue;
      }

      absences.push({
        index: cardNumber,
        from: previousDeparture,
        to: returnParts,
        daysOutside: daysBetweenParts(previousDeparture, returnParts)
      });

      if (!nextDepartureParts) {
        chainStopped = true;
        continue;
      }

      if (nextDepartureParts.utcMs < returnParts.utcMs) {
        const msg = `De vertrekdatum kan niet vóór de inreisdatum liggen.`;
        messages.push(msg);
        showTripError(card, msg, "departure");
        chainStopped = true;
        continue;
      }

      previousDeparture = nextDepartureParts;
    }

    return { absences, messages };
  }

  function updateTripOutputs() {
    const issueDateParts = getIssueDateParts();

    if (!shouldShowStep5(issueDateParts)) {
      setTripValidationMessage([]);
      setOutput("permanent-max-absence", "-");
      setOutput("permanent-last-return", "-");
      setOutput("permanent-trip-status", "Geen extra reizen ingevuld.");
      getTripCards().forEach(clearTripError);
      return;
    }

    const chain = buildTripChain();
    const absences = chain.absences;
    const messages = chain.messages;
    const latestReturn = getLatestKnownReturnDateParts();

    setTripValidationMessage(messages);

    if (!absences.length) {
      setOutput("permanent-max-absence", "-");
      setOutput("permanent-last-return", latestReturn ? formatDateParts(latestReturn) : "-");
      setOutput("permanent-trip-status", messages[0] || "Geen extra reizen ingevuld.");
      return;
    }

    const longestAbsence = absences.reduce((max, item) => {
      return item.daysOutside > max.daysOutside ? item : max;
    }, absences[0]);

    setOutput("permanent-max-absence", `${longestAbsence.daysOutside} dagen`);
    setOutput("permanent-last-return", latestReturn ? formatDateParts(latestReturn) : "-");

    if (messages.length) {
      setOutput("permanent-trip-status", messages[0]);
      return;
    }

    if (longestAbsence.daysOutside > 365) {
      setOutput(
        "permanent-trip-status",
        `Langste afwezigheid buiten Paraguay was ${longestAbsence.daysOutside} dagen en lijkt langer dan 365 dagen te zijn.`
      );
      return;
    }

    setOutput(
      "permanent-trip-status",
      `Langste afwezigheid buiten Paraguay was ${longestAbsence.daysOutside} dagen.`
    );
  }

  function updateStepIcons(issueDateParts) {
    const departureChoice = getSelectedDepartureChoice();
    const departureDateParts = getDepartureDateParts();
    const followupAnswered = isFollowupQuestionAnswered();
    const extraTripsAnswered = isExtraTripsQuestionAnswered();
    const step5Complete = canShowStep4YesResult();

    setStepComplete(1, !!issueDateParts);
    setStepComplete(2, !!issueDateParts && isDepartureQuestionAnswered());

    let step3Complete = false;

    if (departureChoice === "yes") {
      step3Complete =
        !!departureDateParts &&
        !!issueDateParts &&
        departureDateParts.utcMs >= issueDateParts.utcMs;
    } else if (departureChoice === "no") {
      step3Complete = followupAnswered;
    }

    setStepComplete(3, step3Complete);
    setStepComplete(4, shouldShowStep4(issueDateParts) && extraTripsAnswered);

    const step5ShouldShow = shouldShowStep5(issueDateParts);
    setStepComplete(5, step5ShouldShow && step5Complete);
  }

  function resetPrStatusOutputs() {
    setOutput("pr-current-status-title", "");
    setOutput("pr-current-status-description", "");
    setOutput("pr-current-status-cta", "Neem contact op");
    hideAllPrStatusIcons();
  }

  function resetStep3NoStatusOutputs() {
    setOutput("step3-no-status-title", "");
    setOutput("step3-no-status-description", "");
    hideAllStep3NoStatusIcons();
  }

  function resetReturnStatusOutputs() {
    setOutput("return-status-title", "");
    setOutput("return-status-description", "");
    setOutput("return-status-cta", "");
    hideAllReturnStatusIcons();
  }

// STEP 3 = NO

  function updateStep3NoStatusDescription(issueDateParts, visitDeadlineParts, earliestStartParts, idealLatestStartParts, latestStartParts) {
    const todayParts = getTodayDateParts();

    if (!issueDateParts || !earliestStartParts || !idealLatestStartParts || !latestStartParts || !todayParts) {
      resetStep3NoStatusOutputs();
      return;
    }

    if (todayParts.utcMs >= issueDateParts.utcMs && todayParts.utcMs < earliestStartParts.utcMs) {
      setOutput("step3-no-status-title", "Terugkeer naar Paraguay nodig");
      setOutput(
        "step3-no-status-description",
        `Je kunt de aanvraag voor je permanente verblijfsvergunning nog niet starten. Het is belangrijk dat je uiterlijk op ${formatDateParts(visitDeadlineParts)} terugkeert naar Paraguay om in aanmerking te komen voor je permanente verblijfsvergunning. Je ideale aanvraagperiode loopt van ${formatDateParts(earliestStartParts)} tot en met ${formatDateParts(idealLatestStartParts)}. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
      );
      showStep3NoStatusIcon("return-needed");
      return;
    }

    if (
      todayParts.utcMs >= earliestStartParts.utcMs &&
      todayParts.utcMs <= idealLatestStartParts.utcMs
    ) {
      setOutput("step3-no-status-title", "Je kunt nu aanvragen");
      setOutput(
        "step3-no-status-description",
        `De aanvraagperiode voor je permanente verblijfsvergunning is geopend. Je kunt nu zonder boete starten met de aanvraag voor je permanente verblijfsvergunning. Je ideale aanvraagperiode loopt tot en met ${formatDateParts(idealLatestStartParts)}. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
      );
      showStep3NoStatusIcon("can-start");
      return;
    }

    if (
      todayParts.utcMs > idealLatestStartParts.utcMs &&
      todayParts.utcMs <= latestStartParts.utcMs
    ) {
      setOutput("step3-no-status-title", "Je kunt nu aanvragen met een boete");
      setOutput(
        "step3-no-status-description",
        `Je kunt de aanvraag voor je permanente verblijfsvergunning nog steeds starten, maar de ideale aanvraagperiode zonder boete is inmiddels verstreken. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
      );
      showStep3NoStatusIcon("can-start");
      return;
    }

    const currentDateText = new Date().toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });

    setOutput("step3-no-status-title", "Aanvraagperiode verstreken");
    setOutput(
      "step3-no-status-description",
      `De aanvraagperiode voor je permanente verblijfsvergunning is verstreken. De uiterste datum om te starten was ${formatDateParts(latestStartParts)}. 

      Vandaag is het ${currentDateText}. Neem contact met ons op om te bekijken welke mogelijkheden er nog zijn in jouw situatie.`
    );
    showStep3NoStatusIcon("too-late");
  }

// STEP 4 = NEE

  function updateReturnStatusFromStep3(issueDateParts, returnDeadlineParts, earliestStartParts, idealLatestStartParts, latestStartParts) {
    const todayParts = getTodayDateParts();
    const departureChoice = getSelectedDepartureChoice();
    const returnedChoice = getSelectedExtraTripsChoice();

    if (!issueDateParts || !earliestStartParts || !idealLatestStartParts || !latestStartParts || !todayParts) {
      resetReturnStatusOutputs();
      return;
    }

    const returnDeadlineText = returnDeadlineParts ? formatDateParts(returnDeadlineParts) : "-";

    if (departureChoice === "yes" && returnedChoice === "no" && returnDeadlineParts) {
      const returnDeadlineAfterEarliestStart =
        returnDeadlineParts.utcMs > earliestStartParts.utcMs;

      if (returnDeadlineAfterEarliestStart) {
        if (todayParts.utcMs < earliestStartParts.utcMs) {
          setOutput("return-status-title", "Nog niet beschikbaar");
          setOutput(
            "return-deadline-text",
            `De uiterste terugkeerdatum naar Paraguay is ${returnDeadlineText}. Deze datum wordt berekend vanaf je eerste vertrek uit Paraguay. Als je vóór deze datum terugkeert, blijf je binnen de 365-dagenregel. Je aanvraagperiode voor de permanente verblijfsvergunning start op ${formatDateParts(earliestStartParts)} en loopt, zonder boete, tot en met ${formatDateParts(idealLatestStartParts)}.`
          );
          setOutput(
            "return-status-description",
            `De aanvraagperiode voor je permanente verblijfsvergunning is nog niet geopend. Je kunt de aanvraag starten vanaf ${formatDateParts(earliestStartParts)} tot en met ${formatDateParts(idealLatestStartParts)}. Na ${formatDateParts(idealLatestStartParts)} kun je nog aanvragen tot en met ${formatDateParts(latestStartParts)}, maar dan geldt een boete van 669.012 guaraní. Je uiterste terugkeerdatum is ${returnDeadlineText}, je moet dus vóór deze datum terugkomen naar Paraguay om de aanvraag voor je permanente verblijfsvergunning te starten.`
          );
          setOutput("return-status-cta", "Plan je terugkeer");
          showReturnStatusIcon("return-needed");
          return;
        }

        if (
          todayParts.utcMs >= earliestStartParts.utcMs &&
          todayParts.utcMs <= idealLatestStartParts.utcMs
        ) {
          setOutput("return-status-title", "Aanvraagperiode geopend");
          setOutput(
            "return-deadline-text",
            `De uiterste terugkeerdatum naar Paraguay is ${returnDeadlineText}. Je aanvraagperiode voor de permanente verblijfsvergunning is al gestart. Omdat je nog niet bent teruggekeerd naar Paraguay, moet je eerst terugkomen om de aanvraag te starten.`
          );
          setOutput(
            "return-status-description",
            `De aanvraagperiode voor je permanente verblijfsvergunning is geopend. Je kunt zonder boete de aanvraag voor je permanente verblijfsvergunning starten tot en met ${formatDateParts(idealLatestStartParts)}. Na ${formatDateParts(idealLatestStartParts)} kun je nog aanvragen tot en met ${formatDateParts(latestStartParts)}, maar dan geldt een boete van 669.012 guaraní. Omdat je nog niet bent teruggekeerd naar Paraguay, moet je eerst terugkomen om de aanvraag te starten. Je uiterste terugkeerdatum is ${returnDeadlineText}.`
          );
          showReturnStatusIcon("return-needed");
          return;
        }

        if (
          todayParts.utcMs > idealLatestStartParts.utcMs &&
          todayParts.utcMs <= latestStartParts.utcMs
        ) {
          setOutput("return-status-title", "Aanvraagperiode geopend met boete");
          setOutput(
            "return-deadline-text",
            `De uiterste terugkeerdatum naar Paraguay is ${returnDeadlineText}. Je aanvraagperiode voor de permanente verblijfsvergunning is al geopend, maar de periode zonder boete is verstreken. Omdat je nog niet bent teruggekeerd naar Paraguay, moet je eerst terugkomen om de aanvraag te starten.`
          );
          setOutput(
            "return-status-description",
            `De aanvraagperiode voor je permanente verblijfsvergunning is geopend, maar de periode zonder boete is verstreken. Na ${formatDateParts(idealLatestStartParts)} geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}. Omdat je nog niet bent teruggekeerd naar Paraguay, moet je eerst terugkomen om de aanvraag te starten. Je uiterste terugkeerdatum is ${returnDeadlineText}.`
          );
          showReturnStatusIcon("return-needed");
          return;
        }

        setOutput("return-status-title", "Aanvraagperiode verstreken");
        setOutput(
          "return-deadline-text",
          `De uiterste terugkeerdatum naar Paraguay was ${returnDeadlineText}. Hoewel deze terugkeerdatum relevant is voor de 365-dagenregel, is de aanvraagperiode voor je permanente verblijfsvergunning inmiddels verstreken. De uiterste datum om te starten was ${formatDateParts(latestStartParts)}.`
        );
        setOutput(
          "return-status-description",
          `De aanvraagperiode voor je permanente verblijfsvergunning is verstreken. De uiterste datum om nog te starten was ${formatDateParts(latestStartParts)}. Neem contact met ons op om te bekijken welke mogelijkheden er nog zijn in jouw situatie.`
        );
        showReturnStatusIcon("too-late");
        return;
      }

      if (todayParts.utcMs <= returnDeadlineParts.utcMs) {
        setOutput("return-status-title", "Terugkeer naar Paraguay nodig");
        setOutput(
          "return-deadline-text",
          `De uiterste terugkeerdatum naar Paraguay is ${returnDeadlineText}. Je moet uiterlijk op deze datum terugkeren om binnen de 365-dagenregel te blijven. Daarna kun je de aanvraag voor je permanente verblijfsvergunning starten vanaf ${formatDateParts(earliestStartParts)}.`
        );
        setOutput(
          "return-status-description",
          `Je kunt de aanvraag voor je permanente verblijfsvergunning nog niet starten, omdat je nog niet bent teruggekeerd naar Paraguay. Om in aanmerking te komen, moet je uiterlijk op ${returnDeadlineText} terugkeren naar Paraguay. Je kunt de aanvraag voor je permanente verblijfsvergunning starten vanaf ${formatDateParts(earliestStartParts)} tot en met ${formatDateParts(idealLatestStartParts)}. Na ${formatDateParts(idealLatestStartParts)} kun je nog aanvragen tot en met ${formatDateParts(latestStartParts)}, maar dan geldt een boete van 669.012 guaraní.`
        );
        showReturnStatusIcon("return-needed");
        return;
      }

      showPermanentBlockedByVisitDeadline(returnDeadlineParts, earliestStartParts);
      return;
    }

    if (todayParts.utcMs >= issueDateParts.utcMs && todayParts.utcMs < earliestStartParts.utcMs) {
      setOutput("return-status-title", "Terugkeer naar Paraguay nodig");
      setOutput(
        "return-deadline-text",
        `De uiterste terugkeerdatum naar Paraguay is ${returnDeadlineText}. Keer uiterlijk op deze datum terug om binnen de 365-dagenregel te blijven. Je aanvraagperiode start op ${formatDateParts(earliestStartParts)}.`
      );
      setOutput(
        "return-status-description",
        `Je kunt de aanvraag voor je permanente verblijfsvergunning nog niet starten. Om in aanmerking te komen, moet je uiterlijk op ${returnDeadlineText} terugkeren naar Paraguay. Vanaf ${formatDateParts(earliestStartParts)} tot ${formatDateParts(idealLatestStartParts)} kun je je aanvraag starten. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
      );
      showReturnStatusIcon("return-needed");
      return;
    }

    resetReturnStatusOutputs();
    setOutput("return-deadline-text", "");
    return;
  }

  function updateFinalStatusForStep4Yes(earliestStartParts, idealLatestStartParts, latestStartParts, returnDeadlineParts) {
    const todayParts = getTodayDateParts();
    const chain = buildTripChain();

    if (
      !todayParts ||
      !earliestStartParts ||
      !idealLatestStartParts ||
      !latestStartParts ||
      !returnDeadlineParts ||
      chain.messages.length ||
      !chain.absences.length
    ) {
      resetFinalStatusOutputs();
      return;
    }

    const firstReturnParts = chain.absences[0].to;
    const returnDeadlineText = formatDateParts(returnDeadlineParts);
    const firstReturnText = formatDateParts(firstReturnParts);

    if (firstReturnParts.utcMs > returnDeadlineParts.utcMs) {
      setOutput("final-status-title", "Permanente verblijfsvergunning niet mogelijk");
      setOutput(
        "final-status-description",
        `Je bent op ${firstReturnText} teruggekeerd naar Paraguay. Dat is na je uiterste terugkeerdatum van ${returnDeadlineText}. Daardoor voldoe je niet aan de 365-dagenregel. Een directe aanvraag voor permanente verblijfsvergunning is daarom niet mogelijk. Je moet eerst je tijdelijke verblijfsvergunning verlengen.`
      );
      setOutput("final-status-cta", "Tijdelijke verblijfsvergunning verlengen");
      setOutput(
        "final-return-deadline-text",
        `Je uiterste terugkeerdatum naar Paraguay was ${returnDeadlineText}. Je ingevulde inreisdatum is ${firstReturnText}. Omdat deze datum na de uiterste terugkeerdatum ligt, ben je te laat teruggekeerd.`
      );
      showFinalStatusIcon("too-late");
      return;
    }

    if (todayParts.utcMs < earliestStartParts.utcMs) {
      setOutput("final-status-title", "Nog niet beschikbaar");
      setOutput(
        "final-status-description",
        `Je bent op tijd teruggekeerd naar Paraguay. De aanvraagperiode voor je permanente verblijfsvergunning is alleen nog niet geopend. Je kunt de aanvraag starten vanaf ${formatDateParts(earliestStartParts)} tot en met ${formatDateParts(idealLatestStartParts)}. Na ${formatDateParts(idealLatestStartParts)} kun je nog aanvragen tot en met ${formatDateParts(latestStartParts)}, maar dan geldt een boete van 669.012 guaraní.`
      );
      setOutput("final-status-cta", "Plan je aanvraag");
      setOutput(
        "final-return-deadline-text",
        `Je uiterste terugkeerdatum naar Paraguay was ${returnDeadlineText}. Je bent teruggekeerd op ${firstReturnText}, dus je bent binnen de 365-dagenregel teruggekeerd.`
      );
      showFinalStatusIcon("return-needed");
      return;
    }

    if (
      todayParts.utcMs >= earliestStartParts.utcMs &&
      todayParts.utcMs <= idealLatestStartParts.utcMs
    ) {
      setOutput("final-status-title", "Je kunt nu aanvragen");
      setOutput(
        "final-status-description",
        `Je bent op tijd teruggekeerd naar Paraguay en de aanvraagperiode voor je permanente verblijfsvergunning is geopend. Je kunt nu zonder boete starten met je aanvraag. Je kunt zonder boete aanvragen tot en met ${formatDateParts(idealLatestStartParts)}. Daarna kun je nog aanvragen tot en met ${formatDateParts(latestStartParts)}, maar dan geldt een boete van 669.012 guaraní.`
      );
      setOutput("final-status-cta", "Aanvraag starten");
      setOutput(
        "final-return-deadline-text",
        `Je uiterste terugkeerdatum naar Paraguay was ${returnDeadlineText}. Je bent teruggekeerd op ${firstReturnText}, dus je bent binnen de 365-dagenregel teruggekeerd.`
      );
      showFinalStatusIcon("can-start");
      return;
    }

    if (
      todayParts.utcMs > idealLatestStartParts.utcMs &&
      todayParts.utcMs <= latestStartParts.utcMs
    ) {
      setOutput("final-status-title", "Aanvraagperiode geopend met boete");
      setOutput(
        "final-status-description",
        `Je bent op tijd teruggekeerd naar Paraguay en je aanvraagperiode is nog geopend, maar de periode zonder boete is verstreken. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}, maar omdat je na ${formatDateParts(idealLatestStartParts)} aanvraagt, geldt een boete van 669.012 guaraní.`
      );
      setOutput("final-status-cta", "Aanvraag starten");
      setOutput(
        "final-return-deadline-text",
        `Je uiterste terugkeerdatum naar Paraguay was ${returnDeadlineText}. Je bent teruggekeerd op ${firstReturnText}, dus je bent binnen de 365-dagenregel teruggekeerd.`
      );
      showFinalStatusIcon("can-start");
      return;
    }

    setOutput("final-status-title", "Aanvraagperiode verstreken");
    setOutput(
      "final-status-description",
      `Je bent op tijd teruggekeerd naar Paraguay, maar de aanvraagperiode voor je permanente verblijfsvergunning is verstreken. De uiterste datum om nog te starten was ${formatDateParts(latestStartParts)}. Neem contact met ons op om te bekijken welke mogelijkheden er nog zijn in jouw situatie.`
    );
    setOutput("final-status-cta", "Bespreek je situatie");
    setOutput(
      "final-return-deadline-text",
      `Je uiterste terugkeerdatum naar Paraguay was ${returnDeadlineText}. Je bent teruggekeerd op ${firstReturnText}, dus je bent binnen de 365-dagenregel teruggekeerd.`
    );
    showFinalStatusIcon("too-late");
  }

  function getVisitDeadlineOverstayCheck(issueDateParts, returnDeadlineParts, latestStartParts) {
    const departureChoice = getSelectedDepartureChoice();
    const departureDateParts = getDepartureDateParts();
    const todayParts = getTodayDateParts();

    if (
      departureChoice !== "yes" ||
      !issueDateParts ||
      !returnDeadlineParts ||
      !latestStartParts ||
      !departureDateParts ||
      !todayParts ||
      departureDateParts.utcMs < issueDateParts.utcMs
    ) {
      return {
        applicable: false,
        blocked: false,
        departureDateParts: null,
        returnDeadlineParts: null,
        todayParts: null
      };
    }

    if (returnDeadlineParts.utcMs > latestStartParts.utcMs) {
      return {
        applicable: false,
        blocked: false,
        departureDateParts,
        returnDeadlineParts,
        todayParts
      };
    }

    return {
      applicable: true,
      blocked: todayParts.utcMs > returnDeadlineParts.utcMs,
      departureDateParts,
      returnDeadlineParts,
      todayParts
    };
  }

  function showPermanentBlockedByVisitDeadline(returnDeadlineParts, earliestStartParts) {
    const todayParts = getTodayDateParts();

    const periodNotOpenYet =
      todayParts &&
      earliestStartParts &&
      todayParts.utcMs < earliestStartParts.utcMs;

    setOutput("return-status-title", "Permanente verblijfsvergunning niet meer mogelijk");

    if (periodNotOpenYet) {
      setOutput(
        "return-status-description",
        `De aanvraagperiode voor je permanente verblijfsvergunning is nog niet geopend, maar je bent niet uiterlijk op ${formatDateParts(returnDeadlineParts)} teruggekeerd naar Paraguay. Daardoor voldoe je niet aan de 365-dagenregel. Een directe aanvraag voor je permanente verblijfsvergunning is daarom niet mogelijk zodra de aanvraagperiode opent. Je moet eerst je tijdelijke verblijfsvergunning verlengen.`
      );
    } else {
      setOutput(
        "return-status-description",
        `De aanvraagperiode voor je permanente verblijfsvergunning is geopend, maar je bent niet uiterlijk op ${formatDateParts(returnDeadlineParts)} teruggekeerd naar Paraguay. Daardoor voldoe je niet aan de 365-dagenregel. Een directe aanvraag voor je permanente verblijfsvergunning is daarom niet mogelijk. Je moet eerst je tijdelijke verblijfsvergunning verlengen.`
      );
    }

    showReturnStatusIcon("too-late");

    setOutput("pr-current-status-title", "Permanente verblijfsvergunning niet meer mogelijk");
    setOutput(
      "pr-current-status-description",
      `Je bent niet uiterlijk op ${formatDateParts(returnDeadlineParts)} teruggekeerd naar Paraguay. Daardoor is een directe overgang van een tijdelijke verblijfsvergunning naar een permanente verblijfsvergunning niet mogelijk. Je moet eerst je tijdelijke verblijfsvergunning verlengen.`
    );
    setOutput("pr-current-status-cta", "Tijdelijke verblijfsvergunning verlengen");
    showPrStatusIcon("too-late");

    setOutput("eligibility", "Directe overgang naar permanent niet mogelijk.");
    setOutput(
      "permanent-trip-status",
      `Je bent niet uiterlijk op ${formatDateParts(returnDeadlineParts)} teruggekeerd naar Paraguay.`
    );
  }

// STEP 3 = JA

  function updatePrCurrentStatus(earliestStartParts, idealLatestStartParts, latestStartParts) {
    const todayParts = getTodayDateParts();

    if (!earliestStartParts || !idealLatestStartParts || !latestStartParts || !todayParts) {
      resetPrStatusOutputs();
      return;
    }

    if (todayParts.utcMs < earliestStartParts.utcMs) {
      const earliestStartText = formatDateParts(earliestStartParts);
      const idealLatestStartText = formatDateParts(idealLatestStartParts);
      const latestStartText = formatDateParts(latestStartParts);

      setOutput("pr-current-status-title", "Nog niet beschikbaar");
      setOutput(
        "pr-current-status-description",
        `Je kunt de aanvraag voor je permanente verblijfsvergunning nog niet starten. Je ideale aanvraagperiode loopt van ${earliestStartText} tot en met ${idealLatestStartText}. Dien je de aanvraag in na ${idealLatestStartText}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${latestStartText}.`
      );
      setOutput("pr-current-status-cta", "Plan je aanvraag");
      showPrStatusIcon("too-early");
      return;
    }

    if (todayParts.utcMs >= earliestStartParts.utcMs && todayParts.utcMs <= idealLatestStartParts.utcMs) {
      setOutput("pr-current-status-title", "Je kunt nu aanvragen");
      setOutput(
        "pr-current-status-description",
        `De aanvraagperiode voor je permanente verblijfsvergunning is geopend. Je kunt nu zonder boete starten met de aanvraag voor je permanente verblijfsvergunning. Je ideale aanvraagperiode loopt tot en met ${formatDateParts(idealLatestStartParts)}. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
      );
      setOutput("pr-current-status-cta", "Aanvraag starten");
      showPrStatusIcon("can-start");
      return;
    }

    if (todayParts.utcMs > idealLatestStartParts.utcMs && todayParts.utcMs <= latestStartParts.utcMs) {
      setOutput("pr-current-status-title", "Je kunt nu aanvragen met een boete");
      setOutput(
        "pr-current-status-description",
        `Je kunt de aanvraag voor je permanente verblijfsvergunning nog steeds starten, maar de ideale aanvraagperiode zonder boete is inmiddels verstreken. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
      );
      setOutput("pr-current-status-cta", "Aanvraag starten");
      showPrStatusIcon("can-start");
      return;
    }

    const currentDateText = new Date().toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });

    setOutput("pr-current-status-title", "Aanvraagperiode verstreken");
    setOutput(
      "pr-current-status-description",
      `De aanvraagperiode voor je permanente verblijfsvergunning is verstreken. De uiterste datum om nog te starten was ${formatDateParts(latestStartParts)}. 

      Vandaag is het ${currentDateText}. Neem contact met ons op om te bekijken welke mogelijkheden er nog zijn in jouw situatie.`
    );
    setOutput("pr-current-status-cta", "Bespreek je situatie");
    showPrStatusIcon("too-late");
  }

  function updateReturnDeadlineOutputs(issueDateParts, departureChoice, earliestStartParts) {
    const departureDateParts = getDepartureDateParts();

    if (
      departureChoice === "yes" &&
      departureDateParts &&
      issueDateParts &&
      departureDateParts.utcMs >= issueDateParts.utcMs
    ) {
      const returnDeadlineParts = addDays(departureDateParts, 365);
      const returnDeadlineText = formatDateParts(returnDeadlineParts);

      setOutput("return-deadline", returnDeadlineText);
      setOutput(
        "return-deadline-text",
        `Je uiterste terugkeerdatum naar Paraguay is ${returnDeadlineText}. Deze datum wordt berekend vanaf je eerste vertrek uit Paraguay. Als je vóór deze datum terugkeert, blijf je binnen de 365-dagenregel en kun je de aanvraag voor je permanente verblijfsvergunning starten op ${formatDateParts(earliestStartParts)}.`
      );

      return returnDeadlineParts;
    }

    setOutput("return-deadline", "-");
    setOutput("return-deadline-text", "Uiterste terugkeerdatum Paraguay: -");
    return null;
  }

  function resetCalculatedOutputs() {
    setOutput("issue-date", "-");
    setOutput("expiry-date", "-");
    setOutput("visit-deadline", "-");
    setOutput("earliest-start", "-");
    setOutput("ideal-latest-start", "-");
    setOutput("latest-start", "-");
    setOutput("visit-rule", "Kies eerst een geldige afgiftedatum.");
    setOutput("eligibility", "Nog niet berekend.");
    setOutput("days-until-first-departure", "-");
    setOutput("first-departure-status", "-");
    setOutput("permanent-max-absence", "-");
    setOutput("permanent-last-return", "-");
    setOutput("permanent-trip-status", "Nog niet berekend.");
    setOutput("last-departure-paraguay", "-");
    setOutput("return-deadline", "-");
    setOutput("return-deadline-text", "Uiterste terugkeerdatum Paraguay: -");
    resetReturnStatusOutputs();
    setTripValidationMessage([]);
    const wrap = document.querySelector('[data-step3-date-error="wrap"]');
    if (wrap) hide(wrap);
    getTripCards().forEach(clearTripError);
    resetPrStatusOutputs();
    resetStep3NoStatusOutputs();
  }

  function calculateTemporaryResidencyDates() {
    const issueDateParts = getIssueDateParts();
    const departureChoice = getSelectedDepartureChoice();

    setOutput("issue-date", issueDateParts ? formatDateParts(issueDateParts) : "-");
    updateDepartureQuestionState(issueDateParts);

    if (!issueDateParts) {
      hideAllConditionalSections();
      resetDependentQuestions();
      resetTripCardData();
      resetCalculatedOutputs();
      updateStepIcons(null);
      return;
    }

    const expiryDateParts = addYears(issueDateParts, 2);
    const visitDeadlineParts = addYears(issueDateParts, 1);
    const earliestStartParts = addMonths(expiryDateParts, -3);
    const idealLatestStartParts = expiryDateParts;
    const latestStartParts = addMonths(expiryDateParts, 1);

    setOutput("expiry-date", expiryDateParts ? formatDateParts(expiryDateParts) : "-");
    setOutput("visit-deadline", visitDeadlineParts ? formatDateParts(visitDeadlineParts) : "-");
    setOutput("earliest-start", earliestStartParts ? formatDateParts(earliestStartParts) : "-");
    setOutput("ideal-latest-start", idealLatestStartParts ? formatDateParts(idealLatestStartParts) : "-");
    setOutput("latest-start", latestStartParts ? formatDateParts(latestStartParts) : "-");

    updatePrCurrentStatus(earliestStartParts, idealLatestStartParts, latestStartParts);

    const returnDeadlineParts = updateReturnDeadlineOutputs(
      issueDateParts,
      departureChoice,
      earliestStartParts
    );

    updateReturnStatusFromStep3(
      issueDateParts,
      returnDeadlineParts,
      earliestStartParts,
      idealLatestStartParts,
      latestStartParts
    );

    if (departureChoice === "no") {
      updateStep3NoStatusDescription(
        issueDateParts,
        visitDeadlineParts,
        earliestStartParts,
        idealLatestStartParts,
        latestStartParts
      );
    } else {
      resetStep3NoStatusOutputs();
    }

    if (departureChoice !== "yes") {
      const wrap = document.querySelector('[data-step3-date-error="wrap"]');
      if (wrap) hide(wrap);
      resetExtraTripsQuestion();
      resetTripCardData();
      updateBranchVisibility(issueDateParts);

      setOutput("visit-rule", "Geen vertrek na de afgiftedatum opgegeven.");
      setOutput("eligibility", "Nog niet te beoordelen.");
      setOutput("days-until-first-departure", "-");
      setOutput("first-departure-status", "Geen eerste vertrekdatum ingevuld.");
      setOutput("permanent-max-absence", "-");
      setOutput("permanent-last-return", "-");
      setOutput("permanent-trip-status", "Niet van toepassing in dit pad.");
      setOutput("last-departure-paraguay", "-");
      setTripValidationMessage([]);
      getTripCards().forEach(clearTripError);
      updateStepIcons(issueDateParts);
      return;
    }

    const departureDateParts = getDepartureDateParts();

    if (!departureDateParts) {
      const wrap = document.querySelector('[data-step3-date-error="wrap"]');
      if (wrap) hide(wrap);
      resetExtraTripsQuestion();
      resetTripCardData();
      updateBranchVisibility(issueDateParts);

      setOutput("visit-rule", "Kies eerst een geldige eerste vertrekdatum.");
      setOutput("eligibility", "Nog niet te beoordelen.");
      setOutput("days-until-first-departure", "-");
      setOutput("first-departure-status", "Kies eerst een geldige eerste vertrekdatum.");
      setOutput("permanent-max-absence", "-");
      setOutput("permanent-last-return", "-");
      setOutput("permanent-trip-status", "Vul eerst 'Datum van eerste vertrek uit Paraguay' in.");
      setOutput("last-departure-paraguay", "-");
      setTripValidationMessage([]);
      getTripCards().forEach(clearTripError);
      updateStepIcons(issueDateParts);
      return;
    }

    const daysUntilFirstDeparture = daysBetweenParts(issueDateParts, departureDateParts);

    if (daysUntilFirstDeparture < 0) {
      const wrap = document.querySelector('[data-step3-date-error="wrap"]');
      if (wrap) showBlock(wrap);
      resetExtraTripsQuestion();
      resetTripCardData();
      updateBranchVisibility(issueDateParts);

      setOutput("days-until-first-departure", "-");
      setOutput("visit-rule", "De eerste vertrekdatum kan niet vóór de afgiftedatum liggen.");
      setOutput("first-departure-status", "De eerste vertrekdatum kan niet vóór de afgiftedatum liggen.");
      setOutput("eligibility", "Controleer de ingevoerde datums.");
      setOutput("permanent-max-absence", "-");
      setOutput("permanent-last-return", "-");
      setOutput("permanent-trip-status", "Controleer eerst 'Datum van eerste vertrek uit Paraguay'.");
      setOutput("last-departure-paraguay", "-");
      setTripValidationMessage([]);
      getTripCards().forEach(clearTripError);
      updateStepIcons(issueDateParts);
      return;
    }

    const wrap = document.querySelector('[data-step3-date-error="wrap"]');
    if (wrap) hide(wrap);
    updateBranchVisibility(issueDateParts);

    const extraTripsChoice = getSelectedExtraTripsChoice();
    if (extraTripsChoice === "no") {
      resetTripCardData();
    }

    setOutput("days-until-first-departure", String(daysUntilFirstDeparture));
    setOutput("visit-rule", `Eerste vertrek was ${daysUntilFirstDeparture} dagen na de afgiftedatum.`);
    setOutput("first-departure-status", `Je eerste vertrek was ${daysUntilFirstDeparture} dagen na de afgiftedatum.`);

    if (daysUntilFirstDeparture <= 365) {
      setOutput("eligibility", "Vertrek binnen 12 maanden na afgiftedatum.");
    } else {
      setOutput("eligibility", "Vertrek later dan 12 maanden na afgiftedatum.");
    }

    const latestKnownDeparture = getLatestKnownDepartureDateParts();
    setOutput(
      "last-departure-paraguay",
      latestKnownDeparture ? formatDateParts(latestKnownDeparture) : "-"
    );

    const returnDeadlineAfterEarliestStart =
      returnDeadlineParts &&
      earliestStartParts &&
      returnDeadlineParts.utcMs > earliestStartParts.utcMs;

    const returnDeadlineOverstayCheck = getVisitDeadlineOverstayCheck(issueDateParts, returnDeadlineParts, latestStartParts);

    if (
      extraTripsChoice !== "yes" &&
      !returnDeadlineAfterEarliestStart &&
      returnDeadlineOverstayCheck.applicable &&
      returnDeadlineOverstayCheck.blocked
    ) {
      showPermanentBlockedByVisitDeadline(returnDeadlineParts, earliestStartParts);
      updateTripOutputs();
      updateStepIcons(issueDateParts);
      return;
    }

    updateTripOutputs();

    if (extraTripsChoice === "yes" && canShowStep4YesResult()) {
      updateFinalStatusForStep4Yes(
        earliestStartParts,
        idealLatestStartParts,
        latestStartParts,
        returnDeadlineParts
      );
    } else {
      resetFinalStatusOutputs();
}

updateStepIcons(issueDateParts);
  }

  function bindRecalculation(key) {
    document.querySelectorAll(`[data-tempres-source="${key}"]`).forEach((el) => {
      const observer = new MutationObserver(calculateTemporaryResidencyDates);
      observer.observe(el, {
        childList: true,
        characterData: true,
        subtree: true
      });
    });
  }

  function bindTripRecalculation() {
    document.querySelectorAll('[data-trip-card="item"]').forEach((trip) => {
      trip.querySelectorAll(':scope [data-trip-group] [data-tempres-source]').forEach((el) => {
        const observer = new MutationObserver(calculateTemporaryResidencyDates);
        observer.observe(el, {
          childList: true,
          characterData: true,
          subtree: true
        });
      });

      trip.querySelectorAll("input, select, textarea").forEach((field) => {
        field.addEventListener("input", calculateTemporaryResidencyDates);
        field.addEventListener("change", calculateTemporaryResidencyDates);
      });
    });

    document.addEventListener("click", function (e) {
      if (
        e.target.closest('[data-trip-add="button"]') ||
        e.target.closest('[data-trip-remove="button"]')
      ) {
        requestAnimationFrame(() => {
          requestAnimationFrame(calculateTemporaryResidencyDates);
        });
      }
    });
  }

  ["day", "month", "year", "departure-day", "departure-month", "departure-year"].forEach(bindRecalculation);

  bindTripRecalculation();

[
  '[data-departure-toggle="yes"]',
  '[data-departure-toggle="no"]',
  '[data-followup-toggle="yes"]',
  '[data-followup-toggle="no"]',
  '[data-extra-trips-toggle="yes"]',
  '[data-extra-trips-toggle="no"]'
].forEach((selector) => {
  const el = document.querySelector(selector);

  if (!el) return;

  el.addEventListener("change", () => {
    if (
      selector === '[data-extra-trips-toggle="no"]' &&
      el.checked
    ) {
      resetTripCardData();
      resetFinalStatusOutputs();
      setTripValidationMessage([]);
    }

    calculateTemporaryResidencyDates();
  });
});

calculateTemporaryResidencyDates();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCalculator);
} else {
  initCalculator();
}