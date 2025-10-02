---
layout: page
title: AI & Algorithms
permalink: /ai/
---

<div id="ai-dashboard">
  <header class="section-header">
    <h1>{{ page.title }}</h1>
    <p class="section-description">Artificial intelligence projects, algorithm implementations, and academic assignments in computer science.</p>
  </header>

  <main class="section-main-content">
    <div class="posts-grid">
      {% assign ai_posts = site.categories.AI %}
      {% for post in ai_posts %}
        <article class="post-card">
          <div class="post-card-content">
            <h3 class="post-title">
              <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
            </h3>
            <div class="post-meta">
              <span class="post-date">{{ post.date | date: "%B %d, %Y" }}</span>
              {% if post.tags %}
                <div class="post-tags">
                  {% for tag in post.tags %}
                    <span class="post-tag">{{ tag }}</span>
                  {% endfor %}
                </div>
              {% endif %}
            </div>
            <div class="post-excerpt">
              {{ post.excerpt | strip_html | truncatewords: 30 }}
            </div>
          </div>
        </article>
      {% endfor %}
      
      {% if ai_posts.size == 0 %}
        <div class="no-posts-message">
          <h3>No AI projects yet</h3>
          <p>AI and algorithm projects will appear here.</p>
        </div>
      {% endif %}
    </div>
  </main>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const postCards = document.querySelectorAll('.post-card');
  postCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
});
</script>