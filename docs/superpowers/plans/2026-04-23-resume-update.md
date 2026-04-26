# Resume Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the resume page with new content from the 2026 PDF and add a centered GitHub link at the bottom.

**Architecture:** Update Markdown content in `_pages/resume.md` and add a styled HTML div for the GitHub link.

**Tech Stack:** Jekyll (Markdown, Liquid), HTML/CSS.

---

### Task 1: Update Resume Content

**Files:**
- Modify: `_pages/resume.md`

- [ ] **Step 1: Replace content in `_pages/resume.md`**

Update the file with the following content (derived from the PDF OCR):

```markdown
---
layout: page
title: Resume
permalink: /resume/
---

# Carson Kempf

[carsontkempf@gmail.com](mailto:carsontkempf@gmail.com) | (660) 254-4140

---

## Summary
Software Engineer bridging the gap between optimized enterprise systems and scalable applications. Combining a rigorous Computer Science foundation with hands-on experience in scripting, automation, and cloud deployments to deliver clean, secure, and scalable code.

---

## Technical Skills
- **Programming:** Python, Java, JavaScript, Bash, C, C++, Rust, Golang
- **Cloud & Infrastructure:** AWS, Cloudflare, Oracle, Azure
- **Web Development:** Django, Flask, SvelteKit, Node.js
- **DevOps:** CI/CD, Containerization, VM maintenance, Apache Kafka
- **Systems:** Linux Server Management, High Availability Clusters, PostgreSQL, Patroni, Oracle, MongoDB

---

## Professional Experience

### Associate Database Administrator | Charter Communications
**Aug 2025 – Present**
- Architect and maintain high-availability database solutions, ensuring strict uptime requirements and secure data access.
- Develop and optimize automated maintenance scripts using Python and Bash to streamline complex database operations.
- Collaborate cross-functionally with engineering teams to tune SQL queries and deploy scalable cloud infrastructure.

### Database Administrator Intern | Charter Communications
**May 2025 – Jul 2025**
- Reduced server maintenance time by 70% through automation of 15+ recurring tasks.
- Managed multi-server cluster deployment across 12 nodes spanning dev, pre-prod, and production.
- Finalist in company-wide innovation competition for data visualization application supporting parts optimization.

### Freelance Full-Stack Developer | RootsInn LLC
**May 2024 – Dec 2024**
- Reduced cloud costs by 31.8% through strategic database optimization and AWS server scheduling.
- Developed modular Django applications for booking, payment processing, and treehouse library management.
- Implemented custom image storage and compression algorithm to optimize performance and reduce costs.

---

## Education
**B.S. in Computer Science, Minor Philosophy** | Missouri S&T
*Dec 2025*
**GPA:** 3.747
**Relevant Coursework:** Intro to AI, Evolutionary Computing, Database Systems, Operating Systems, Computer Networking

---

<div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
  <a href="https://github.com/carsontkempf" target="_blank">github.com/carsontkempf</a>
</div>
```

- [ ] **Step 2: Commit changes**

```bash
git add _pages/resume.md
git commit -m "docs: update resume with 2026 version and add github link"
```

### Task 2: Push to gh-pages

**Files:**
- N/A (Git operation)

- [ ] **Step 1: Check current branch and status**

Run: `git status`

- [ ] **Step 2: Push to gh-pages**

Run: `git push origin HEAD:gh-pages`

- [ ] **Step 3: Verify push success**

Check terminal output for successful push.
