(function() {
  'use strict';

  var state = {
    questions: [],
    currentIndex: 0,
    selectedChoices: [],
    submitted: false,
    correct: 0,
    total: 0,
    timerInterval: null,
    elapsedSeconds: 0,
    randomize: true,
    activeDataKey: null,
    activeLabel: null
  };

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function convertDefinitionsToMC(defs) {
    var pool = defs.filter(function(d) { return d.type === 'definition' && d.answer; });
    var keys = ['A', 'B', 'C', 'D'];
    return pool.map(function(def, i) {
      // Pick 3 wrong answers from the rest of the pool
      var others = pool.filter(function(d, j) { return j !== i; });
      var wrong = shuffle(others).slice(0, 3).map(function(d) { return d.answer; });
      // Shuffle correct + wrong into 4 slots
      var slots = shuffle([def.answer].concat(wrong));
      var choices = {}, correct = [], incorrect = [];
      slots.forEach(function(text, idx) {
        var k = keys[idx];
        choices[k] = text;
        if (text === def.answer) correct.push(k);
        else incorrect.push(k);
      });
      var correctExplanation = {};
      correctExplanation[correct[0]] = def.answer;
      return {
        question_number: i + 1,
        question: def.question,
        type: 'single-select',
        choices: choices,
        correct: correct,
        incorrect: incorrect,
        domain: def.domain || null,
        explanations: { correct: correctExplanation, incorrect: {} }
      };
    });
  }

  function loadSet(dataKey) {
    var raw = window.QUIZ_DATA[dataKey];
    if (!raw) return [];
    var arr = Array.isArray(raw) ? raw : (raw.questions || []);
    // If all entries are definitions, convert to multiple choice
    var allDefs = arr.length > 0 && arr.every(function(q) { return q.type === 'definition'; });
    if (allDefs) return convertDefinitionsToMC(arr);
    return arr.filter(function(q) {
      return q.type !== 'definition' && q.choices && q.correct && q.correct.length > 0;
    });
  }

  function startQuiz(dataKey, randomize, label) {
    stopTimer();
    var questions = loadSet(dataKey);
    if (randomize) {
      questions = shuffle(questions);
    }
    state.questions = questions;
    state.currentIndex = 0;
    state.selectedChoices = [];
    state.submitted = false;
    state.correct = 0;
    state.total = questions.length;
    state.elapsedSeconds = 0;
    state.randomize = randomize;
    state.activeDataKey = dataKey;
    state.activeLabel = label || dataKey;
    startTimer();
  }

  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(function() {
      state.elapsedSeconds++;
      if (window.QuestionRenderer && QuestionRenderer.updateTimer) {
        QuestionRenderer.updateTimer(state.elapsedSeconds);
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function currentQuestion() {
    return state.questions[state.currentIndex] || null;
  }

  function updateSelection(key) {
    var q = currentQuestion();
    if (!q || state.submitted) return;
    if (q.type === 'multiple-select') {
      var idx = state.selectedChoices.indexOf(key);
      if (idx === -1) {
        state.selectedChoices.push(key);
      } else {
        state.selectedChoices.splice(idx, 1);
      }
    } else {
      state.selectedChoices = [key];
    }
  }

  function submitAnswer() {
    if (state.submitted) return null;
    if (state.selectedChoices.length === 0) return null;
    var q = currentQuestion();
    if (!q) return null;
    state.submitted = true;
    var selected = state.selectedChoices.slice().sort();
    var correct = q.correct.slice().sort();
    var isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
    if (isCorrect) state.correct++;
    return { isCorrect: isCorrect, selected: state.selectedChoices.slice(), question: q };
  }

  function nextQuestion() {
    state.currentIndex++;
    state.selectedChoices = [];
    state.submitted = false;
    if (state.currentIndex >= state.total) {
      return false; // quiz done
    }
    return true;
  }

  function isLastQuestion() {
    return state.currentIndex >= state.total - 1;
  }

  function getProgress() {
    return {
      current: state.currentIndex + 1,
      total: state.total,
      percent: state.total > 0 ? ((state.currentIndex + 1) / state.total) * 100 : 0
    };
  }

  function getSummary() {
    var accuracy = state.total > 0 ? Math.round((state.correct / state.total) * 100) : 0;
    return {
      correct: state.correct,
      total: state.total,
      accuracy: accuracy,
      elapsed: state.elapsedSeconds,
      elapsedFormatted: formatTime(state.elapsedSeconds),
      label: state.activeLabel
    };
  }

  window.QuizEngine = {
    state: state,
    shuffle: shuffle,
    loadSet: loadSet,
    startQuiz: startQuiz,
    stopTimer: stopTimer,
    formatTime: formatTime,
    currentQuestion: currentQuestion,
    updateSelection: updateSelection,
    submitAnswer: submitAnswer,
    nextQuestion: nextQuestion,
    isLastQuestion: isLastQuestion,
    getProgress: getProgress,
    getSummary: getSummary
  };

})();
