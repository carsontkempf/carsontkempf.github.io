/**
 * Tennis Scoring Engine
 * 
 * Implements full tennis match scoring:
 * Points (0, 15, 30, 40, Deuce, Ad) -> Games -> Sets -> Match
 * 
 * Best of 5 sets (first to win 3).
 * Optional tiebreak at 6-6 in a set.
 */

class TennisMatch {
    constructor(player1Name, player2Name, options = {}) {
        this.player1 = { name: player1Name, id: 1 };
        this.player2 = { name: player2Name, id: 2 };
        this.tiebreakEnabled = options.tiebreak !== undefined ? options.tiebreak : false; // default off
        this.setsToWin = options.setsToWin || 1; // default: single set (first to 6 games)
        
        // Match state
        this.sets = []; // completed sets: [{p1: games, p2: games}, ...]
        this.currentSet = { p1: 0, p2: 0 }; // games in current set
        this.currentGame = { p1: 0, p2: 0 }; // points in current game
        this.isTiebreak = false;
        this.tiebreakPoints = { p1: 0, p2: 0 };
        
        // Who is serving (alternates each game)
        this.server = 1; // player 1 starts serving
        this.matchOver = false;
        this.winner = null;
        
        // History
        this.pointHistory = [];
    }

    /**
     * Get the display score for current game points.
     */
    getPointDisplay() {
        if (this.isTiebreak) {
            return {
                p1: this.tiebreakPoints.p1.toString(),
                p2: this.tiebreakPoints.p2.toString(),
                label: "Tiebreak"
            };
        }

        const points = [0, 15, 30, 40];
        const p1 = this.currentGame.p1;
        const p2 = this.currentGame.p2;

        // Both at 40+ = deuce/advantage
        if (p1 >= 3 && p2 >= 3) {
            if (p1 === p2) {
                return { p1: "40", p2: "40", label: "Deuce" };
            } else if (p1 > p2) {
                return { p1: "Ad", p2: "40", label: "Advantage " + this.player1.name };
            } else {
                return { p1: "40", p2: "Ad", label: "Advantage " + this.player2.name };
            }
        }

        return {
            p1: (p1 <= 3 ? points[p1] : 40).toString(),
            p2: (p2 <= 3 ? points[p2] : 40).toString(),
            label: ""
        };
    }

    /**
     * Get full scoreboard state.
     */
    getScoreboard() {
        return {
            player1: this.player1.name,
            player2: this.player2.name,
            sets: [...this.sets],
            currentSet: { ...this.currentSet },
            currentGame: this.getPointDisplay(),
            isTiebreak: this.isTiebreak,
            server: this.server,
            matchOver: this.matchOver,
            winner: this.winner ? (this.winner === 1 ? this.player1.name : this.player2.name) : null,
            setsWon: {
                p1: this.sets.filter(s => s.winner === 1).length,
                p2: this.sets.filter(s => s.winner === 2).length,
            }
        };
    }

    /**
     * Award a point to a player (1 or 2).
     * Returns an event object describing what happened.
     */
    scorePoint(player) {
        if (this.matchOver) {
            return { type: "match_over", winner: this.winner };
        }

        const event = { type: "point", player, details: [] };
        this.pointHistory.push(player);

        if (this.isTiebreak) {
            this._scoreTiebreakPoint(player, event);
        } else {
            this._scoreRegularPoint(player, event);
        }

        return event;
    }

    _scoreRegularPoint(player, event) {
        const key = player === 1 ? "p1" : "p2";
        const otherKey = player === 1 ? "p2" : "p1";

        this.currentGame[key]++;

        const p1 = this.currentGame.p1;
        const p2 = this.currentGame.p2;

        // Check if game is won
        let gameWon = false;

        if (p1 >= 4 || p2 >= 4) {
            // Need to win by 2 points after deuce
            if (Math.abs(p1 - p2) >= 2) {
                gameWon = true;
            }
        } else if (this.currentGame[key] >= 4 && this.currentGame[key] - this.currentGame[otherKey] >= 2) {
            gameWon = true;
        }

        // Simpler check: at 40 (3 points), if other has less than 3, game over
        if (this.currentGame[key] >= 4 && this.currentGame[otherKey] < 3) {
            gameWon = true;
        }
        // Deuce situation: need 2 ahead
        if (p1 >= 3 && p2 >= 3 && Math.abs(p1 - p2) >= 2) {
            gameWon = true;
        }

        if (gameWon) {
            event.details.push("game");
            this._winGame(player, event);
        }
    }

    _scoreTiebreakPoint(player, event) {
        const key = player === 1 ? "p1" : "p2";
        this.tiebreakPoints[key]++;

        const p1 = this.tiebreakPoints.p1;
        const p2 = this.tiebreakPoints.p2;

        // Tiebreak: first to 7, win by 2
        if ((p1 >= 7 || p2 >= 7) && Math.abs(p1 - p2) >= 2) {
            event.details.push("tiebreak");
            this.isTiebreak = false;
            this.tiebreakPoints = { p1: 0, p2: 0 };
            this._winGame(player, event);
        }

        // Server alternates every 2 points in tiebreak (after first point)
        const totalPoints = p1 + p2;
        if (totalPoints === 1 || (totalPoints > 1 && (totalPoints - 1) % 2 === 0)) {
            this.server = this.server === 1 ? 2 : 1;
        }
    }

    _winGame(player, event) {
        const key = player === 1 ? "p1" : "p2";
        this.currentSet[key]++;
        this.currentGame = { p1: 0, p2: 0 };

        // Alternate server
        this.server = this.server === 1 ? 2 : 1;

        // Check if set is won
        const s1 = this.currentSet.p1;
        const s2 = this.currentSet.p2;

        let setWon = false;

        if (this.tiebreakEnabled) {
            // With tiebreak: win at 7 after tiebreak, or 6 with 2+ lead
            if ((s1 >= 6 || s2 >= 6) && Math.abs(s1 - s2) >= 2) {
                setWon = true;
            }
            // Check if we need tiebreak (6-6)
            if (s1 === 6 && s2 === 6 && !this.isTiebreak) {
                this.isTiebreak = true;
                event.details.push("tiebreak_start");
                return;
            }
        } else {
            // Without tiebreak: must win by 2 games after reaching 6
            if ((s1 >= 6 || s2 >= 6) && Math.abs(s1 - s2) >= 2) {
                setWon = true;
            }
        }

        if (setWon) {
            event.details.push("set");
            this._winSet(player, event);
        }
    }

    _winSet(player, event) {
        this.sets.push({
            p1: this.currentSet.p1,
            p2: this.currentSet.p2,
            winner: player
        });
        this.currentSet = { p1: 0, p2: 0 };

        // Check if match is won
        const setsWon = this.sets.filter(s => s.winner === player).length;
        if (setsWon >= this.setsToWin) {
            event.details.push("match");
            this.matchOver = true;
            this.winner = player;
        }
    }

    /**
     * Serialize match state for sync.
     */
    serialize() {
        return {
            player1: this.player1,
            player2: this.player2,
            tiebreakEnabled: this.tiebreakEnabled,
            setsToWin: this.setsToWin,
            sets: this.sets,
            currentSet: this.currentSet,
            currentGame: this.currentGame,
            isTiebreak: this.isTiebreak,
            tiebreakPoints: this.tiebreakPoints,
            server: this.server,
            matchOver: this.matchOver,
            winner: this.winner,
            pointHistory: this.pointHistory,
        };
    }

    /**
     * Restore match from serialized state.
     */
    static deserialize(data) {
        const match = new TennisMatch(data.player1.name, data.player2.name, {
            tiebreak: data.tiebreakEnabled,
            setsToWin: data.setsToWin || 1
        });
        match.player1 = data.player1;
        match.player2 = data.player2;
        match.sets = data.sets;
        match.currentSet = data.currentSet;
        match.currentGame = data.currentGame;
        match.isTiebreak = data.isTiebreak;
        match.tiebreakPoints = data.tiebreakPoints;
        match.server = data.server;
        match.matchOver = data.matchOver;
        match.winner = data.winner;
        match.pointHistory = data.pointHistory;
        return match;
    }
}
