# CodeGuard AI

> **AI-Powered GitHub Repository Bug Scanner & Fixer**  
> *Secure your code in seconds with Gemini 3.*

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Gemini](https://img.shields.io/badge/AI-Gemini%203%20Flash%20%26%20Pro-8E75B2?logo=googlebard)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwindcss)

## Overview

**CodeGuard AI** is a next-generation static analysis tool that bridges the gap between traditional linters and human code review. By leveraging **Google's Gemini 3 Flash** for high-speed processing and **Gemini 3 Pro** for deep reasoning, CodeGuard scans **live public GitHub repositories** to identify security vulnerabilities, logic bugs, and code smells in real-time.

Unlike standard tools that simply flag errors based on rigid rules, CodeGuard AI explains the *root cause*, suggests context-aware fixes, and can even automatically draft professional Pull Request descriptions.

---

## Tech Stack

This project uses a cutting-edge stack designed for performance, modularity, and AI integration.

| Category | Technology | Reasoning |
|----------|------------|-----------|
| **Frontend** | React 19 + TypeScript | Utilizes the latest React features for a responsive, type-safe UI. |
| **AI Engine** | **Google GenAI SDK** | Direct integration with **Gemini 3 Flash** (Code Analysis) and **Gemini 3 Pro** (Chat/PR Generation). |
| **Data Source** | GitHub Public API | Fetches real-time file content from public repositories for analysis. |
| **Styling** | Tailwind CSS | Utility-first CSS for rapid UI development and a modern, dark-mode aesthetic. |
| **Icons** | Lucide React | Clean, lightweight, and consistent iconography. |
| **Markdown** | React Markdown | Renders rich text descriptions and code blocks from AI responses. |

---

## Deployment & Configuration

### Netlify Deployment

To make the application work on Netlify, you must configure the API Key in the environment variables using the `VITE_` prefix.

1.  **Variable Name:** `VITE_API_KEY`
2.  **Value:** Your Google GenAI API Key.

**Steps:**
1.  Go to **Site settings** > **Build & deploy** > **Environment**.
2.  Click **Add variable**.
3.  Key: `VITE_API_KEY`
4.  Value: `AIzaSy...` (your actual key).
5.  Re-deploy your site.

> **Security Note:** Since this is a client-side application, the API key will be embedded in the browser build. For production environments handling sensitive data, it is recommended to proxy these requests through a backend server.

---

## Installation & Setup (Local)

1.  **Clone the repository**
    ```bash
    git clone https://github.com/dinitheth/CodeGuard-AI
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key**
    Create a `.env` file and add your Google Gemini API key:
    ```env
    VITE_API_KEY=your_google_genai_api_key
    ```
    *(Note: The app requires a valid API key to perform scans.)*

4.  **Run the application**
    ```bash
    npm run dev
    ```

---

*Built with love using Google Gemini 3 API.*