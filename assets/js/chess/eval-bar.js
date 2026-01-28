/**
 * Evaluation Bar Component
 * Displays chess position evaluation visually
 */

(function(window) {
    'use strict';

    function EvalBar(containerId, options) {
        this.options = options || {};
        this.container = document.getElementById(containerId);
        this.orientation = this.options.orientation || 'white';
        this.currentScore = 0;
        this.currentMate = null;

        this.init();
    }

    EvalBar.prototype.init = function() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="eval-bar-wrapper">
                <div class="eval-bar-container">
                    <div class="eval-bar-black">
                        <span class="eval-text eval-text-black"></span>
                    </div>
                    <div class="eval-bar-white">
                        <span class="eval-text eval-text-white"></span>
                    </div>
                </div>
            </div>
        `;

        this.blackBar = this.container.querySelector('.eval-bar-black');
        this.whiteBar = this.container.querySelector('.eval-bar-white');
        this.blackText = this.container.querySelector('.eval-text-black');
        this.whiteText = this.container.querySelector('.eval-text-white');

        this.updateDisplay();
    };

    EvalBar.prototype.setOrientation = function(color) {
        this.orientation = color;
        this.updateDisplay();
    };

    EvalBar.prototype.setScore = function(score, mate) {
        this.currentScore = score;
        this.currentMate = mate;
        this.updateDisplay();
    };

    EvalBar.prototype.getWinProbability = function(cp) {
        return 50 + 50 * (2 / (1 + Math.exp(-0.004 * cp)) - 1);
    };

    EvalBar.prototype.updateDisplay = function() {
        var whitePercent;
        var displayText = '';

        if (this.currentMate !== null) {
            whitePercent = this.currentMate > 0 ? 100 : 0;
            displayText = 'M' + Math.abs(this.currentMate);
        } else {
            whitePercent = this.getWinProbability(this.currentScore);
            var absScore = Math.abs(this.currentScore / 100).toFixed(1);
            if (absScore !== '0.0') {
                displayText = (this.currentScore > 0 ? '+' : '-') + absScore;
            }
        }

        var blackPercent = 100 - whitePercent;

        if (this.orientation === 'white') {
            this.blackBar.style.height = blackPercent + '%';
            this.whiteBar.style.height = whitePercent + '%';
        } else {
            this.blackBar.style.height = whitePercent + '%';
            this.whiteBar.style.height = blackPercent + '%';
        }

        if (this.currentScore > 0 || this.currentMate > 0) {
            this.whiteText.textContent = displayText;
            this.blackText.textContent = '';
        } else if (this.currentScore < 0 || this.currentMate < 0) {
            this.blackText.textContent = displayText.replace('-', '');
            this.whiteText.textContent = '';
        } else {
            this.whiteText.textContent = '';
            this.blackText.textContent = '';
        }
    };

    window.EvalBar = EvalBar;

})(window);
