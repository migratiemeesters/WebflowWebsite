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

  function getTripErrorElement(card) {
    return card.querySelector('[data-trip-error="message"]');
  }

  function getTripErrorTextElement(card) {
    return card.querySelector('[data-trip-error="text"]');
  }

  function showTripError(card, message) {
    const wrap = getTripErrorElement(card);
    const text = getTripErrorTextElement(card);
    if (!wrap || !text) return;
    text.textContent = message;
    wrap.hidden = false;
    wrap.style.display = "block";
    card.classList.add("has-trip-error");
  }

  function clearTripError(card) {
    const wrap = getTripErrorElement(card);
    const text = getTripErrorTextElement(card);
    if (!wrap || !text) return;
    text.textContent = "";
    wrap.hidden = true;
    wrap.style.display = "none";
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

  function resetTripCardData() {
    document.querySelectorAll('[data-trip-card="item"]').forEach((trip) => {
      trip.querySelectorAll("input, select, textarea").forEach((field) => {
        if (field.type === "checkbox" || field.type === "radio") {
          field.checked = false;
        } else {
          field.value = "";
        }
      });

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

          if (hasVisibleTripWithReturnDate()) {
            showBlock(step4FollowupYes);
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
          const msg = `Extra reis ${cardNumber} kan pas worden ingevuld nadat de vorige reis volledig is ingevuld.`;
          messages.push(msg);
          showTripError(card, msg);
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
        const msg = `Extra reis ${cardNumber}: vul eerst een geldige Inreisdatum in.`;
        messages.push(msg);
        showTripError(card, msg);
        chainStopped = true;
        continue;
      }

      if (returnParts.utcMs < previousDeparture.utcMs) {
        const msg = `Extra reis ${cardNumber}: Inreisdatum ligt vóór het vorige vertrek uit Paraguay.`;
        messages.push(msg);
        showTripError(card, msg);
        chainStopped = true;
        continue;
      }

      if (nextDepartureParts.utcMs < returnParts.utcMs) {
        const msg = `Extra reis ${cardNumber}: Vertrekdatum kan niet vóór de Inreisdatum liggen.`;
        messages.push(msg);
        showTripError(card, msg);
        chainStopped = true;
        continue;
      }

      absences.push({
        index: cardNumber,
        from: previousDeparture,
        to: returnParts,
        daysOutside: daysBetweenParts(previousDeparture, returnParts)
      });

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
    const step5Complete = hasVisibleTripWithReturnDate();

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
    hideAllReturnStatusIcons();
  }

  function updateStep3JaStatusDescription(earliest, ideal, latest, returnDeadlineParts) {
    const today = getTodayDateParts();
    hideAllStep3NoStatusIcons();

    if (today.utcMs < earliest.utcMs) {
      setOutput("step3-ja-status-title", "Nog even wachten");
      setOutput(
        "step3-ja-status-description",
        `Je kunt de aanvraag voor je permanente verblijfsvergunning nog niet starten. Je moet uiterlijk op ${formatDateParts(returnDeadlineParts)} terugkeren naar Paraguay om binnen de 365-dagenregel te blijven. Daarna start je aanvraagperiode op ${formatDateParts(earliest)}.`
      );
    } else if (today.utcMs <= ideal.utcMs) {
      setOutput("step3-ja-status-title", "Je kunt nu aanvragen");
      setOutput(
        "step3-ja-status-description",
        `Goed nieuws! Je kunt nu starten met je aanvraag. Je uiterste terugkeerdatum was ${formatDateParts(returnDeadlineParts)}.`
      );
    } else if (today.utcMs <= latest.utcMs) {
      setOutput("step3-ja-status-title", "Je kunt nu aanvragen");
      setOutput(
        "step3-ja-status-description",
        `Je aanvraagperiode is gestart. Je uiterste terugkeerdatum was ${formatDateParts(returnDeadlineParts)} en houd rekening met een boete als je na ${formatDateParts(ideal)} indient.`
      );
    } else {
      setOutput("step3-ja-status-title", "Periode verstreken");
      setOutput(
        "step3-ja-status-description",
        `De aanvraagperiode is helaas verstreken. Je uiterste terugkeerdatum was ${formatDateParts(returnDeadlineParts)}.`
      );
    }
  }

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
        `Je kunt de aanvraag voor je permanente verblijfsvergunning nog niet starten. Het is belangrijk dat je uiterlijk op ${formatDateParts(visitDeadlineParts)} terugkeert naar Paraguay om in aanmerking te komen voor je permanente verblijfsvergunning. Vanaf ${formatDateParts(earliestStartParts)} tot ${formatDateParts(latestStartParts)} kun je je aanvraag starten zonder boete.`
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
        `Goed nieuws! Je aanvraagperiode voor de permanente verblijfsvergunning is gestart. Je kunt nu zonder boete starten met de aanvraag voor je permanente verblijfsvergunning. Je ideale aanvraagperiode loopt tot en met ${formatDateParts(idealLatestStartParts)}. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
      );
      showStep3NoStatusIcon("can-start");
      return;
    }

    if (
      todayParts.utcMs > idealLatestStartParts.utcMs &&
      todayParts.utcMs <= latestStartParts.utcMs
    ) {
      setOutput("step3-no-status-title", "Je kunt nu aanvragen");
      setOutput(
        "step3-no-status-description",
        `Je kunt de aanvraag voor je permanente verblijfsvergunning nog steeds starten, maar niet meer binnen de ideale periode zonder boete. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
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
      `De aanvraagperiode voor je permanente verblijfsvergunning is verstreken. De uiterste datum om nog te starten was ${formatDateParts(latestStartParts)}. Vandaag is het ${currentDateText}. Neem contact met ons op om te bekijken welke mogelijkheden er nog zijn in jouw situatie.`
    );
    showStep3NoStatusIcon("too-late");
  }

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
            "return-status-description",
            `De aanvraagperiode voor je permanente verblijfsvergunning is nog niet geopend. Je kunt je aanvraag starten vanaf ${formatDateParts(earliestStartParts)} tot en met ${formatDateParts(idealLatestStartParts)}. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}. Je uiterlijke terugkeerdatum is ${returnDeadlineText}, je hoeft alleen op tijd terug te komen naar Paraguay om de aanvraag voor je permanente verblijfsvergunning te starten.`
          );
          showReturnStatusIcon("return-needed");
          return;
        }

        if (
          todayParts.utcMs >= earliestStartParts.utcMs &&
          todayParts.utcMs <= idealLatestStartParts.utcMs
        ) {
          setOutput("return-status-title", "Je kunt nu aanvragen");
          setOutput(
            "return-status-description",
            `Goed nieuws! Je aanvraagperiode voor de permanente verblijfsvergunning is gestart. Je kunt nu zonder boete starten met de aanvraag voor je permanente verblijfsvergunning. Je ideale aanvraagperiode loopt tot en met ${formatDateParts(idealLatestStartParts)}. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
          );
          showReturnStatusIcon("can-start");
          return;
        }

        if (
          todayParts.utcMs > idealLatestStartParts.utcMs &&
          todayParts.utcMs <= latestStartParts.utcMs
        ) {
          setOutput("return-status-title", "Je kunt nu aanvragen");
          setOutput(
            "return-status-description",
            `Je kunt de aanvraag voor je permanente verblijfsvergunning nog steeds starten, maar niet meer binnen de ideale periode zonder boete. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
          );
          showReturnStatusIcon("can-start");
          return;
        }

        setOutput("return-status-title", "Aanvraagperiode verstreken");
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
          "return-status-description",
          `Je kunt de aanvraag voor je permanente verblijfsvergunning nog niet starten, omdat je nog niet bent teruggekeerd naar Paraguay. Om in aanmerking te komen, moet je uiterlijk op ${returnDeadlineText} terugkeren naar Paraguay. Vanaf ${formatDateParts(earliestStartParts)} tot ${formatDateParts(idealLatestStartParts)} kun je je aanvraag starten. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
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
        "return-status-description",
        `Je kunt de aanvraag voor je permanente verblijfsvergunning nog niet starten. Om in aanmerking te komen, moet je uiterlijk op ${returnDeadlineText} terugkeren naar Paraguay. Vanaf ${formatDateParts(earliestStartParts)} tot ${formatDateParts(idealLatestStartParts)} kun je je aanvraag starten. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
      );
      showReturnStatusIcon("return-needed");
      return;
    }

    if (
      todayParts.utcMs >= earliestStartParts.utcMs &&
      todayParts.utcMs <= idealLatestStartParts.utcMs
    ) {
      setOutput("return-status-title", "Je kunt nu aanvragen");
      setOutput(
        "return-status-description",
        `Goed nieuws! Je aanvraagperiode voor de permanente verblijfsvergunning is gestart. Je kunt nu zonder boete starten met de aanvraag voor je permanente verblijfsvergunning. Je ideale aanvraagperiode loopt tot en met ${formatDateParts(idealLatestStartParts)}. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
      );
      showReturnStatusIcon("can-start");
      return;
    }

    if (
      todayParts.utcMs > idealLatestStartParts.utcMs &&
      todayParts.utcMs <= latestStartParts.utcMs
    ) {
      setOutput("return-status-title", "Je kunt nu aanvragen");
      setOutput(
        "return-status-description",
        `Je kunt de aanvraag voor je permanente verblijfsvergunning nog steeds starten, maar niet meer binnen de ideale periode zonder boete. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
      );
      showReturnStatusIcon("can-start");
      return;
    }

    const currentDateText = new Date().toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });

    setOutput("return-status-title", "Aanvraagperiode verstreken");
    setOutput(
      "return-status-description",
      `De aanvraagperiode voor je permanente verblijfsvergunning is verstreken. De uiterste datum om nog te starten was ${formatDateParts(latestStartParts)}. Vandaag is het ${currentDateText}. Neem contact met ons op om te bekijken welke mogelijkheden er nog zijn in jouw situatie.`
    );
    showReturnStatusIcon("too-late");
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

    // Als de uiterlijke terugkeerdatum later valt dan de laatste startdatum,
    // dan is de terugkeerregel niet van toepassing op de output/blokkade.
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
        `Je aanvraagperiode voor permanente verblijfsvergunning is nog niet geopend, maar je bent niet uiterlijk op ${formatDateParts(returnDeadlineParts)} teruggekeerd naar Paraguay. Daardoor voldoe je niet aan de 365-dagenregel. Een directe aanvraag voor permanente verblijfsvergunning is daarom niet mogelijk zodra je aanvraagperiode opent. Je moet eerst je tijdelijke verblijfsvergunning verlengen.`
      );
    } else {
      setOutput(
        "return-status-description",
        `Je aanvraagperiode voor permanente verblijfsvergunning is geopend, maar je bent niet uiterlijk op ${formatDateParts(returnDeadlineParts)} teruggekeerd naar Paraguay. Daardoor voldoe je niet aan de 365-dagenregel. Een directe aanvraag voor permanente verblijfsvergunning is daarom niet mogelijk. Je moet eerst je tijdelijke verblijfsvergunning verlengen.`
      );
    }

    showReturnStatusIcon("too-late");

    setOutput("pr-current-status-title", "Permanente verblijfsvergunning niet meer mogelijk");
    setOutput(
      "pr-current-status-description",
      `Je bent niet uiterlijk op ${formatDateParts(returnDeadlineParts)} teruggekeerd naar Paraguay. Daardoor is een directe overgang naar permanente verblijfsvergunning niet mogelijk. Je moet eerst je tijdelijke verblijfsvergunning verlengen.`
    );
    setOutput("pr-current-status-cta", "Tijdelijke verblijfsvergunning verlengen");
    showPrStatusIcon("too-late");

    setOutput("eligibility", "Directe overgang naar permanent niet mogelijk.");
    setOutput(
      "permanent-trip-status",
      `Je bent niet uiterlijk op ${formatDateParts(returnDeadlineParts)} teruggekeerd naar Paraguay.`
    );
  }

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
        `Goed nieuws! Je aanvraagperiode is gestart. Je kunt nu zonder boete starten met de aanvraag voor je permanente verblijfsvergunning. Je ideale aanvraagperiode loopt tot en met ${formatDateParts(idealLatestStartParts)}. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
      );
      setOutput("pr-current-status-cta", "Aanvraag starten");
      showPrStatusIcon("can-start");
      return;
    }

    if (todayParts.utcMs > idealLatestStartParts.utcMs && todayParts.utcMs <= latestStartParts.utcMs) {
      setOutput("pr-current-status-title", "Je kunt nu aanvragen");
      setOutput(
        "pr-current-status-description",
        `Je kunt je aanvraag voor je permanente verblijfsvergunning nog steeds starten, maar niet meer binnen de ideale periode zonder boete. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
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
      `De aanvraagperiode voor je permanente verblijfsvergunning is verstreken. De uiterste datum om nog te starten was ${formatDateParts(latestStartParts)}. Vandaag is het ${currentDateText}. Neem contact met ons op om te bekijken welke mogelijkheden er nog zijn in jouw situatie.`
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
    } else if (departureChoice === "yes" && returnDeadlineParts) {
      updateStep3JaStatusDescription(
        earliestStartParts,
        idealLatestStartParts,
        latestStartParts,
        returnDeadlineParts
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
    if (el) {
      el.addEventListener("change", calculateTemporaryResidencyDates);
    }
  });

  calculateTemporaryResidencyDates();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCalculator);
} else {
  initCalculator();
}