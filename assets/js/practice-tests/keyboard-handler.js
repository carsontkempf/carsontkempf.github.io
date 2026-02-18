(function() {
  'use strict';

  var enabled = false;

  var numMap = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4 };

  function onKeyDown(e) {
    // Don't intercept when focus is on a select/input/button
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'SELECT' || tag === 'TEXTAREA') return;
    // Allow button clicks via enter when button is focused
    if (tag === 'BUTTON') return;

    var state = QuizEngine.state;

    if (state.submitted) {
      // After answer submitted: Enter or ArrowRight advances
      if (e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        var nextBtn = document.getElementById('pt-next-btn');
        if (nextBtn && nextBtn.style.display !== 'none') nextBtn.click();
      }
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
