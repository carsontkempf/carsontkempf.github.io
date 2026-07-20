/**
 * Supabase Sync Module with User Authentication
 * 
 * Tables:
 * - users: id, username, password_hash, stats, created_at
 * - matches: id, state, player1_id, player2_id, status, winner_id, created_at, updated_at
 * 
 * Password hashing uses SHA-256 (client-side). Not bank-grade security
 * but fine for a 2-player trivia game.
 */

const SUPABASE_CONFIG = {
    url: "https://nknnujvxnrzludjcmwcm.supabase.co",
    anonKey: "sb_publishable_Mn86sx3dw37IL4pisCv4Ug_C_mBM8Y4"
};

class GameSync {
    constructor() {
        this.supabase = null;
        this.matchId = null;
        this.subscription = null;
        this.onStateChange = null;
        this.currentUser = null; // { id, username, stats }
    }

    async init() {
        if (SUPABASE_CONFIG.url === "YOUR_SUPABASE_URL") {
            throw new Error("Supabase not configured");
        }
        this.supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }

    // ========================
    // AUTH
    // ========================

    /**
     * Hash password client-side with SHA-256.
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + "_trivia_tennis_salt");
        const hash = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    /**
     * Register a new user. Returns user object or throws.
     */
    async register(username, password) {
        const hash = await this.hashPassword(password);
        
        const { data, error } = await this.supabase
            .from("users")
            .insert({ username: username.toLowerCase(), password_hash: hash })
            .select()
            .single();
        
        if (error) {
            if (error.code === "23505") throw new Error("Username already taken");
            throw new Error("Registration failed: " + error.message);
        }
        
        this.currentUser = { id: data.id, username: data.username, stats: data.stats };
        localStorage.setItem("trivia_user", JSON.stringify(this.currentUser));
        return this.currentUser;
    }

    /**
     * Login with username/password. Returns user object or throws.
     */
    async login(username, password) {
        const hash = await this.hashPassword(password);
        
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("username", username.toLowerCase())
            .eq("password_hash", hash)
            .single();
        
        if (error || !data) throw new Error("Invalid username or password");
        
        this.currentUser = { id: data.id, username: data.username, stats: data.stats };
        localStorage.setItem("trivia_user", JSON.stringify(this.currentUser));
        return this.currentUser;
    }

    /**
     * Try to restore session from localStorage.
     */
    async restoreSession() {
        const stored = localStorage.getItem("trivia_user");
        if (!stored) return null;
        
        try {
            const user = JSON.parse(stored);
            // Verify user still exists and refresh stats
            const { data, error } = await this.supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();
            
            if (error || !data) {
                localStorage.removeItem("trivia_user");
                return null;
            }
            
            this.currentUser = { id: data.id, username: data.username, stats: data.stats };
            localStorage.setItem("trivia_user", JSON.stringify(this.currentUser));
            return this.currentUser;
        } catch (e) {
            localStorage.removeItem("trivia_user");
            return null;
        }
    }

    /**
     * Logout.
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem("trivia_user");
    }

    // ========================
    // MATCH MANAGEMENT
    // ========================

    generateCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    /**
     * Create a new match.
     */
    async createMatch(initialState) {
        if (!this.currentUser) throw new Error("Not logged in");
        this.matchId = this.generateCode();
        
        const { error } = await this.supabase
            .from("matches")
            .insert({
                id: this.matchId,
                state: initialState,
                player1_id: this.currentUser.id,
                status: "waiting"
            });
        
        if (error) throw new Error("Failed to create match: " + error.message);
        this.subscribe();
        return this.matchId;
    }

    /**
     * Join an existing match.
     */
    async joinMatch(code) {
        if (!this.currentUser) throw new Error("Not logged in");
        this.matchId = code.toUpperCase();
        
        const { data, error } = await this.supabase
            .from("matches")
            .select("*")
            .eq("id", this.matchId)
            .single();
        
        if (error || !data) throw new Error("Match not found: " + this.matchId);
        if (data.status !== "waiting") throw new Error("Match already in progress or finished");
        if (data.player1_id === this.currentUser.id) throw new Error("Cannot join your own match");
        
        // Set player2
        const { error: updateErr } = await this.supabase
            .from("matches")
            .update({ player2_id: this.currentUser.id, status: "playing" })
            .eq("id", this.matchId);
        
        if (updateErr) throw new Error("Failed to join: " + updateErr.message);
        
        this.subscribe();
        return data.state;
    }

    /**
     * Resume an existing match.
     */
    async resumeMatch(matchId) {
        this.matchId = matchId;
        
        const { data, error } = await this.supabase
            .from("matches")
            .select("*")
            .eq("id", this.matchId)
            .single();
        
        if (error || !data) throw new Error("Match not found");
        
        this.subscribe();
        return data;
    }

    /**
     * Get all matches for current user (active + finished).
     */
    async getMyMatches() {
        if (!this.currentUser) return [];
        
        const { data, error } = await this.supabase
            .from("matches")
            .select("*")
            .or(`player1_id.eq.${this.currentUser.id},player2_id.eq.${this.currentUser.id}`)
            .order("updated_at", { ascending: false });
        
        if (error) return [];
        return data || [];
    }

    /**
     * Get all open matches waiting for a player 2.
     */
    async getOpenMatches() {
        if (!this.currentUser) return [];
        
        const { data, error } = await this.supabase
            .from("matches")
            .select("*")
            .eq("status", "waiting")
            .neq("player1_id", this.currentUser.id)
            .order("created_at", { ascending: false });
        
        if (error) return [];
        return data || [];
    }

    /**
     * Forfeit a match.
     */
    async forfeitMatch(matchId) {
        if (!this.currentUser) throw new Error("Not logged in");
        
        const { data, error } = await this.supabase
            .from("matches")
            .select("*")
            .eq("id", matchId)
            .single();
        
        if (error || !data) throw new Error("Match not found");
        
        // Determine winner (the other player)
        const winnerId = data.player1_id === this.currentUser.id ? data.player2_id : data.player1_id;
        
        const state = data.state || {};
        state.status = "forfeited";
        state.forfeitedBy = this.currentUser.id;
        
        await this.supabase
            .from("matches")
            .update({ status: "forfeited", winner_id: winnerId, state: state, updated_at: new Date().toISOString() })
            .eq("id", matchId);
        
        // Update stats
        await this.updateUserStats(this.currentUser.id, "forfeit");
        if (winnerId) await this.updateUserStats(winnerId, "win");
    }

    /**
     * Write match state.
     */
    async writeState(state) {
        if (!this.matchId) throw new Error("No active match");
        
        const updates = { state: state, updated_at: new Date().toISOString() };
        if (state.status === "finished") {
            updates.status = "finished";
            // Determine winner
            if (state.tennisState && state.tennisState.winner) {
                const winnerId = state.tennisState.winner === 1
                    ? (await this.getMatchPlayers()).player1_id
                    : (await this.getMatchPlayers()).player2_id;
                updates.winner_id = winnerId;
            }
        }
        
        const { error } = await this.supabase
            .from("matches")
            .update(updates)
            .eq("id", this.matchId);
        
        if (error) throw new Error("Failed to update: " + error.message);
    }

    async getMatchPlayers() {
        const { data } = await this.supabase
            .from("matches")
            .select("player1_id, player2_id")
            .eq("id", this.matchId)
            .single();
        return data || {};
    }

    /**
     * Read the current match state.
     */
    async readState() {
        if (!this.matchId) return null;
        const { data, error } = await this.supabase
            .from("matches")
            .select("state")
            .eq("id", this.matchId)
            .single();
        if (error || !data) return null;
        return data.state;
    }

    // ========================
    // USER STATS
    // ========================

    /**
     * Update user stats after a match event.
     */
    async updateUserStats(userId, event, categoryData) {
        const { data } = await this.supabase
            .from("users")
            .select("stats")
            .eq("id", userId)
            .single();
        
        if (!data) return;
        const stats = data.stats || { wins: 0, losses: 0, forfeits: 0, total_questions: 0, correct_answers: 0, category_stats: {} };
        
        if (event === "win") stats.wins++;
        else if (event === "loss") stats.losses++;
        else if (event === "forfeit") stats.forfeits++;
        
        if (categoryData) {
            stats.total_questions += categoryData.total || 0;
            stats.correct_answers += categoryData.correct || 0;
            if (categoryData.category) {
                if (!stats.category_stats[categoryData.category]) {
                    stats.category_stats[categoryData.category] = { total: 0, correct: 0 };
                }
                stats.category_stats[categoryData.category].total += categoryData.total || 0;
                stats.category_stats[categoryData.category].correct += categoryData.correct || 0;
            }
        }
        
        await this.supabase
            .from("users")
            .update({ stats: stats })
            .eq("id", userId);
        
        // Update local cache
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser.stats = stats;
            localStorage.setItem("trivia_user", JSON.stringify(this.currentUser));
        }
    }

    /**
     * Get a username by user ID.
     */
    async getUsername(userId) {
        if (!userId) return "Unknown";
        const { data } = await this.supabase
            .from("users")
            .select("username")
            .eq("id", userId)
            .single();
        return data ? data.username : "Unknown";
    }

    // ========================
    // REALTIME
    // ========================

    subscribe() {
        if (this.subscription) {
            this.supabase.removeChannel(this.subscription);
        }
        
        this.subscription = this.supabase
            .channel("match-" + this.matchId)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "matches",
                    filter: `id=eq.${this.matchId}`
                },
                (payload) => {
                    if (payload.new && payload.new.state && this.onStateChange) {
                        this.onStateChange(payload.new.state);
                    }
                }
            )
            .subscribe();
    }

    disconnect() {
        if (this.subscription) {
            this.supabase.removeChannel(this.subscription);
            this.subscription = null;
        }
    }
}
