---
layout: page
title: Extensions
permalink: /extensions/
back_url: /dashboard/
back_text: Dashboard
---

{% include widgets/navigation/back-button.html back_url=page.back_url back_text=page.back_text %}

<div id="extensions-dashboard">
  <header class="section-header">
    <h1>{{ page.title }}</h1>
    <p class="section-description">Browser extensions, VS Code extensions, and other development tools I've created.</p>
  </header>

  <main class="section-main-content">
    <div class="posts-grid">
      {% assign extension_posts = site.categories.Extensions %}
      {% for post in extension_posts %}
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
      
      {% if extension_posts.size == 0 %}
        <div class="no-posts-message">
          <h3>No extensions yet</h3>
          <p>Browser and editor extensions will appear here.</p>
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