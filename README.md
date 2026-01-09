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

## Key Features

*   **Real-Time Repository Scanning:** Fetches and analyzes actual code files from public GitHub URLs. It detects file types (Python, JS, TS, Go, etc..) and processes them instantly.
*   **Intelligent Vulnerability Detection:** Identifies SQL Injections, XSS, Logic Bugs, and Code Smells using the reasoning capabilities of Gemini 3.
*   **Live Code Viewer:** Inspect the scanned file content directly in the dashboard with the specific vulnerable lines highlighted.
*   **AI-Generated Fixes:** Provides side-by-side comparisons showing the original code vs. the AI-suggested patch.
*   **Auto-Draft Pull Requests:** One-click generation of professional PR titles and markdown descriptions based on the applied fixes.
*   **Integrated AI Assistant:** Built-in ChatBot with a "Deep Reasoning" toggle to discuss code architecture or security implications.

---

## How It Works

1.  **Input:** User provides a public GitHub repository URL (e.g., `https://github.com/username/repo`).
2.  **Fetch:** The application uses the GitHub API to crawl common directories (`src`, `lib`, `api`, etc.) and retrieve code files.
3.  **Analyze:** The file content is sent to **Gemini 3 Flash**, which has a large context window ideal for reading code and spotting anomalies.
4.  **Report:** The AI returns a structured JSON report of issues, severities, and suggested fixes.
5.  **Fix:** The user can review issues, apply AI-generated patches, and generate a Pull Request summary using **Gemini 3 Pro**.

---

## Use Cases

### 1. Security Auditing
Serve as an automated security auditor for open-source projects, catching critical vulnerabilities (like API key leaks or injection flaws) before they are merged.

### 2. Code Review Automation
Instantly identify code smells or style violations in new repositories without having to manually review every line, saving hours of developer time.

### 3. Educational Tool
When CodeGuard flags an issue, it explains the theory behind the bug. This turns every bug fix into a learning opportunity, helping junior developers upskill faster.

---

## Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/codeguard-ai.git
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key**
    Create a `.env` file and add your Google Gemini API key:
    ```env
    API_KEY=your_google_genai_api_key
    ```
    *(Note: The app requires a valid API key to perform scans.)*

4.  **Run the application**
    ```bash
    npm run dev
    ```

---

*Built with love using Google Gemini API.*
