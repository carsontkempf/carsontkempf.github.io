---
layout: dashboard-category
title: Latest Posts
description: "All posts organized by date (latest first)"
permalink: /latest-posts/
---

<style>
.posts-dashboard {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
}

.posts-dashboard h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 40px;
    font-size: 2.5rem;
}

.posts-list {
    display: grid;
    gap: 20px;
}

.post-item {
    background: white;
    padding: 25px;
    border-radius: 10px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
    display: block;
}

.post-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    text-decoration: none;
    color: inherit;
}

.post-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
    flex-wrap: wrap;
    gap: 10px;
}

.post-item-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.post-item-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
}

.post-date {
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 5px;
}

.post-category {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 500;
}

.post-item-excerpt {
    color: #495057;
    line-height: 1.6;
    font-size: 1rem;
}

.posts-count {
    text-align: center;
    color: #6c757d;
    margin-bottom: 30px;
    font-style: italic;
}

@media (max-width: 768px) {
    .posts-dashboard {
        padding: 15px;
    }
    
    .posts-dashboard h1 {
        font-size: 2rem;
        margin-bottom: 30px;
    }
    
    .post-item {
        padding: 20px;
    }
    
    .post-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .post-item-meta {
        align-items: flex-start;
        text-align: left;
        width: 100%;
    }
    
    .post-item-title {
        font-size: 1.2rem;
        margin-bottom: 10px;
    }
}
</style>

<div class="posts-dashboard">
    <h1>All Posts</h1>
    
    {% assign sorted_posts = site.data.posts.posts | sort: 'date' | reverse %}
    <div class="posts-count">
        Showing {{ sorted_posts.size }} posts total
    </div>
    
    <div class="posts-list">
        {% for post in sorted_posts %}
        <a href="{{ post.permalink }}" class="post-item">
            <div class="post-header">
                <h2 class="post-item-title">{{ post.title }}</h2>
                <div class="post-item-meta">
                    <div class="post-date">{{ post.date | date: "%B %d, %Y" }}</div>
                    <div class="post-category">{{ post.category }}</div>
                </div>
            </div>
            <div class="post-item-excerpt">{{ post.excerpt }}</div>
        </a>
        {% endfor %}
    </div>
</div>