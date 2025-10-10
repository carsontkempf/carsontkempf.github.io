---
layout: post
---

<style>
.project-navigation {
    text-align: center;
    margin: 30px 0;
    padding: 30px 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    border: 2px solid #dee2e6;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.project-navigation h2 {
    margin-bottom: 25px;
    color: #2c3e50;
    font-size: 2rem;
    font-weight: 600;
}

.project-buttons {
    display: flex;
    justify-content: center;
    gap: 25px;
    flex-wrap: wrap;
}

.project-btn {
    display: inline-block;
    padding: 18px 35px;
    font-size: 18px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    min-width: 200px;
    text-align: center;
}

.project-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    text-decoration: none;
}

.spotify-btn {
    background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
    color: white;
}

.spotify-btn:hover {
    color: white;
    background: linear-gradient(135deg, #1aa34a 0%, #1bc653 100%);
}

.error-annotator-btn {
    background: linear-gradient(135deg, #e74c3c 0%, #ff6b6b 100%);
    color: white;
}

.error-annotator-btn:hover {
    color: white;
    background: linear-gradient(135deg, #c0392b 0%, #e55353 100%);
}

@media (max-width: 768px) {
    .project-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .project-btn {
        width: 100%;
        max-width: 300px;
    }
}
</style>

<div class="project-navigation">
    <h2>Featured Projects</h2>
    <div class="project-buttons">
        <a href="/spotify-apple/" class="project-btn spotify-btn" id="spotify-btn">
            🎵 Spotify → Apple Music
        </a>
        <a href="/code-comprehension/" class="project-btn error-annotator-btn" id="error-annotator-btn">
            Code Comprehension Tool
        </a>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Add click handlers to project buttons
    document.getElementById('spotify-btn').addEventListener('click', function(event) {
        handleProjectClick(event, '/spotify-apple/');
    });
    
    document.getElementById('error-annotator-btn').addEventListener('click', function(event) {
        handleProjectClick(event, '/code-comprehension/');
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


### [Spotify](https://open.spotify.com/user/5lfrt3edl389cewrkxf5upr88?si=30e627be14304032)

### [Instagram](https://www.instagram.com/carsonthomaskempf/) 

### [Linkedin](https://www.linkedin.com/in/carson-kempf)


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
