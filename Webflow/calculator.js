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


  function setRichOutput(key, parts) {
    document
      .querySelectorAll(
        `[data-tempres-output="${key}"]`
      )
      .forEach((element) => {
        element.replaceChildren();

        parts.forEach((part) => {
          // Normal text.
          if (typeof part === "string") {
            element.appendChild(
              document.createTextNode(part)
            );

            return;
          }

          // Optional line break.
          if (part?.type === "break") {
            element.appendChild(
              document.createElement("br")
            );

            return;
          }

          // Styled dynamic text.
          if (part?.text !== undefined) {
            const span =
              document.createElement("span");

            span.className =
              part.className || "result-date";

            span.textContent =
              String(part.text);

            element.appendChild(span);
          }
        });

        const hasContent =
          element.textContent.trim().length > 0;

        document
          .querySelectorAll(
            `[data-tempres-output-wrapper="${key}"]`
          )
          .forEach((wrapper) => {
            if (hasContent) {
              wrapper.style.removeProperty(
                "display"
              );

              wrapper.removeAttribute(
                "hidden"
              );
            } else {
              wrapper.style.setProperty(
                "display",
                "none",
                "important"
              );
            }
          });
      });
  }

  function setStep3NoStatusElementColor(color) {
    document
      .querySelectorAll(
        '[data-tempres-element="step3-no-status-element"]'
      )
      .forEach((element) => {
        element.classList.remove(
          "green",
          "yellow",
          "red"
        );

        if (color) {
          element.classList.add(color);
        }
      });
  }

  function setStep3YesStatusElementColor(color) {
    document
      .querySelectorAll(
        '[data-tempres-element="step3-yes-status-element"]'
      )
      .forEach((element) => {
        element.classList.remove(
          "green",
          "yellow",
          "red"
        );

        if (color) {
          element.classList.add(color);
        }
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

  function hideAllStep3YesStatusIcons() {
    document
      .querySelectorAll(
        '[data-step3-yes-status-icon="too-early"]'
      )
      .forEach(hide);

    document
      .querySelectorAll(
        '[data-step3-yes-status-icon="can-start"]'
      )
      .forEach(hide);

    document
      .querySelectorAll(
        '[data-step3-yes-status-icon="too-late"]'
      )
      .forEach(hide);
  }

  function showStep3YesStatusIcon(state) {
    hideAllStep3YesStatusIcons();

    document
      .querySelectorAll(
        `[data-step3-yes-status-icon="${state}"]`
      )
      .forEach(showBlock);
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
    const totalMonths =
      parts.year * 12 +
      parts.month +
      monthsToAdd;

    const targetYear = Math.floor(
      totalMonths / 12
    );

    const targetMonth =
      ((totalMonths % 12) + 12) % 12;

    const lastDayOfTargetMonth =
      new Date(
        Date.UTC(
          targetYear,
          targetMonth + 1,
          0
        )
      ).getUTCDate();

    const targetDay = Math.min(
      parts.day,
      lastDayOfTargetMonth
    );

    return createDateParts(
      targetDay,
      targetMonth + 1,
      targetYear
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

  function hasTripDateInput(card, group) {
    const placeholders = {
      day: ["", "dag", "day"],
      month: ["", "maand", "month"],
      year: ["", "jaar", "year"]
    };

    return ["day", "month", "year"].some((part) => {
      const value = String(
        getTripSource(part, group, card) || ""
      )
        .trim()
        .toLowerCase();

      return !placeholders[part].includes(value);
    });
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

  function resetStep5TripValues(tripToReset = null) {
    const trips = tripToReset
      ? [tripToReset]
      : getTripCards();

    trips.forEach((trip) => {
      window.selectCustomReadable?.reset(trip);

      clearTripError(trip);

      trip.classList.remove(
        "has-trip-error",
        "is-entering",
        "is-on-top"
      );
    });

    setTripValidationMessage([]);
    resetFinalStatusOutputs();
  }

  function resetTripCardData() {
    resetStep5TripValues();

    getTripCards().forEach((trip) => {
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
    const yesRadio = document.querySelector(
      '[data-departure-toggle="yes"]'
    );

    const noRadio = document.querySelector(
      '[data-departure-toggle="no"]'
    );

    const questionWrap = document.querySelector(
      '[data-departure-question="wrap"]'
    );

    const notificationWrap = document.querySelector(
      '[data-departure-notification="wrap"]'
    );

    const isReady = Boolean(issueDateParts);

    if (yesRadio) {
      yesRadio.disabled = !isReady;
    }

    if (noRadio) {
      noRadio.disabled = !isReady;
    }

    if (questionWrap) {
      questionWrap.classList.toggle(
        "is-disabled",
        !isReady
      );
    }

    if (notificationWrap) {
      if (isReady) {
        hide(notificationWrap);
      } else {
        showBlock(notificationWrap);
      }
    }
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

  function canShowStep4YesResult() {
    const visibleTrips = getVisibleTrips();

    if (!visibleTrips.length) {
      return false;
    }

    const everyTripHasReturn =
      visibleTrips.every((trip) => {
        return Boolean(
          getTripReturnDateParts(trip)
        );
      });

    if (!everyTripHasReturn) {
      return false;
    }

    const tripChain = buildTripChain();

    return (
      tripChain.messages.length === 0 &&
      tripChain.absences.length ===
        visibleTrips.length
    );
  }

  function hasStartedTripCard(card) {
    if (!isVisible(card)) {
      return false;
    }

    return (
      hasTripDateInput(card, "return") ||
      hasTripDateInput(card, "departure")
    );
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

      const returnStarted = hasTripDateInput(card, "return");
      const departureStarted = hasTripDateInput(card, "departure");
      const started = returnStarted || departureStarted;

      if (!started) {
        chainStopped = true;
        continue;
      }

      let cardHasError = false;

      // Inreisdatum is partially filled or impossible,
      // such as 31 April.
      if (returnStarted && !returnParts) {
        const msg = `Vul een volledige en geldige inreisdatum in.`;

        messages.push(msg);
        showTripError(card, msg, "return");
        cardHasError = true;
      }

      // A vertrekdatum was entered without an inreisdatum.
      if (!returnStarted && departureStarted) {
        const msg = `Vul eerst een geldige inreisdatum in.`;

        messages.push(msg);
        showTripError(card, msg, "return");
        cardHasError = true;
      }

      // Vertrekdatum is partially filled or impossible.
      if (departureStarted && !nextDepartureParts) {
        const msg = `Vul een volledige en geldige vertrekdatum in.`;

        messages.push(msg);
        showTripError(card, msg, "departure");
        cardHasError = true;
      }

      // Inreisdatum cannot be before the previous departure.
      if (
        returnParts &&
        returnParts.utcMs < previousDeparture.utcMs
      ) {
        const msg =
          cardNumber === 1
            ? `De inreisdatum kan niet vóór je eerste vertrek uit Paraguay liggen.`
            : `De inreisdatum kan niet vóór je vorige vertrek uit Paraguay liggen.`;

        messages.push(msg);
        showTripError(card, msg, "return");
        cardHasError = true;
      }

      // Validate a complete vertrekdatum.
      if (nextDepartureParts) {
        if (nextDepartureParts.utcMs < previousDeparture.utcMs) {
          const msg =
            cardNumber === 1
              ? `De vertrekdatum kan niet vóór je eerste vertrek uit Paraguay liggen.`
              : `De vertrekdatum kan niet vóór je vorige vertrek uit Paraguay liggen.`;

          messages.push(msg);
          showTripError(card, msg, "departure");
          cardHasError = true;
        } else if (
          returnParts &&
          nextDepartureParts.utcMs < returnParts.utcMs
        ) {
          const msg = `De vertrekdatum kan niet vóór de inreisdatum liggen.`;

          messages.push(msg);
          showTripError(card, msg, "departure");
          cardHasError = true;
        }
      }

      if (cardHasError) {
        chainStopped = true;
        continue;
      }

      absences.push({
        index: cardNumber,
        from: previousDeparture,
        to: returnParts,
        daysOutside: daysBetweenParts(
          previousDeparture,
          returnParts
        )
      });

      if (!nextDepartureParts) {
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

  function resetStep3YesStatusOutputs() {
    setOutput(
      "step3-yes-status-title",
      ""
    );

    setRichOutput(
      "step3-yes-status-description-1",
      []
    );

    setRichOutput(
      "step3-yes-status-description-2",
      []
    );

    setRichOutput(
      "step3-yes-status-description-3",
      []
    );

    setRichOutput(
      "step3-yes-status-description-4",
      []
    );

    setOutput(
      "step3-yes-status-cta",
      ""
    );

    setStep3YesStatusElementColor(null);
    hideAllStep3YesStatusIcons();
  }

  function resetStep3NoStatusOutputs() {
    setOutput(
      "step3-no-status-title",
      ""
    );

    setRichOutput(
      "step3-no-status-description-1",
      []
    );

    setRichOutput(
      "step3-no-status-description-2",
      []
    );

    setRichOutput(
      "step3-no-status-description-3",
      []
    );

    setRichOutput(
      "step3-no-status-description-4",
      []
    );

    setOutput(
      "step3-no-status-cta",
      ""
    );

    setStep3NoStatusElementColor(null);
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

// Terug keer naar Paraguay Nodig - YELLOW

    if (todayParts.utcMs >= issueDateParts.utcMs && todayParts.utcMs < earliestStartParts.utcMs) {
      setOutput("step3-no-status-title", "Terugkeer naar Paraguay nodig");
      setRichOutput(
        "step3-no-status-description-1",
        [
          "Je kunt de aanvraag voor je permanente verblijfsvergunning nog niet starten, omdat je nog niet bent teruggekeerd naar Paraguay. Het is belangrijk dat je uiterlijk op ",
          {
            text: formatDateParts(
              visitDeadlineParts
            ),
            className: "result-date"
          },
          " terugkeert naar Paraguay om in aanmerking te komen voor je permanente verblijfsvergunning."
        ]
      );
      setRichOutput(
        "step3-no-status-description-2",
        [
          "Je ideale aanvraagperiode loopt van ",
          {
            text: formatDateParts(
              earliestStartParts
            ),
            className: "result-date-bold"
          },
          " tot en met ",
          {
            text: formatDateParts(
              idealLatestStartParts
            ),
            className: "result-date-bold"
          },
          "."
        ]
      );
      setRichOutput(
        "step3-no-status-description-3",
        [
          "Dien je de aanvraag in na ",
          {
            text: formatDateParts(
              idealLatestStartParts
            ),
            className: "result-date-bold"
          },
          ", dan geldt een boete van 669.012 guaraní."
        ]
      );
      setRichOutput(
        "step3-no-status-description-4",
        [
          "Je kunt nog aanvragen tot en met ",
          {
            text: formatDateParts(
              latestStartParts
            ),
            className: "result-date-bold"
          },
          "."
        ]
      );
      setOutput("step3-no-status-cta", "Plan je terugkeer");
      setStep3NoStatusElementColor("yellow");
      showStep3NoStatusIcon("return-needed");
      return;
    }

// Je kunt nu aanvragen (zonder boete) - GREEN

    if (
      todayParts.utcMs >= earliestStartParts.utcMs &&
      todayParts.utcMs <= idealLatestStartParts.utcMs
    ) {
      setOutput("step3-no-status-title", "Je kunt nu aanvragen")
      setRichOutput(
        "step3-no-status-description-1",
        [
          "De aanvraagperiode voor je permanente verblijfsvergunning is geopend. Je kunt nu zonder boete starten met de aanvraag voor je permanente verblijfsvergunning."
        ]
      );
      setRichOutput(
        "step3-no-status-description-2",
        [
          "Je ideale aanvraagperiode loopt van ",
          {
            text: formatDateParts(
              earliestStartParts
            ),
            className:
              "result-date result-date-bold"
          },
          " tot en met ",
          {
            text: formatDateParts(
              idealLatestStartParts
            ),
            className:
              "result-date result-date-bold"
          },
          "."
        ]
      );
      setRichOutput(
        "step3-no-status-description-3",
        [
          "Dien je de aanvraag in na ",
          {
            text: formatDateParts(
              idealLatestStartParts
            ),
            className:
              "result-date result-date-bold"
          },
          ", dan geldt een boete van 669.012 guaraní."
        ]
      );
      setRichOutput(
        "step3-no-status-description-4",
        [
          "Je kunt nog aanvragen tot en met ",
          {
            text: formatDateParts(
              latestStartParts
            ),
            className:
              "result-date result-date-bold"
          },
          "."
        ]
      );
      setOutput("step3-no-status-cta", "Aanvraag starten");
      showStep3NoStatusIcon("can-start");
      setStep3NoStatusElementColor("green");
      return;
    }

// Je kunt nu aanvragen (met boete) - GREEN

    if (
      todayParts.utcMs > idealLatestStartParts.utcMs &&
      todayParts.utcMs <= latestStartParts.utcMs
    ) {
      setOutput("step3-no-status-title", "Je kunt nu aanvragen met een boete");
      setRichOutput(
        "step3-no-status-description-1",
        [
          "Je kunt de aanvraag voor je permanente verblijfsvergunning nog steeds starten."
        ]
      );
      setRichOutput(
        "step3-no-status-description-2",
        [
          "De ideale aanvraagperiode zonder boete is inmiddels verstreken."
        ]
      );
      setRichOutput(
        "step3-no-status-description-3",
        [
          "Dien je de aanvraag in na ",
          {
            text: formatDateParts(
              idealLatestStartParts
            ),
            className:
              "result-date result-date-bold"
          },
          ", dan geldt een boete van 669.012 guaraní."
        ]
      );
      setRichOutput(
        "step3-no-status-description-4",
        [
          "Je kunt nog aanvragen tot en met ",
          {
            text: formatDateParts(
              latestStartParts
            ),
            className:
              "result-date result-date-bold"
          },
          "."
        ]
      );
      setOutput("step3-no-status-cta", "Aanvraag starten");
      showStep3NoStatusIcon("can-start");
      setStep3NoStatusElementColor("green");
      return;
    }

    const currentDateText = new Date().toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });

// Aanvraagperiode verstreken - RED

    setOutput("step3-no-status-title", "Aanvraagperiode verstreken");
    setRichOutput(
      "step3-no-status-description-1",
      [
        "De aanvraagperiode voor je permanente verblijfsvergunning is verstreken."
      ]
    );
    setRichOutput(
      "step3-no-status-description-2",
      [
        "De uiterste datum om te starten was ",
        {
          text: formatDateParts(
            latestStartParts
          ),
          className:
            "result-date result-date-bold"
        },
        "."
      ]
    );
    setRichOutput(
      "step3-no-status-description-3",
      [
        "Vandaag is het ",
        {
          text: currentDateText,
          className:
            "result-date result-date-bold"
        },
        ". Neem contact met ons op om te bekijken welke mogelijkheden er nog zijn in jouw situatie."
      ]
    );
    setRichOutput(
      "step3-no-status-description-4",
      []
    );
    setOutput("step3-no-status-cta", "Bespreek je situatie");
    showStep3NoStatusIcon("too-late");
    setStep3NoStatusElementColor("red");
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
          setOutput("return-status-cta", "Plan je terugkeer");
          setOutput(
            "return-status-description",
            `De aanvraagperiode voor je permanente verblijfsvergunning is nog niet geopend. Je kunt de aanvraag starten vanaf ${formatDateParts(earliestStartParts)} tot en met ${formatDateParts(idealLatestStartParts)}. Na ${formatDateParts(idealLatestStartParts)} kun je nog aanvragen tot en met ${formatDateParts(latestStartParts)}, maar dan geldt een boete van 669.012 guaraní. Je uiterste terugkeerdatum is ${returnDeadlineText}, je moet dus vóór deze datum terugkomen naar Paraguay om de aanvraag voor je permanente verblijfsvergunning te starten.`
          );
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
          setOutput("return-status-cta", "Aanvraag starten");
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
          `Je kunt de aanvraag voor je permanente verblijfsvergunning nog niet starten, omdat je nog niet bent teruggekeerd naar Paraguay. Het is belangrijk dat je uiterlijk op ${returnDeadlineText} terugkeert naar Paraguay om in aanmerking te komen voor je permanente verblijfsvergunning. Je ideale aanvraagperiode loopt van ${formatDateParts(earliestStartParts)} tot en met ${formatDateParts(idealLatestStartParts)}. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
        );
        setOutput("return-status-cta", "Plan je terugkeer");
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

// STEP 4 = JA

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
      setOutput("final-status-cta", "Bespreek je situatie");
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

// STEP 4 = NEE
    setOutput("return-status-title", "Permanente verblijfsvergunning niet meer mogelijk");

    if (periodNotOpenYet) {
      setOutput(
        "return-status-description",
        `De aanvraagperiode voor je permanente verblijfsvergunning is nog niet geopend. Je bent niet uiterlijk op ${formatDateParts(returnDeadlineParts)} teruggekeerd naar Paraguay. Daardoor voldoe je niet aan de 365-dagenregel. Een directe aanvraag voor je permanente verblijfsvergunning is daarom niet mogelijk zodra de aanvraagperiode opent. Je moet eerst je tijdelijke verblijfsvergunning verlengen.`
      );
    } else {
      setOutput(
        "return-status-description",
        `De aanvraagperiode voor je permanente verblijfsvergunning is geopend. Je bent niet uiterlijk op ${formatDateParts(returnDeadlineParts)} teruggekeerd naar Paraguay. Daardoor voldoe je niet aan de 365-dagenregel. Een directe aanvraag voor je permanente verblijfsvergunning is daarom niet mogelijk. Je moet eerst je tijdelijke verblijfsvergunning verlengen.`
      );
    }

    showReturnStatusIcon("too-late");

// STEP 3 = JA
    setOutput("step3-yes-status-title", "Permanente verblijfsvergunning niet meer mogelijk");
    setOutput(
      "step3-yes-status-description-1",
      `Je bent niet uiterlijk op ${formatDateParts(returnDeadlineParts)} teruggekeerd naar Paraguay. Daardoor is een directe overgang van een tijdelijke verblijfsvergunning naar een permanente verblijfsvergunning niet mogelijk. Je moet eerst je tijdelijke verblijfsvergunning verlengen.`
    );
    setOutput("step3-yes-status-cta", "Tijdelijke verblijfsvergunning verlengen");
    setStep3YesStatusElementColor("red");
    showStep3YesStatusIcon("too-late");

    setOutput("eligibility", "Directe overgang naar permanent niet mogelijk.");
    setOutput(
      "permanent-trip-status",
      `Je bent niet uiterlijk op ${formatDateParts(returnDeadlineParts)} teruggekeerd naar Paraguay.`
    );
  }

// STEP 3 = JA

  function updateStep3YesStatus(earliestStartParts, idealLatestStartParts, latestStartParts) {
    const todayParts = getTodayDateParts();

    if (!earliestStartParts || !idealLatestStartParts || !latestStartParts || !todayParts) {
      resetStep3YesStatusOutputs();
      return;
    }

    if (todayParts.utcMs < earliestStartParts.utcMs) {
      setOutput("step3-yes-status-title", "Nog niet beschikbaar");

      setRichOutput(
        "step3-yes-status-description-1",
        [
          "Je kunt de aanvraag voor je permanente verblijfsvergunning nog niet starten."
        ]
      );
      setRichOutput(
        "step3-yes-status-description-2",
        [
          "Je ideale aanvraagperiode loopt van ",
          {
            text: formatDateParts(earliestStartParts),
            className: "result-date result-date-bold"
          },
          " tot en met ",
          {
            text: formatDateParts(idealLatestStartParts),
            className: "result-date result-date-bold"
          },
          "."
        ]
      );
      setRichOutput(
        "step3-yes-status-description-3",
        [
          "Dien je de aanvraag in na ",
          {
            text: formatDateParts(idealLatestStartParts),
            className: "result-date result-date-bold"
          },
          ", dan geldt een boete van 669.012 guaraní."
        ]
      );
      setRichOutput(
        "step3-yes-status-description-4",
        [
          "Je kunt nog aanvragen tot en met ",
          {
            text: formatDateParts(latestStartParts),
            className: "result-date result-date-bold"
          },
          "."
        ]
      );
      setOutput("step3-yes-status-cta", "Plan je aanvraag");
      setStep3YesStatusElementColor("yellow");
      showStep3YesStatusIcon("too-early");
      return;
    }

    if (
      todayParts.utcMs >= earliestStartParts.utcMs &&
      todayParts.utcMs <= idealLatestStartParts.utcMs
    ) {
      setOutput("step3-yes-status-title", "Je kunt nu aanvragen");

      setRichOutput(
        "step3-yes-status-description-1",
        [
          "De aanvraagperiode voor je permanente verblijfsvergunning is geopend. Je kunt nu zonder boete starten met de aanvraag voor je permanente verblijfsvergunning."
        ]
      );
      setRichOutput(
        "step3-yes-status-description-2",
        [
          "Je ideale aanvraagperiode loopt van ",
          {
            text: formatDateParts(earliestStartParts),
            className: "result-date result-date-bold"
          },
          " tot en met ",
          {
            text: formatDateParts(idealLatestStartParts),
            className: "result-date result-date-bold"
          },
          "."
        ]
      );
      setRichOutput(
        "step3-yes-status-description-3",
        [
          "Dien je de aanvraag in na ",
          {
            text: formatDateParts(idealLatestStartParts),
            className: "result-date result-date-bold"
          },
          ", dan geldt een boete van 669.012 guaraní."
        ]
      );
      setRichOutput(
        "step3-yes-status-description-4",
        [
          "Je kunt nog aanvragen tot en met ",
          {
            text: formatDateParts(latestStartParts),
            className: "result-date result-date-bold"
          },
          "."
        ]
      );
      setOutput("step3-yes-status-cta", "Aanvraag starten");
      setStep3YesStatusElementColor("green");
      showStep3YesStatusIcon("can-start");
      return;
    }

    if (todayParts.utcMs > idealLatestStartParts.utcMs && todayParts.utcMs <= latestStartParts.utcMs) {
      setOutput("step3-yes-status-title", "Je kunt nu aanvragen met een boete");
      setOutput(
        "step3-yes-status-description-1",
        `Je kunt de aanvraag voor je permanente verblijfsvergunning nog steeds starten, maar de ideale aanvraagperiode zonder boete is inmiddels verstreken. Dien je de aanvraag in na ${formatDateParts(idealLatestStartParts)}, dan geldt een boete van 669.012 guaraní. Je kunt nog aanvragen tot en met ${formatDateParts(latestStartParts)}.`
      );
      setOutput("step3-yes-status-cta", "Aanvraag starten");
      setStep3YesStatusElementColor("green");
      showStep3YesStatusIcon("can-start");
      return;
    }

    const currentDateText = new Date().toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });

    setOutput("step3-yes-status-title", "Aanvraagperiode verstreken");
    setOutput(
      "step3-yes-status-description-1",
      `De aanvraagperiode voor je permanente verblijfsvergunning is verstreken. De uiterste datum om nog te starten was ${formatDateParts(latestStartParts)}. 

      Vandaag is het ${currentDateText}. Neem contact met ons op om te bekijken welke mogelijkheden er nog zijn in jouw situatie.`
    );
    setOutput("step3-yes-status-cta", "Bespreek je situatie");
    setStep3YesStatusElementColor("red");
    showStep3YesStatusIcon("too-late");
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
    resetStep3YesStatusOutputs();
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

    if (departureChoice === "yes") {
      updateStep3YesStatus(
        earliestStartParts,
        idealLatestStartParts,
        latestStartParts
      );
    } else {
      resetStep3YesStatusOutputs();
    }

    const returnDeadlineParts = updateReturnDeadlineOutputs(
      issueDateParts,
      departureChoice,
      earliestStartParts
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
      resetReturnStatusOutputs();
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
      resetReturnStatusOutputs();
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

    const daysUntilFirstDeparture = daysBetweenParts(
      issueDateParts,
      departureDateParts
    );

    if (daysUntilFirstDeparture < 0) {
      const wrap = document.querySelector('[data-step3-date-error="wrap"]');
      if (wrap) showBlock(wrap);

      resetExtraTripsQuestion();
      resetTripCardData();
      resetReturnStatusOutputs();
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

    if (extraTripsChoice === "no") {
      const returnDeadlineOverstayCheck = getVisitDeadlineOverstayCheck(
        issueDateParts,
        returnDeadlineParts,
        latestStartParts
      );

      if (
        returnDeadlineOverstayCheck.applicable &&
        returnDeadlineOverstayCheck.blocked
      ) {
        showPermanentBlockedByVisitDeadline(
          returnDeadlineParts,
          earliestStartParts
        );

        resetFinalStatusOutputs();
        updateStepIcons(issueDateParts);
        return;
      }

      updateReturnStatusFromStep3(
        issueDateParts,
        returnDeadlineParts,
        earliestStartParts,
        idealLatestStartParts,
        latestStartParts
      );
    } else {
      resetReturnStatusOutputs();
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
    const trips = getTripCards();
    const addButton = document.querySelector(
      '[data-trip-add="button"]'
    );

    const step4YesRadio = document.querySelector(
      '[data-extra-trips-toggle="yes"]'
    );

    const step4NoRadio = document.querySelector(
      '[data-extra-trips-toggle="no"]'
    );

    const maxTrips = 4;

    trips.forEach((trip) => {
      trip
        .querySelectorAll(
          ':scope [data-trip-group] [data-tempres-source]'
        )
        .forEach((el) => {
          const observer = new MutationObserver(
            calculateTemporaryResidencyDates
          );

          observer.observe(el, {
            childList: true,
            characterData: true,
            subtree: true
          });
        });

      trip
        .querySelectorAll("input, select, textarea")
        .forEach((field) => {
          field.addEventListener(
            "input",
            calculateTemporaryResidencyDates
          );

          field.addEventListener(
            "change",
            calculateTemporaryResidencyDates
          );
        });
    });

    function getVisibleTripCards() {
      return trips.filter(isVisible);
    }

    function refreshTripUI() {
      const visibleTrips = getVisibleTripCards();

      visibleTrips.forEach((trip, index) => {
        const title = trip.querySelector(
          '[data-trip-label="title"]'
        );

        if (title) {
          title.textContent = `Reis ${index + 1}`;
        }
      });

      if (addButton) {
        addButton.style.display =
          visibleTrips.length >= maxTrips ? "none" : "flex";
      }
    }

    function showTripCard(trip) {
      if (!trip) return;

      trips.forEach((card) => {
        card.classList.remove("is-on-top");
      });

      trip.hidden = false;
      trip.style.display = "flex";
      trip.classList.add("is-entering", "is-on-top");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          trip.classList.remove("is-entering");
          calculateTemporaryResidencyDates();
        });
      });

      refreshTripUI();
    }

    function showNextTrip() {
      const nextHiddenTrip = trips.find(
        (trip) => !isVisible(trip)
      );

      showTripCard(nextHiddenTrip);
    }

    function showFirstTripIfNeeded() {
      if (getVisibleTripCards().length) return;
      showTripCard(trips[0]);
    }

    function hideAllTrips() {
      trips.forEach((trip) => {
        hide(trip);
        trip.classList.remove("is-entering", "is-on-top");
        clearTripError(trip);
      });

      refreshTripUI();
    }

    if (addButton) {
      addButton.addEventListener("click", function (e) {
        e.preventDefault();
        showNextTrip();
      });
    }

    document.addEventListener("click", function (e) {
      const removeButton = e.target.closest(
        '[data-trip-remove="button"]'
      );

      if (removeButton) {
        e.preventDefault();
        e.stopPropagation();

        const trip = removeButton.closest(
          '[data-trip-card="item"]'
        );

        if (!trip) return;

        // Reset while the custom fields are still active.
        resetStep5TripValues(trip);

        requestAnimationFrame(() => {
          hide(trip);

          trip.classList.remove(
            "is-entering",
            "is-on-top"
          );

          refreshTripUI();

          requestAnimationFrame(
            calculateTemporaryResidencyDates
          );
        });

        return;
      }

      const activeTrip = e.target.closest(
        '[data-trip-card="item"]'
      );

      trips.forEach((trip) => {
        trip.classList.remove("is-on-top");
      });

      if (activeTrip && isVisible(activeTrip)) {
        activeTrip.classList.add("is-on-top");
      }
    });

    if (step4YesRadio) {
      step4YesRadio.addEventListener("change", function () {
        if (!step4YesRadio.checked) return;

        requestAnimationFrame(() => {
          requestAnimationFrame(showFirstTripIfNeeded);
        });
      });
    }

    if (step4NoRadio) {
      step4NoRadio.addEventListener("change", function () {
        if (step4NoRadio.checked) {
          resetStep5TripValues();
          hideAllTrips();
        }
      });
    }

    if (step4YesRadio?.checked) {
      requestAnimationFrame(() => {
        requestAnimationFrame(showFirstTripIfNeeded);
      });
    }

    refreshTripUI();
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
      if (!el.checked) return;

      if (selector === '[data-extra-trips-toggle="no"]') {
        resetFinalStatusOutputs();
        setTripValidationMessage([]);
        calculateTemporaryResidencyDates();
        return;
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