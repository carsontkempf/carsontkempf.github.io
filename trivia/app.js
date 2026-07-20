/**
 * Trivia Tennis - Main Application Controller
 * 
 * Flow: Login/Register -> Dashboard -> Game
 * Supports: same-device (hot-seat) OR two-device (Supabase real-time sync)
 * Persistent sessions: resume matches, track stats, user accounts
 */

class TriviaGame {
    constructor() {
        this.sync = new GameSync();
        this.match = null;
        this.wheel = null;
        this.questions = [];
        this.usedQuestionIds = new Set();
        this.currentQuestion = null;
        this.timerInterval = null;
        this.timeLeft = 15;
        this.state = "auth";
        this.questionsByCategory = {};
        this.isOnline = false;
        this.localMode = false;
        
        this.playerId = null;
        this.player1Name = "";
        this.player2Name = "";
        this.gameState = null;
        
        // Adaptive difficulty
        this.recentAnswers = [];
        this.currentDifficulty = "medium";
    }

    async init() {
        await this.loadQuestions();
        
        try {
            await this.sync.init();
            this.isOnline = true;
        } catch (e) {
            console.warn("Supabase not available.", e);
            this.isOnline = false;
        }
        
        this.bindUI();
        
        // Try to restore session - trust localStorage cache first for instant load
        const cached = localStorage.getItem("trivia_user");
        if (cached && this.isOnline) {
            try {
                this.sync.currentUser = JSON.parse(cached);
                this.showScreen("dashboard");
                this.loadDashboard();
                // Verify in background (refresh stats silently)
                this.sync.restoreSession().then(user => {
                    if (user) this.loadDashboard();
                    else { this.sync.currentUser = null; this.showScreen("auth"); }
                }).catch(() => {});
                return;
            } catch (e) {
                localStorage.removeItem("trivia_user");
            }
        }
        
        this.showScreen("auth");
    }

    async loadQuestions() {
        try {
            const resp = await fetch("questions.json");
            const data = await resp.json();
            this.questions = data.questions || data;
            for (const q of this.questions) {
                if (!this.questionsByCategory[q.category]) {
                    this.questionsByCategory[q.category] = [];
                }
                this.questionsByCategory[q.category].push(q);
            }
            console.log(`Loaded ${this.questions.length} questions`);
        } catch (e) {
            console.error("Failed to load questions:", e);
            this.showError("Failed to load trivia questions.");
        }
    }

    // ========================
    // AUTH
    // ========================

    async doLogin() {
        const username = document.getElementById("auth-username").value.trim();
        const password = document.getElementById("auth-password").value.trim();
        if (!username || !password) { this.showError("Enter username and password"); return; }
        
        try {
            await this.sync.login(username, password);
            this.showScreen("dashboard");
            this.loadDashboard();
        } catch (e) {
            this.showError(e.message);
        }
    }

    async doRegister() {
        const username = document.getElementById("auth-username").value.trim();
        const password = document.getElementById("auth-password").value.trim();
        if (!username || !password) { this.showError("Enter username and password"); return; }
        if (username.length < 3) { this.showError("Username must be at least 3 characters"); return; }
        if (password.length < 4) { this.showError("Password must be at least 4 characters"); return; }
        
        try {
            await this.sync.register(username, password);
            this.showScreen("dashboard");
            this.loadDashboard();
        } catch (e) {
            this.showError(e.message);
        }
    }

    doLogout() {
        this.sync.logout();
        this.showScreen("auth");
    }

    // ========================
    // DASHBOARD
    // ========================

    async loadDashboard() {
        const user = this.sync.currentUser;
        if (!user) return;
        
        document.getElementById("dash-username").textContent = user.username;
        
        // Stats
        const stats = user.stats || {};
        document.getElementById("dash-wins").textContent = stats.wins || 0;
        document.getElementById("dash-losses").textContent = stats.losses || 0;
        document.getElementById("dash-forfeits").textContent = stats.forfeits || 0;
        
        const totalQ = stats.total_questions || 0;
        const correctQ = stats.correct_answers || 0;
        const accuracy = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
        document.getElementById("dash-accuracy").textContent = accuracy + "%";
        document.getElementById("dash-total-q").textContent = totalQ;
        
        // Category stats
        const catStatsEl = document.getElementById("dash-category-stats");
        if (catStatsEl && stats.category_stats) {
            let html = "";
            const catColors = {"Science":"#4CAF50","History":"#FF9800","Entertainment":"#E91E63","Geography":"#2196F3","Art":"#9C27B0","Sports":"#FF5722"};
            for (const [cat, s] of Object.entries(stats.category_stats)) {
                const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                html += `<div class="cat-stat-row"><span class="cat-stat-name">${cat}</span><div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pct}%;background:${catColors[cat]||'#666'}"></div></div><span class="cat-stat-pct">${pct}%</span></div>`;
            }
            catStatsEl.innerHTML = html || '<p class="hint">Play some matches to see category stats</p>';
        }
        
        // Load matches
        await this.loadMatchList();
    }

    async loadMatchList() {
        const matches = await this.sync.getMyMatches();
        const listEl = document.getElementById("match-list");
        if (!listEl) return;
        
        if (matches.length === 0) {
            listEl.innerHTML = '<p class="hint">No matches yet. Create or join one!</p>';
            return;
        }
        
        let html = "";
        for (const m of matches) {
            const state = m.state || {};
            const players = state.players || {};
            const opponent = m.player1_id === this.sync.currentUser.id
                ? (players.p2 || "Waiting...")
                : (players.p1 || "Unknown");
            
            const isMyTurn = state.currentTurn === (m.player1_id === this.sync.currentUser.id ? 1 : 2);
            
            let statusText = "";
            let statusClass = "";
            if (m.status === "waiting") {
                statusText = "Waiting for opponent";
                statusClass = "status-waiting";
            } else if (m.status === "playing") {
                statusText = isMyTurn ? "Your turn" : "Their turn";
                statusClass = isMyTurn ? "status-myturn" : "status-theirturn";
            } else if (m.status === "finished") {
                statusText = m.winner_id === this.sync.currentUser.id ? "Won" : "Lost";
                statusClass = m.winner_id === this.sync.currentUser.id ? "status-won" : "status-lost";
            } else if (m.status === "forfeited") {
                const forfeitedByMe = state.forfeitedBy === this.sync.currentUser.id;
                statusText = forfeitedByMe ? "Forfeited" : "Opp. forfeited";
                statusClass = "status-forfeit";
            }
            
            // Score summary
            let scoreText = "";
            if (state.tennisState) {
                const ts = state.tennisState;
                const p1Sets = (ts.sets || []).filter(s => s.winner === 1).length;
                const p2Sets = (ts.sets || []).filter(s => s.winner === 2).length;
                scoreText = `${p1Sets}-${p2Sets}`;
            }
            
            const canResume = m.status === "playing" || m.status === "waiting";
            const canForfeit = m.status === "playing";
            
            html += `<div class="match-card">
                <div class="match-card-top">
                    <span class="match-opponent">vs ${opponent}</span>
                    <span class="match-score">${scoreText}</span>
                </div>
                <div class="match-card-bottom">
                    <span class="match-status ${statusClass}">${statusText}</span>
                    <span class="match-code-small">${m.id}</span>
                </div>
                <div class="match-card-actions">
                    ${canResume ? `<button class="btn btn-sm btn-primary" onclick="game.resumeMatch('${m.id}')">Resume</button>` : ""}
                    ${canForfeit ? `<button class="btn btn-sm btn-ghost" onclick="game.forfeitMatch('${m.id}')">Forfeit</button>` : ""}
                </div>
            </div>`;
        }
        
        listEl.innerHTML = html;
    }

    // ========================
    // MATCH MANAGEMENT
    // ========================

    showNewMatchScreen() {
        this.showScreen("new-match");
    }

    async createOnlineMatch() {
        const tiebreak = this.getToggleValue("tiebreak-toggle") === "on";
        const setsToWin = parseInt(this.getToggleValue("sets-toggle")) || 3;
        this.player1Name = this.sync.currentUser.username;
        this.playerId = 1;
        this.localMode = false;
        
        const initialState = {
            version: Date.now(),
            status: "waiting",
            options: { tiebreak, setsToWin },
            players: { p1: this.player1Name, p2: null },
            currentTurn: 1,
            tennisState: null,
            usedQuestions: [],
        };
        
        try {
            const code = await this.sync.createMatch(initialState);
            this.gameState = initialState;
            document.getElementById("match-code-display").textContent = code;
            this.showScreen("waiting");
            this.sync.onStateChange = (state) => this.handleRemoteUpdate(state);
        } catch (e) {
            this.showError("Failed to create match: " + e.message);
        }
    }

    async joinMatchByCode() {
        const code = document.getElementById("join-code-input").value.trim();
        if (!code || code.length !== 6) { this.showError("Enter a 6-letter match code"); return; }
        
        this.player2Name = this.sync.currentUser.username;
        this.playerId = 2;
        this.localMode = false;
        
        try {
            const state = await this.sync.joinMatch(code);
            if (!state || !state.players) { this.showError("Match not found or invalid."); return; }
            
            this.player1Name = state.players.p1;
            const tiebreak = state.options ? state.options.tiebreak : false;
            const setsToWin = state.options ? (state.options.setsToWin || 1) : 1;
            this.match = new TennisMatch(this.player1Name, this.player2Name, { tiebreak, setsToWin });
            
            state.players.p2 = this.player2Name;
            state.status = "playing";
            state.currentTurn = 1;
            state.tennisState = this.match.serialize();
            state.version = Date.now();
            
            await this.sync.writeState(state);
            this.gameState = state;
            this.sync.onStateChange = (s) => this.handleRemoteUpdate(s);
            this.startGame();
        } catch (e) {
            this.showError("Failed to join: " + e.message);
        }
    }

    async resumeMatch(matchId) {
        try {
            const matchData = await this.sync.resumeMatch(matchId);
            if (!matchData || !matchData.state) { this.showError("Could not load match"); return; }
            
            const state = matchData.state;
            this.gameState = state;
            this.localMode = false;
            
            // Determine which player we are
            if (matchData.player1_id === this.sync.currentUser.id) {
                this.playerId = 1;
                this.player1Name = state.players.p1;
                this.player2Name = state.players.p2 || "Waiting...";
            } else {
                this.playerId = 2;
                this.player1Name = state.players.p1;
                this.player2Name = state.players.p2;
            }
            
            // If still waiting for P2
            if (matchData.status === "waiting") {
                document.getElementById("match-code-display").textContent = matchId;
                this.showScreen("waiting");
                this.sync.onStateChange = (s) => this.handleRemoteUpdate(s);
                return;
            }
            
            // Resume active game
            if (state.tennisState) {
                this.match = TennisMatch.deserialize(state.tennisState);
            } else {
                const tiebreak = state.options ? state.options.tiebreak : false;
                const setsToWin = state.options ? (state.options.setsToWin || 1) : 1;
                this.match = new TennisMatch(this.player1Name, this.player2Name, { tiebreak, setsToWin });
            }
            
            this.sync.onStateChange = (s) => this.handleRemoteUpdate(s);
            this.startGame();
        } catch (e) {
            this.showError("Failed to resume: " + e.message);
        }
    }

    async forfeitMatch(matchId) {
        if (!confirm("Forfeit this match? This counts as a loss.")) return;
        try {
            await this.sync.forfeitMatch(matchId);
            await this.loadDashboard();
        } catch (e) {
            this.showError("Failed to forfeit: " + e.message);
        }
    }

    // Local mode
    startLocalGame() {
        const p1 = document.getElementById("local-p1-name").value.trim();
        const p2 = document.getElementById("local-p2-name").value.trim();
        if (!p1) { this.showError("Enter Player 1 name"); return; }
        if (!p2) { this.showError("Enter Player 2 name"); return; }
        
        const tiebreak = this.getToggleValue("local-tiebreak-toggle") === "on";
        const setsToWin = parseInt(this.getToggleValue("local-sets-toggle")) || 3;
        this.player1Name = p1;
        this.player2Name = p2;
        this.playerId = 1;
        this.localMode = true;
        this.match = new TennisMatch(p1, p2, { tiebreak, setsToWin });
        this.gameState = { currentTurn: 1, status: "playing" };
        this.startGame();
    }

    // ========================
    // REMOTE UPDATES
    // ========================

    handleRemoteUpdate(state) {
        if (!state) return;
        this.gameState = state;
        
        if (document.getElementById("screen-waiting").classList.contains("active")) {
            if (state.status === "playing" && state.players.p2) {
                this.player2Name = state.players.p2;
                this.match = TennisMatch.deserialize(state.tennisState);
                this.startGame();
                return;
            }
        }
        
        if (this.state === "playing") {
            if (state.tennisState) {
                this.match = TennisMatch.deserialize(state.tennisState);
                this.updateScoreboard();
            }
            if (state.usedQuestions) {
                this.usedQuestionIds = new Set(state.usedQuestions);
            }
            if (state.status === "finished") { this.endMatch(); return; }
            
            const isMyTurn = (state.currentTurn === this.playerId);
            this.updateTurnIndicator();
            if (isMyTurn) { this.showPhase("spin"); }
            else { this.showPhase("waiting-turn"); }
        }
    }

    async refreshState() {
        const btn = document.getElementById("btn-refresh");
        btn.disabled = true;
        btn.textContent = "Checking...";
        try {
            if (this.isOnline && this.sync.matchId) {
                const state = await this.sync.readState();
                if (state) this.handleRemoteUpdate(state);
            }
            btn.textContent = "Updated!";
        } catch (e) {
            btn.textContent = "Error";
        }
        setTimeout(() => { btn.textContent = "Refresh"; btn.disabled = false; }, 1500);
    }

    // ========================
    // GAME FLOW
    // ========================

    startGame() {
        this.state = "playing";
        this.showScreen("game");
        
        this.wheel = new CategoryWheel("wheel-canvas");
        const wheelSize = Math.min(300, window.innerWidth - 48);
        this.wheel.resize(wheelSize, wheelSize);
        
        if (this.gameState && this.gameState.usedQuestions) {
            this.usedQuestionIds = new Set(this.gameState.usedQuestions);
        }
        
        this.recentAnswers = [];
        this.currentDifficulty = "medium";
        
        // Per-player difficulty tracking (independent)
        this.playerDifficulty = { 1: "medium", 2: "medium" };
        this.playerStreaks = { 1: { correct: 0, wrong: 0, questionsThisTurn: 0 }, 2: { correct: 0, wrong: 0, questionsThisTurn: 0 } };
        
        this.updateScoreboard();
        this.updateTurnIndicator();
        
        const currentTurn = this.gameState ? this.gameState.currentTurn : 1;
        const isMyTurn = this.localMode ? true : (currentTurn === this.playerId);
        if (isMyTurn) { this.showPhase("spin"); }
        else { this.showPhase("waiting-turn"); }
    }

    /**
     * Adaptive difficulty - per player, independent.
     * 
     * Dropping difficulty (easier to drop):
     * - Wrong on 1st question of turn: 100% chance to drop
     * - Wrong on 2nd question: 50% chance to drop
     * - Wrong on 3rd+: 25% chance to drop
     * 
     * Gaining difficulty (harder to gain):
     * - Need 4+ correct in a row to have a chance to increase
     * - 4 correct: 25% chance
     * - 5 correct: 50% chance
     * - 6+ correct: 75% chance
     */
    getAdaptiveDifficulty() {
        const currentTurn = this.gameState ? this.gameState.currentTurn : 1;
        return this.playerDifficulty[currentTurn] || "medium";
    }

    /**
     * Called after each answer to potentially adjust difficulty for the current player.
     */
    adjustDifficulty(correct) {
        const currentTurn = this.gameState ? this.gameState.currentTurn : 1;
        const streak = this.playerStreaks[currentTurn];
        const currentDiff = this.playerDifficulty[currentTurn];
        
        streak.questionsThisTurn++;
        
        if (correct) {
            streak.correct++;
            streak.wrong = 0;
            
            // Gaining difficulty - harder to go up
            if (streak.correct >= 4 && currentDiff !== "hard") {
                let chance = 0;
                if (streak.correct === 4) chance = 0.25;
                else if (streak.correct === 5) chance = 0.50;
                else chance = 0.75;
                
                if (Math.random() < chance) {
                    this.playerDifficulty[currentTurn] = currentDiff === "easy" ? "medium" : "hard";
                    streak.correct = 0; // Reset streak after upgrade
                }
            }
        } else {
            streak.wrong++;
            streak.correct = 0;
            
            // Dropping difficulty - easier to go down
            if (currentDiff !== "easy") {
                let chance = 0;
                if (streak.questionsThisTurn === 1) chance = 1.0;   // First question wrong = guaranteed drop
                else if (streak.questionsThisTurn === 2) chance = 0.5;
                else chance = 0.25;
                
                if (Math.random() < chance) {
                    this.playerDifficulty[currentTurn] = currentDiff === "hard" ? "medium" : "easy";
                }
            }
            
            // Reset questions counter for next turn
            streak.questionsThisTurn = 0;
        }
        
        this.currentDifficulty = this.playerDifficulty[currentTurn];
    }

    async spinWheel() {
        if (!this.wheel) return;
        document.getElementById("btn-spin").disabled = true;
        const result = await this.wheel.spin();
        document.getElementById("btn-spin").disabled = false;
        if (result) this.pickAndShowQuestion(result.name);
    }

    pickAndShowQuestion(category) {
        const difficulty = this.getAdaptiveDifficulty();
        let available = (this.questionsByCategory[category] || [])
            .filter(q => !this.usedQuestionIds.has(q.id) && q.difficulty === difficulty);
        if (available.length === 0) {
            available = (this.questionsByCategory[category] || [])
                .filter(q => !this.usedQuestionIds.has(q.id));
        }
        if (available.length === 0) {
            available = this.questions.filter(q => !this.usedQuestionIds.has(q.id));
            if (available.length === 0) { this.usedQuestionIds.clear(); return this.pickAndShowQuestion(category); }
        }
        this.showQuestion(available[Math.floor(Math.random() * available.length)]);
    }

    showQuestion(question) {
        this.usedQuestionIds.add(question.id);
        const answers = [...question.incorrect_answers, question.correct_answer];
        const shuffled = answers.sort(() => Math.random() - 0.5);
        this.currentQuestion = {
            id: question.id, text: question.question, answers: shuffled,
            correctIndex: shuffled.indexOf(question.correct_answer),
            category: question.category, difficulty: question.difficulty,
        };
        this.displayQuestion(this.currentQuestion);
    }

    displayQuestion(question) {
        this.showPhase("question");
        document.getElementById("question-category").textContent = question.category;
        const diffEl = document.getElementById("question-difficulty");
        diffEl.textContent = question.difficulty;
        diffEl.className = "difficulty-badge " + question.difficulty;
        document.getElementById("question-text").textContent = question.text;
        
        const container = document.getElementById("answers-container");
        container.innerHTML = "";
        question.answers.forEach((answer, idx) => {
            const btn = document.createElement("button");
            btn.className = "answer-btn";
            btn.dataset.index = idx;
            btn.textContent = answer;
            container.appendChild(btn);
        });
        this.startTimer();
    }

    startTimer() {
        this.timeLeft = 15;
        this.updateTimerDisplay();
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) { clearInterval(this.timerInterval); this.processAnswer(false); }
        }, 1000);
    }

    updateTimerDisplay() {
        const el = document.getElementById("timer");
        if (el) { el.textContent = this.timeLeft + "s"; el.className = this.timeLeft <= 5 ? "timer urgent" : "timer"; }
    }

    async submitAnswer(answerIndex) {
        if (!this.currentQuestion) return;
        clearInterval(this.timerInterval);
        const idx = parseInt(answerIndex);
        const correct = (idx === this.currentQuestion.correctIndex);
        this.highlightAnswers(idx, this.currentQuestion.correctIndex);
        setTimeout(() => this.processAnswer(correct), 1200);
    }

    highlightAnswers(selectedIdx, correctIdx) {
        document.querySelectorAll(".answer-btn").forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === correctIdx) btn.classList.add("correct");
            if (idx === selectedIdx && idx !== correctIdx) btn.classList.add("wrong");
        });
    }

    // ========================
    // PROCESS ANSWER
    // ========================

    async processAnswer(correct) {
        if (!this.match) return;
        
        // Adjust per-player difficulty
        this.adjustDifficulty(correct);
        
        const currentTurn = this.gameState ? this.gameState.currentTurn : this.playerId;
        const pointWinner = correct ? currentTurn : (currentTurn === 1 ? 2 : 1);
        const event = this.match.scorePoint(pointWinner);
        this.updateScoreboard();
        this.showPointResult(correct, event);
        
        if (this.match.matchOver) {
            if (this.gameState) {
                this.gameState.status = "finished";
                this.gameState.tennisState = this.match.serialize();
                this.gameState.usedQuestions = [...this.usedQuestionIds];
                this.gameState.version = Date.now();
            }
            if (this.isOnline && !this.localMode) {
                await this.sync.writeState(this.gameState);
                // Update stats
                const iWon = this.match.winner === this.playerId;
                await this.sync.updateUserStats(this.sync.currentUser.id, iWon ? "win" : "loss");
            }
            setTimeout(() => this.endMatch(), 2000);
            return;
        }
        
        if (correct) {
            setTimeout(() => this.showPhase("spin"), 1500);
        } else {
            const nextTurn = currentTurn === 1 ? 2 : 1;
            if (this.gameState) {
                this.gameState.currentTurn = nextTurn;
                this.gameState.tennisState = this.match.serialize();
                this.gameState.usedQuestions = [...this.usedQuestionIds];
                this.gameState.version = Date.now();
            }
            if (this.isOnline && !this.localMode) {
                try { await this.sync.writeState(this.gameState); } catch (e) { this.showError("Failed to save"); }
            }
            setTimeout(() => {
                if (this.localMode) {
                    const nextName = nextTurn === 1 ? this.player1Name : this.player2Name;
                    this.showPassDevice(nextName, nextTurn);
                } else {
                    this.updateTurnIndicator();
                    if (nextTurn === this.playerId) { this.showPhase("spin"); }
                    else { this.showPhase("waiting-turn"); }
                }
            }, 2000);
        }
    }

    showPassDevice(nextPlayerName, nextTurn) {
        this.showPhase("pass-device");
        document.getElementById("pass-player-name").textContent = nextPlayerName;
        document.getElementById("btn-ready").onclick = () => {
            if (this.gameState) this.gameState.currentTurn = nextTurn;
            this.updateTurnIndicator();
            this.showPhase("spin");
        };
    }

    showPointResult(correct, event) {
        const el = document.getElementById("point-result");
        if (!el) return;
        let text = correct ? "Correct!" : "Wrong!";
        if (event.details.includes("game")) text += " - Game!";
        if (event.details.includes("set")) text += " - Set!";
        if (event.details.includes("match")) text += " - Match!";
        if (event.details.includes("tiebreak_start")) text += " - Tiebreak!";
        el.textContent = text;
        el.className = "point-result " + (correct ? "correct" : "wrong");
        el.style.display = "block";
        setTimeout(() => { el.style.display = "none"; }, 1800);
    }

    // ========================
    // END MATCH
    // ========================

    endMatch() {
        this.state = "finished";
        clearInterval(this.timerInterval);
        this.showScreen("results");
        if (!this.match) return;
        const sb = this.match.getScoreboard();
        document.getElementById("winner-name").textContent = sb.winner || "Unknown";
        document.getElementById("final-score").textContent = `${sb.setsWon.p1} sets to ${sb.setsWon.p2}`;
        let breakdown = "";
        sb.sets.forEach((set, i) => { breakdown += `Set ${i + 1}: ${set.p1}-${set.p2}\n`; });
        document.getElementById("score-breakdown").textContent = breakdown;
    }

    // ========================
    // SCOREBOARD
    // ========================

    updateScoreboard() {
        if (!this.match) return;
        const sb = this.match.getScoreboard();
        document.getElementById("p1-name").textContent = sb.player1;
        document.getElementById("p2-name").textContent = sb.player2;
        const points = sb.currentGame;
        document.getElementById("p1-points").textContent = points.p1;
        document.getElementById("p2-points").textContent = points.p2;
        const p1Sets = document.getElementById("p1-set-scores");
        const p2Sets = document.getElementById("p2-set-scores");
        if (p1Sets && p2Sets) {
            let p1H = "", p2H = "";
            for (const set of sb.sets) { p1H += `<span>${set.p1}</span>`; p2H += `<span>${set.p2}</span>`; }
            p1H += `<span>${sb.currentSet.p1}</span>`; p2H += `<span>${sb.currentSet.p2}</span>`;
            p1Sets.innerHTML = p1H; p2Sets.innerHTML = p2H;
        }
        document.getElementById("p1-sets-won").textContent = sb.setsWon.p1;
        document.getElementById("p2-sets-won").textContent = sb.setsWon.p2;
        // Turn indicator dots - show whose turn it is (not tennis serve)
        const currentTurn = this.gameState ? this.gameState.currentTurn : 1;
        const p1Serve = document.getElementById("p1-serve");
        const p2Serve = document.getElementById("p2-serve");
        if (p1Serve) p1Serve.classList.toggle("active", currentTurn === 1);
        if (p2Serve) p2Serve.classList.toggle("active", currentTurn === 2);
        const label = document.getElementById("game-label");
        if (label) label.textContent = points.label || "";
        this.updateDifficultyIndicator();
    }

    updateDifficultyIndicator() {
        document.querySelectorAll(".diff-dot").forEach(d => d.classList.remove("active"));
        const active = document.querySelector(`.diff-dot.${this.currentDifficulty || "medium"}`);
        if (active) active.classList.add("active");
    }

    updateTurnIndicator() {
        const el = document.getElementById("turn-indicator");
        if (!el) return;
        const currentTurn = this.gameState ? this.gameState.currentTurn : 1;
        const name = currentTurn === 1 ? this.player1Name : this.player2Name;
        if (this.localMode) {
            el.textContent = `${name}'s turn - answer until you miss!`;
            el.className = "turn-indicator my-turn";
        } else {
            const isMyTurn = (currentTurn === this.playerId);
            el.textContent = isMyTurn ? "Your turn! Answer until you miss." : `Waiting for ${name}...`;
            el.className = "turn-indicator " + (isMyTurn ? "my-turn" : "their-turn");
        }
    }

    // ========================
    // UI HELPERS
    // ========================

    getToggleValue(toggleId) {
        const toggle = document.getElementById(toggleId);
        if (!toggle) return null;
        const active = toggle.querySelector(".opt-btn.active");
        return active ? active.dataset.val : null;
    }

    showScreen(screen) {
        document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
        const el = document.getElementById("screen-" + screen);
        if (el) el.classList.add("active");
    }

    showPhase(phase) {
        document.querySelectorAll(".game-phase").forEach(el => el.classList.remove("active"));
        const el = document.getElementById("phase-" + phase);
        if (el) el.classList.add("active");
    }

    showError(msg) {
        const el = document.getElementById("error-message");
        if (el) { el.textContent = msg; el.style.display = "block"; setTimeout(() => { el.style.display = "none"; }, 4000); }
    }

    // ========================
    // BIND UI
    // ========================

    bindUI() {
        // Auth
        document.getElementById("btn-login").addEventListener("click", () => this.doLogin());
        document.getElementById("btn-register").addEventListener("click", () => this.doRegister());
        document.getElementById("btn-logout").addEventListener("click", () => this.doLogout());
        
        // Dashboard
        document.getElementById("btn-new-match").addEventListener("click", () => this.showNewMatchScreen());
        document.getElementById("btn-local-mode").addEventListener("click", () => this.showScreen("setup-local"));
        document.getElementById("btn-refresh-dash").addEventListener("click", () => this.loadDashboard());
        document.getElementById("btn-back-dash").addEventListener("click", () => { this.showScreen("dashboard"); this.loadDashboard(); });
        
        // New match
        document.getElementById("btn-create-online").addEventListener("click", () => this.createOnlineMatch());
        document.getElementById("btn-join-online").addEventListener("click", () => this.joinMatchByCode());
        
        // Local
        document.getElementById("btn-start-local").addEventListener("click", () => this.startLocalGame());
        
        // Game
        document.getElementById("btn-spin").addEventListener("click", () => this.spinWheel());
        document.getElementById("btn-refresh").addEventListener("click", () => this.refreshState());
        
        // Answers
        document.getElementById("answers-container").addEventListener("click", (e) => {
            const btn = e.target.closest(".answer-btn");
            if (btn && this.currentQuestion) this.submitAnswer(btn.dataset.index);
        });
        
        // Enter key on auth
        document.getElementById("auth-password").addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.doLogin();
        });
        
        // Join code uppercase
        const codeInput = document.getElementById("join-code-input");
        if (codeInput) codeInput.addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ""); });
        
        // Option toggle buttons (sets, tiebreak)
        document.querySelectorAll(".option-toggle").forEach(toggle => {
            toggle.addEventListener("click", (e) => {
                const btn = e.target.closest(".opt-btn");
                if (!btn) return;
                toggle.querySelectorAll(".opt-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            });
        });
    }
}

// Global reference for inline onclick handlers in match cards
let game;
document.addEventListener("DOMContentLoaded", () => {
    game = new TriviaGame();
    game.init();
});
