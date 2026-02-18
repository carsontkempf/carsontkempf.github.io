(function() {
  'use strict';

  var DIFF_META = {
    easy:   { label: 'Easy',   color: '#27ae60', cls: 'easy' },
    medium: { label: 'Medium', color: '#e67e22', cls: 'medium' },
    hard:   { label: 'Hard',   color: '#c0392b', cls: 'hard' }
  };

  function showState(name) {
    var states = ['subject', 'select', 'question', 'summary'];
    states.forEach(function(s) {
      var el = document.getElementById('pt-' + s);
      if (el) el.style.display = (s === name) ? '' : 'none';
    });
  }

  function renderSubjects(subjects, onSelect) {
    var grid = document.getElementById('pt-subject-grid');
    if (!grid) return;
    grid.innerHTML = '';
    subjects.forEach(function(subject) {
      var btn = document.createElement('button');
      btn.className = 'pt-subject-btn';
      var img = document.createElement('img');
      img.src = subject.image;
      img.alt = subject.label;
      var lbl = document.createElement('span');
      lbl.className = 'pt-subject-label';
      lbl.textContent = subject.label;
      btn.appendChild(img);
      btn.appendChild(lbl);
      btn.addEventListener('click', function() { onSelect(subject); });
      grid.appendChild(btn);
    });
  }

  function renderRadioButtons(sets) {
    var container = document.getElementById('pt-radio-group');
    if (!container) return;
    container.innerHTML = '';
    var groups = {};
    var order = ['easy', 'medium', 'hard'];
    sets.forEach(function(s) {
      var d = s.difficulty || 'hard';
      if (!groups[d]) groups[d] = [];
      groups[d].push(s);
    });
    order.forEach(function(d) {
      if (!groups[d]) return;
      var meta = DIFF_META[d];
      var section = document.createElement('div');
      section.className = 'pt-radio-section pt-section-' + d;
      var heading = document.createElement('span');
      heading.className = 'pt-section-label';
      heading.textContent = meta.label;
      section.appendChild(heading);
      groups[d].forEach(function(s) {
        var label = document.createElement('label');
        label.className = 'pt-radio-option';
        var input = document.createElement('input');
        input.type = 'radio';
        input.name = 'pt-set';
        input.value = s.key;
        input.addEventListener('change', function() {
          var startBtn = document.getElementById('pt-start-btn');
          if (startBtn) startBtn.disabled = false;
        });
        var span = document.createElement('span');
        span.className = 'pt-radio-label';
        span.textContent = s.label;
        label.appendChild(input);
        label.appendChild(span);
        section.appendChild(label);
      });
      container.appendChild(section);
    });
  }

  function updateTimer(seconds) {
    var el = document.getElementById('pt-timer');
    if (el) el.textContent = QuizEngine.formatTime(seconds);
  }

  function updateProgressBar(percent) {
    var bar = document.getElementById('pt-progress-bar');
    if (bar) bar.style.width = percent + '%';
  }

  function esc(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render(question, index, total) {
    var progress = QuizEngine.getProgress();
    // Progress
    var progressText = document.getElementById('pt-progress-text');
    if (progressText) progressText.textContent = 'Question ' + progress.current + ' of ' + progress.total;
    updateProgressBar(((index) / total) * 100);

    // Type badge
    var typeBadge = document.getElementById('pt-type-badge');
    if (typeBadge) {
      typeBadge.textContent = question.type === 'multiple-select'
        ? 'Select all that apply'
        : 'Select one answer';
    }

    // Domain badge
    var domainBadge = document.getElementById('pt-domain-badge');
    if (domainBadge) {
      if (question.domain) {
        domainBadge.textContent = question.domain;
        domainBadge.style.display = '';
      } else {
        domainBadge.style.display = 'none';
      }
    }

    // Question text
    var qText = document.getElementById('pt-question-text');
    if (qText) qText.innerHTML = esc(question.question);

    // Choices
    var choicesEl = document.getElementById('pt-choices');
    if (!choicesEl) return;
    choicesEl.innerHTML = '';

    var keys = Object.keys(question.choices);
    var isMulti = question.type === 'multiple-select';
    var inputType = isMulti ? 'checkbox' : 'radio';

    keys.forEach(function(key, i) {
      var label = document.createElement('label');
      label.className = 'pt-choice';
      label.dataset.key = key;

      var input = document.createElement('input');
      input.type = inputType;
      input.name = 'pt-choice';
      input.value = key;
      input.dataset.key = key;

      var keySpan = document.createElement('span');
      keySpan.className = 'pt-choice-key';
      keySpan.textContent = (i + 1) + '.';

      var textSpan = document.createElement('span');
      textSpan.textContent = key + '. ' + question.choices[key];

      label.appendChild(input);
      label.appendChild(keySpan);
      label.appendChild(textSpan);

      label.addEventListener('change', function() {
        QuizEngine.updateSelection(key);
        syncSelectionStyles();
        // Enable submit if something selected
        var submitBtn = document.getElementById('pt-submit-btn');
        if (submitBtn) submitBtn.disabled = QuizEngine.state.selectedChoices.length === 0;
      });

      choicesEl.appendChild(label);
    });

    // Reset explanation / buttons
    var expEl = document.getElementById('pt-explanation');
    if (expEl) { expEl.innerHTML = ''; expEl.style.display = 'none'; }

    var submitBtn = document.getElementById('pt-submit-btn');
    var nextBtn = document.getElementById('pt-next-btn');
    var resultBanner = document.getElementById('pt-result-banner');

    if (submitBtn) { submitBtn.style.display = ''; submitBtn.disabled = true; }
    if (nextBtn) nextBtn.style.display = 'none';
    if (resultBanner) resultBanner.style.display = 'none';
  }

  function syncSelectionStyles() {
    var selected = QuizEngine.state.selectedChoices;
    var labels = document.querySelectorAll('.pt-choice');
    labels.forEach(function(label) {
      var key = label.dataset.key;
      if (selected.indexOf(key) !== -1) {
        label.classList.add('pt-choice-selected');
      } else {
        label.classList.remove('pt-choice-selected');
      }
    });
  }

  // Called externally by keyboard handler to toggle a choice by numeric position
  function toggleChoiceByIndex(idx) {
    var labels = document.querySelectorAll('.pt-choice');
    if (idx < 0 || idx >= labels.length) return;
    var key = labels[idx].dataset.key;
    var input = labels[idx].querySelector('input');
    if (!input || QuizEngine.state.submitted) return;
    if (input.type === 'radio') {
      input.checked = true;
    } else {
      input.checked = !input.checked;
    }
    QuizEngine.updateSelection(key);
    syncSelectionStyles();
    var submitBtn = document.getElementById('pt-submit-btn');
    if (submitBtn) submitBtn.disabled = QuizEngine.state.selectedChoices.length === 0;
  }

  function showResult(question, isCorrect, selected) {
    // Result banner
    var resultBanner = document.getElementById('pt-result-banner');
    if (resultBanner) {
      resultBanner.style.display = '';
      resultBanner.className = 'pt-result-banner ' + (isCorrect ? 'correct' : 'incorrect');
      resultBanner.textContent = isCorrect ? 'Correct!' : 'Incorrect';
    }

    // Style choices
    var labels = document.querySelectorAll('.pt-choice');
    labels.forEach(function(label) {
      var key = label.dataset.key;
      var isCorrectChoice = question.correct.indexOf(key) !== -1;
      var wasSelected = selected.indexOf(key) !== -1;

      label.classList.remove('pt-choice-selected');
      label.classList.add('pt-choice-disabled');

      if (isCorrectChoice && wasSelected) {
        label.classList.add('pt-choice-correct');
      } else if (!isCorrectChoice && wasSelected) {
        label.classList.add('pt-choice-wrong');
      } else if (isCorrectChoice && !wasSelected) {
        label.classList.add('pt-choice-missed');
      }
    });

    // Disable inputs
    var inputs = document.querySelectorAll('.pt-choice input');
    inputs.forEach(function(inp) { inp.disabled = true; });

    // Build explanation
    buildExplanation(question, selected);

    // Swap buttons
    var submitBtn = document.getElementById('pt-submit-btn');
    var nextBtn = document.getElementById('pt-next-btn');
    if (submitBtn) submitBtn.style.display = 'none';
    if (nextBtn) {
      nextBtn.style.display = '';
      nextBtn.textContent = QuizEngine.isLastQuestion() ? 'See Results' : 'Next';
    }

    // Update progress to reflect answered
    updateProgressBar(((QuizEngine.state.currentIndex + 1) / QuizEngine.state.total) * 100);
  }

  function buildExplanation(question, selected) {
    var expEl = document.getElementById('pt-explanation');
    if (!expEl) return;
    var html = '';

    // Single explanation string (intro questions format)
    if (question.explanation && typeof question.explanation === 'string') {
      html += '<div class="pt-explanation-item pt-exp-neutral"><span class="pt-explanation-label">Explanation:</span>' + esc(question.explanation) + '</div>';
    }

    // Per-choice explanations object (cloudPractitioner format)
    if (question.explanations) {
      var keys = Object.keys(question.choices);
      keys.forEach(function(key) {
        var isCorrect = question.correct.indexOf(key) !== -1;
        var wasSelected = selected.indexOf(key) !== -1;
        var expText = null;

        if (isCorrect && question.explanations.correct && question.explanations.correct[key]) {
          expText = question.explanations.correct[key];
        } else if (!isCorrect && question.explanations.incorrect && question.explanations.incorrect[key]) {
          expText = question.explanations.incorrect[key];
        }

        if (expText) {
          var cls = isCorrect ? 'pt-exp-correct' : 'pt-exp-wrong';
          html += '<div class="pt-explanation-item ' + cls + '"><span class="pt-explanation-label">' + esc(key) + ':</span>' + esc(expText) + '</div>';
        }
      });
    }

    // Reference link
    if (question.reference) {
      html += '<div class="pt-reference">Reference: <a href="' + esc(question.reference) + '" target="_blank" rel="noopener">' + esc(question.reference) + '</a></div>';
    }

    if (html) {
      expEl.innerHTML = html;
      expEl.style.display = '';
    }
  }

  function renderSummary(summary) {
    var titleEl = document.getElementById('pt-summary-title');
    if (titleEl) titleEl.textContent = 'Quiz Complete';

    var labelEl = document.getElementById('pt-summary-set-label');
    if (labelEl) labelEl.textContent = summary.label;

    var accuracyEl = document.getElementById('pt-stat-accuracy');
    if (accuracyEl) {
      accuracyEl.textContent = summary.accuracy + '%';
      accuracyEl.className = 'pt-stat-value';
      if (summary.accuracy >= 80) accuracyEl.classList.add('good');
      else if (summary.accuracy >= 60) accuracyEl.classList.add('ok');
      else accuracyEl.classList.add('poor');
    }

    var correctEl = document.getElementById('pt-stat-correct');
    if (correctEl) correctEl.textContent = summary.correct + '/' + summary.total;

    var timeEl = document.getElementById('pt-stat-time');
    if (timeEl) timeEl.textContent = summary.elapsedFormatted;
  }

  window.QuestionRenderer = {
    showState: showState,
    renderSubjects: renderSubjects,
    renderRadioButtons: renderRadioButtons,
    updateTimer: updateTimer,
    updateProgressBar: updateProgressBar,
    render: render,
    showResult: showResult,
    renderSummary: renderSummary,
    toggleChoiceByIndex: toggleChoiceByIndex,
    syncSelectionStyles: syncSelectionStyles
  };

})();
