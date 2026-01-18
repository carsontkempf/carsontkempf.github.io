---
layout: page
title: Essays
permalink: /essays/
---
<script src="/assets/js/role-protection.js"></script>

<div id="auth-message"></div>


<div id="essays-dashboard">
  <header class="essays-header">
    <h1>{{ page.title }}</h1>
    <p class="essays-description">A collection of personal reflections, thoughts, and explorations on various topics.</p>
  </header>

  <main class="essays-main-content">
    <div class="essays-grid">
      {% assign essay_posts = site.categories.Essays %}
      {% for post in essay_posts %}
        <article class="essay-card">
          <div class="essay-card-content">
            <h3 class="essay-title">
              <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
            </h3>
            <div class="essay-meta">
              <span class="essay-date">{{ post.date | date: "%B %d, %Y" }}</span>
              {% if post.tags %}
                <div class="essay-tags">
                  {% for tag in post.tags %}
                    <span class="essay-tag">{{ tag }}</span>
                  {% endfor %}
                </div>
              {% endif %}
            </div>
            <div class="essay-excerpt">
              {{ post.excerpt | strip_html | truncatewords: 30 }}
            </div>
          </div>
        </article>
      {% endfor %}
      
      {% if essay_posts.size == 0 %}
        <div class="no-essays-message">
          <h3>No essays yet</h3>
          <p>Essays will appear here as they are written.</p>
        </div>
      {% endif %}
    </div>
  </main>
</div>

<script>
// Role-based access protection
document.addEventListener('authReady', async () => {
  const hasAccess = window.authService.isAuthenticated &&
                   window.authService.hasRole(['Admin', 'Root']);

  if (!hasAccess) {
    document.getElementById('essays-dashboard').style.display = 'none';
    const messageEl = document.getElementById('auth-message');

    if (!window.authService.isAuthenticated) {
      messageEl.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <h2>Authentication Required</h2>
          <p>Please log in to access this page.</p>
          <button onclick="window.authService.login()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
            Log In
          </button>
        </div>
      `;
    } else {
      messageEl.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
          <p>This page requires Admin or Root role.</p>
          <p>Your roles: ${window.authService.roles.join(', ') || 'None'}</p>
        </div>
      `;
    }
    messageEl.style.display = 'block';
  }
});

// Existing card hover effect

document.addEventListener('DOMContentLoaded', function() {
  // Add dynamic interactions for essay cards
  const essayCards = document.querySelectorAll('.essay-card');
  essayCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
});
</script>