---
layout: page
title: Essays
permalink: /essays/
---

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