const BASE_URL = 'https://cloudprototype.org';

class GameSync {
	constructor() {
		this.matchId = null;
		this.onStateChange = null;
		this.currentUser = null;
		this._pollInterval = null;
	}

	getToken() {
		return (
			localStorage.getItem('learn_auth_token') ||
			sessionStorage.getItem('learn_auth_token') ||
			null
		);
	}

	async apiFetch(path, options = {}) {
		const token = this.getToken();
		const res = await fetch(`${BASE_URL}${path}`, {
			...options,
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				...(options.headers || {})
			}
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(err.error || `Request failed: ${res.status}`);
		}
		return res.json();
	}

	async init() {
		const token = this.getToken();
		if (!token) throw new Error('Not authenticated with learn platform');
	}

	async login(username) {
		const data = await this.apiFetch('/api/trivia/me');
		const player = data.player;
		if (username && username !== player.username) {
			await this.apiFetch('/api/trivia/me', {
				method: 'PUT',
				body: JSON.stringify({ display_name: username })
			});
			player.username = username;
		}
		this.currentUser = { id: player.id, username: player.username, stats: player.stats || {} };
		localStorage.setItem('trivia_user', JSON.stringify(this.currentUser));
		return this.currentUser;
	}

	async register(username) {
		return this.login(username);
	}

	async restoreSession() {
		try {
			const data = await this.apiFetch('/api/trivia/me');
			const player = data.player;
			this.currentUser = { id: player.id, username: player.username, stats: player.stats || {} };
			localStorage.setItem('trivia_user', JSON.stringify(this.currentUser));
			return this.currentUser;
		} catch (e) {
			localStorage.removeItem('trivia_user');
			return null;
		}
	}

	logout() {
		this.currentUser = null;
		localStorage.removeItem('trivia_user');
	}

	async createMatch(initialState) {
		const data = await this.apiFetch('/api/trivia/matches', {
			method: 'POST',
			body: JSON.stringify({ state: initialState })
		});
		this.matchId = data.code;
		this.subscribe();
		return this.matchId;
	}

	async joinMatch(code) {
		this.matchId = code.toUpperCase();
		const data = await this.apiFetch(`/api/trivia/matches/${this.matchId}/join`, {
			method: 'POST'
		});
		this.subscribe();
		return data.state;
	}

	async resumeMatch(matchId) {
		this.matchId = matchId.toUpperCase();
		const data = await this.apiFetch(`/api/trivia/matches/${this.matchId}`);
		this.subscribe();
		return data.match;
	}

	async getMyMatches() {
		const data = await this.apiFetch('/api/trivia/matches');
		return data.matches || [];
	}

	async forfeitMatch(matchId) {
		await this.apiFetch(`/api/trivia/matches/${matchId.toUpperCase()}/forfeit`, {
			method: 'POST'
		});
	}

	async writeState(state) {
		if (!this.matchId) throw new Error('No active match');
		await this.apiFetch(`/api/trivia/matches/${this.matchId}`, {
			method: 'PUT',
			body: JSON.stringify({ state })
		});
	}

	async readState() {
		if (!this.matchId) return null;
		const data = await this.apiFetch(`/api/trivia/matches/${this.matchId}`);
		return data.match?.state || null;
	}

	async updateUserStats(userId, event, categoryData) {
		await this.apiFetch('/api/trivia/stats', {
			method: 'POST',
			body: JSON.stringify({ event, categoryData })
		});
		if (this.currentUser) {
			const s = {
				wins: 0,
				losses: 0,
				forfeits: 0,
				total_questions: 0,
				correct_answers: 0,
				category_stats: {},
				...this.currentUser.stats
			};
			if (event === 'win') s.wins++;
			else if (event === 'loss') s.losses++;
			else if (event === 'forfeit') s.forfeits++;
			this.currentUser.stats = s;
			localStorage.setItem('trivia_user', JSON.stringify(this.currentUser));
		}
	}

	async getUsername(userId) {
		return userId ? userId.slice(0, 8) : 'Unknown';
	}

	subscribe() {
		this.disconnect();
		this._pollInterval = setInterval(async () => {
			if (!this.matchId || !this.onStateChange) return;
			try {
				const state = await this.readState();
				if (state) this.onStateChange(state);
			} catch (e) {
				// ignore transient poll errors
			}
		}, 2500);
	}

	disconnect() {
		if (this._pollInterval) {
			clearInterval(this._pollInterval);
			this._pollInterval = null;
		}
	}
}
