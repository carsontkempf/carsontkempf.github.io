(function() {
  'use strict';

  var enabled = false;

  var numMap = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4 };

  function getChoiceLabels() {
    return document.querySelectorAll('#pt-choices .pt-choice');
  }

  // Returns the index of the currently selected choice (-1 if none)
  function selectedIndex() {
    var labels = getChoiceLabels();
    var selected = QuizEngine.state.selectedChoices;
    if (selected.length === 0) return -1;
    for (var i = 0; i < labels.length; i++) {
      if (selected.indexOf(labels[i].dataset.key) !== -1) return i;
    }
    return -1;
  }

  function onKeyDown(e) {
    // Don't intercept when focus is on a select/input/button
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (tag === 'BUTTON') return;

    var state = QuizEngine.state;

    if (state.submitted) {
      if (e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        var nextBtn = document.getElementById('pt-next-btn');
        if (nextBtn && nextBtn.style.display !== 'none') nextBtn.click();
      }
      return;
    }

    // Up/Down arrows: navigate choices (single-select only)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      var q = QuizEngine.currentQuestion();
      if (!q || q.type === 'multiple-select') return;
      var labels = getChoiceLabels();
      if (!labels.length) return;
      var cur = selectedIndex();
      var next;
      if (e.key === 'ArrowDown') {
        next = cur < 0 ? 0 : Math.min(cur + 1, labels.length - 1);
      } else {
        next = cur <= 0 ? 0 : cur - 1;
      }
      QuestionRenderer.toggleChoiceByIndex(next);
      return;
    }

    // Number keys 1-5: toggle/select that choice
    if (numMap[e.key] !== undefined) {
      e.preventDefault();
      QuestionRenderer.toggleChoiceByIndex(numMap[e.key]);
      return;
    }

    // Enter: submit if something selected
    if (e.key === 'Enter') {
      e.preventDefault();
      var submitBtn = document.getElementById('pt-submit-btn');
      if (submitBtn && !submitBtn.disabled && submitBtn.style.display !== 'none') {
        submitBtn.click();
      }
      return;
    }

    // Escape: quit quiz
    if (e.key === 'Escape') {
      if (window.QuizApp && QuizApp.quit) QuizApp.quit();
    }
  }

  function enable() {
    if (!enabled) {
      document.addEventListener('keydown', onKeyDown);
      enabled = true;
    }
  }

  function disable() {
    document.removeEventListener('keydown', onKeyDown);
    enabled = false;
  }

  window.KeyboardHandler = {
    enable: enable,
    disable: disable
  };

})();
