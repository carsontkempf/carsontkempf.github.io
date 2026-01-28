---
layout: post
---

<style>
/* Disable all hover transforms in portrait mode (mobile) */
@media (orientation: portrait) {
    * {
        &:hover {
            transform: none !important;
        }
    }
}

.hero-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 70vh;
    text-align: center;
    padding: 5vh 5vw;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 16px;
    border: 2px solid #dee2e6;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    margin: 2vh 0;
}

.hero-title {
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 4vh;
    line-height: 1.2;
}

.spotify-apple-btn {
    display: inline-block;
    padding: clamp(20px, 3vh, 40px) clamp(40px, 6vw, 80px);
    font-size: clamp(1.5rem, 3vw, 3rem);
    font-weight: 700;
    text-decoration: none;
    border-radius: 16px;
    transition: all 0.3s ease;
    box-shadow: 0 8px 24px rgba(29, 185, 84, 0.3);
    background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
    color: white;
    min-width: min(80vw, 400px);
    text-align: center;
    letter-spacing: 0.5px;
}

/* Portrait mode - NO hover effects */
@media (orientation: portrait) {
    .spotify-apple-btn:hover {
        background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
        transform: none;
        box-shadow: 0 8px 24px rgba(29, 185, 84, 0.3);
    }
}

/* Landscape mode - enable hover effects */
@media (orientation: landscape) {
    .spotify-apple-btn:hover {
        color: white;
        background: linear-gradient(135deg, #1aa34a 0%, #1bc653 100%);
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 12px 32px rgba(29, 185, 84, 0.4);
        text-decoration: none;
    }
}

.spotify-apple-btn:active {
    transform: translateY(-2px) scale(1.01);
}

@media (min-width: 769px) {
    .hero-container {
        min-height: 35vh;
        padding: 3vh 4vw;
        max-width: 800px;
        margin: 2vh auto;
    }

    .hero-title {
        font-size: 2.5rem;
        margin-bottom: 2vh;
    }

    .spotify-apple-btn {
        padding: 18px 50px;
        font-size: 1.8rem;
        min-width: auto;
    }
}

@media (max-width: 768px) {
    .hero-container {
        min-height: 60vh;
        padding: 4vh 4vw;
    }

    .spotify-apple-btn {
        width: calc(100% - 2rem);
        max-width: 100%;
        padding: 8px clamp(24px, 4vw, 48px);
        font-size: clamp(1.2rem, 2.5vw, 2rem);
    }
}

@media (min-width: 1920px) {
    .spotify-apple-btn {
        max-width: 600px;
    }
}

/* Icon button styles */
.icon-btn-container {
    display: inline-block;
    width: min(60vw, 300px);
    text-align: center;
}

.icon-btn {
    display: block;
    width: 100%;
    height: 200px;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    overflow: hidden;
}

.icon-btn img {
    display: block;
    width: 100%;
    height: 120%;
    object-fit: cover;
    transform: translateY(-30%);
}

/* Portrait mode - NO hover effects */
@media (orientation: portrait) {
    .icon-btn:hover {
        transform: none;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
}

/* Landscape mode - enable hover effects */
@media (orientation: landscape) {
    .icon-btn:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
    }
}

.icon-btn:active {
    transform: translateY(-2px) scale(1.01);
}

@media (min-width: 769px) {
    .icon-btn-container {
        width: auto;
        max-width: 300px;
    }

    .icon-btn {
        height: 180px;
    }
}

@media (max-width: 768px) {
    .icon-btn-container {
        width: calc(100% - 4rem);
        max-width: 100%;
    }

    .icon-btn {
        height: 150px;
    }
}

/* Social media grid styles */
.social-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

@media (max-width: 768px) {
    .social-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        max-width: 300px;
    }
}

.social-icon-btn-container {
    width: 100%;
    aspect-ratio: 1;
}

.social-icon-btn {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    overflow: hidden;
    background: white;
    position: relative;
}

.social-icon-btn img {
    display: block;
    width: 100%;
    height: 120%;
    object-fit: cover;
    transform: translateY(-45%);
    position: absolute;
    top: 0;
    left: 0;
}

/* Smaller size for Instagram */
.social-icon-btn img[alt="Instagram"] {
    width: 80%;
    height: 96%;
    left: 10%;
    object-fit: contain;
}

/* Smaller size for Spotify and Apple Music icons */
.social-icon-btn img[alt="Spotify"],
.social-icon-btn img[alt="Apple Music"] {
    width: 70%;
    height: 84%;
    left: 15%;
    object-fit: contain;
}

/* Portrait mode - NO hover effects */
@media (orientation: portrait) {
    .social-icon-btn:hover {
        transform: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
}

/* Landscape mode - enable hover effects */
@media (orientation: landscape) {
    .social-icon-btn:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    }
}

.social-icon-btn:active {
    transform: translateY(-2px) scale(1.02);
}
</style>

<div class="hero-container">
    <h1 class="hero-title">Playlist Transfer</h1>
    <div class="icon-btn-container">
        <a href="/spotify-apple/" class="icon-btn" id="spotify-btn">
            <img src="/assets/img/recordplayer.jpeg" alt="Playlist Transfer" id="recordplayer-img">
        </a>
    </div>
</div>

<div class="hero-container">
    <h1 class="hero-title">Chess</h1>
    <div class="icon-btn-container">
        <a href="/chess/" class="icon-btn" id="chess-btn">
            <img src="/assets/img/chessboard.jpeg" alt="Chess" id="chessboard-img">
        </a>
    </div>
</div>

<!-- YouTube Videos Section -->
<div id="homepage-videos" class="videos-container" style="margin-top: 4vh;">
  <h2 style="font-size: clamp(1.5rem, 4vw, 2rem); text-align: center; margin-bottom: 2vh;">Latest Videos</h2>
  <div id="videos-grid"></div>
</div>

<link rel="stylesheet" href="/assets/css/video-display.css">
<script src="https://cdn.jsdelivr.net/npm/js-yaml@4/dist/js-yaml.min.js"></script>
<script src="/assets/js/homepage-videos.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    homepageVideos.loadAndDisplay();
  });
</script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Debug: Check if images are loaded
    console.log('=== Homepage Icon Debug ===');

    const recordplayerImg = document.getElementById('recordplayer-img');
    const chessboardImg = document.getElementById('chessboard-img');

    if (recordplayerImg) {
        console.log('Record player image element found');
        console.log('Record player image src:', recordplayerImg.src);
        recordplayerImg.addEventListener('load', function() {
            console.log('✓ Record player image loaded successfully');
            console.log('  Dimensions:', this.naturalWidth, 'x', this.naturalHeight);
        });
        recordplayerImg.addEventListener('error', function() {
            console.error('✗ Record player image failed to load');
            console.error('  Attempted src:', this.src);
        });
    } else {
        console.error('✗ Record player image element not found');
    }

    if (chessboardImg) {
        console.log('Chessboard image element found');
        console.log('Chessboard image src:', chessboardImg.src);
        chessboardImg.addEventListener('load', function() {
            console.log('✓ Chessboard image loaded successfully');
            console.log('  Dimensions:', this.naturalWidth, 'x', this.naturalHeight);
        });
        chessboardImg.addEventListener('error', function() {
            console.error('✗ Chessboard image failed to load');
            console.error('  Attempted src:', this.src);
        });
    } else {
        console.error('✗ Chessboard image element not found');
    }

    console.log('=========================');

    // Function to handle login redirect for non-authenticated users
    function handleProjectClick(event, projectUrl) {
        // Check if user is authenticated
        if (!window.authService || !window.authService.isAuthenticated) {
            event.preventDefault();

            // Store the intended destination
            localStorage.setItem('intendedDestination', projectUrl);

            // Redirect to Auth0 login
            if (window.authService && window.authService.login) {
                window.authService.login();
            } else {
                // Fallback if authService not ready
                alert('Please log in to access this feature.');
            }
        }
        // If authenticated, let the normal navigation proceed
    }

    // Add click handler to project button
    document.getElementById('spotify-btn').addEventListener('click', function(event) {
        handleProjectClick(event, '/spotify-apple/');
    });

    // Check for intended destination after login
    document.addEventListener('authReady', function() {
        if (window.authService && window.authService.isAuthenticated) {
            const intendedDestination = localStorage.getItem('intendedDestination');
            if (intendedDestination) {
                localStorage.removeItem('intendedDestination');
                window.location.href = intendedDestination;
            }
        }
    });
});
</script>

# Check Me Out

<div class="social-grid">
    <div class="social-icon-btn-container">
        <a href="https://www.instagram.com/carsonthomaskempf/" class="social-icon-btn" target="_blank" rel="noopener noreferrer">
            <img src="/assets/img/instagram.jpeg" alt="Instagram">
        </a>
    </div>
    <div class="social-icon-btn-container">
        <a href="https://www.linkedin.com/in/carson-kempf" class="social-icon-btn" target="_blank" rel="noopener noreferrer">
            <img src="/assets/img/linkedin.jpeg" alt="LinkedIn">
        </a>
    </div>
    <div class="social-icon-btn-container">
        <a href="https://open.spotify.com/user/5lfrt3edl389cewrkxf5upr88?si=30e627be14304032" class="social-icon-btn" target="_blank" rel="noopener noreferrer">
            <img src="/assets/img/Spotify-Icon.png" alt="Spotify">
        </a>
    </div>
    <div class="social-icon-btn-container">
        <a href="https://music.apple.com/profile/carsontkempf" class="social-icon-btn" target="_blank" rel="noopener noreferrer">
            <img src="/assets/img/Apple-Music-Icon.png" alt="Apple Music">
        </a>
    </div>
</div>


--- 

# Goal

## This Site Contains:

### My Notes Over:
* Assignments for School
* Projects I'm Working On
> Research Projects / Notes
> App Design
> Deepseek ChatBot -> Chatbot utilizing DeepSeek and Tavily APIs to replace my $20/month ChatGPT subscription.

### Some Research On:
* Artificial Intelligence
* LLM Management
* AI Agents
* Model Context Protocol (MCP)

### Tutorials Over:
* Various Software Packages
> LangChain      -> Interacting with LLM's APIs
> 
> LangGraph      -> Represent the AI action space as a graph with nodes and edges
> 
> LLM APIs       -> Utilize APIs to construct your own LLM applications
> 
> Search APIs    -> Gain access to live content on the internet

* App Development Frameworks

> Django         -> Build python applications
>   Cloud Services
> 
> AWS            -> Deploy your applications for others to see
>   Deployment Tools
> 
> CI/CD          -> Organized and automatic deployment operations
>   Automation
> 
> Bash Scripts   -> Fun automation scripts to make your life easier
> 
> Python Scripts -> Fun automation scripts that aren't awful to look at to make your life easier

### Lectures On:
* Computer Science Concepts

> APIs
> 
> LLMs
> 
> AI
>   Philosophy
>   My Philosophies
> 
> Staying Organized
> 
> How to Learn Anything



### Some of My Thoughts On:

* Books

> James Gleick: The Information: A History, A Theory, A Flood
> 
> Malcolm Gladwell: David and Goliath, Outlier, Blink
> 
> Cal Newport: Slow Productivity, Deep Work, Digital Minimalism
