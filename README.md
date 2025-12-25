---
title: ChatsBeyondChats
emoji: 🤖
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
license: mit
---

# BeyondChats - AI Enhanced Content Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Production-green.svg)
![React](https://img.shields.io/badge/frontend-React_Vite-cyan)
![Laravel](https://img.shields.io/badge/backend-Laravel_11-red)

A scalable, full-stack content aggregation platform that leverages Generative AI to enhance, summarize, and verify digital content. Built with a microservices architecture to ensure high availability and performance.

### 🚀 **[Live Enterprise Demo](https://chats-beyond-chats.vercel.app/)**

---

## 🌟 Key Features

*   **Automated Content Aggregation**: Intelligent workers polling internal APIs for new content.
*   **AI-Powered Enhancement**: Integration with Google Gemini (LLM) to rewrite and enrich articles with external references.
*   **Smart Search**: utilizing Puppeteer for real-time validation against Google Search results.
*   **Modern UI/UX**: A responsive, glassmorphism-inspired interface built with Tailwind CSS.
*   **Dockerized Deployment**: Fully containerized architecture for seamless orchestration.

---

## 🏗️ Architecture

The system follows a monolithic repository structure with decoupled services:

*   **Backend (`/backend`)**: Laravel 11 REST API serving as the source of truth.
*   **Worker (`/worker`)**: Node.js background service for handling heavy AI & Scraping jobs.
*   **Frontend (`/frontend`)**: React + Vite SPA ensuring a blazing fast user experience.

---

## 💻 Local Development

To spin up the entire enterprise stack locally, we provide a unified startup script.

### Prerequisites
*   PHP 8.2+ & Composer
*   Node.js 18+ & NPM
*   SQLite / MySQL

### Quick Start (Windows)
```powershell
./start_all.ps1
```
This script will:
1.  Launch the Laravel API (Port 8000)
2.  Boot the React Frontend (Port 5173)
3.  Initialize the Node.js Worker & Scheduler

---

## 📦 Deployment

The application is cloud-agnostic and container-ready.

*   **Frontend**: Deployed on Vercel Edge Network.
*   **Backend**: Docker-compatible (see `Dockerfile`).

---

## © 2025 BeyondChats Engineering. All rights reserved.
