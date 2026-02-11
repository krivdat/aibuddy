# General Instructions for AI Buddy Project

## Project Overview

AI Buddy is an interactive web application that allows users to chat with various AI-powered personas. It's designed for engaging, fluid conversations leveraging the Google Gemini API. Key features include persona selection, real-time chat, and session-based chat history. The application is built with a mobile-first responsive design.

## Tech Stack

- **Framework:** Svelte 5 (with SvelteKit)
- **Styling:** Tailwind CSS v4, DaisyUI
- **Build Tool:** Vite
- **Runtime:** Node.js
- **Database:** Better SQLite3
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Code Quality:** ESLint, Prettier

## Setup and Installation

### Prerequisites

- Node.js (LTS recommended)
- pnpm (recommended by `preinstall` script)
- A Google Gemini API Key

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/krivdat/aibuddy.git
    cd aibuddy
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory (or rename `.env.example` to `.env`) and add your Google Gemini API key:
    ```env
    GEMINI_API_KEY="your_api_key_here"
    ```

## Available Scripts

The following scripts are defined in `package.json` for development and build workflows:

- `pnpm dev`: Starts the development server with Vite.
- `pnpm build`: Creates a production-ready build of the application.
- `pnpm preview`: Serves the production build locally for testing.
- `pnpm format`: Formats code using Prettier.
- `pnpm lint`: Checks code for linting errors using ESLint and Prettier.
- `pnpm prepare`: Runs `svelte-kit sync` to generate types and other files.

## Development Conventions

When working on SvelteKit and Svelte projects, use Svelte 5 syntax with runes and always follow instructions in svelte-llms.md file.
The documentation in svelte-llms.md should be considered the source of truth for this project, overriding any of my internal knowledge about Svelte.

When asked to design, review or refactor a Svelte / SvelteKit web page or web component, use responsive mobile-first design principles and ensure that the design is accessible and user-friendly, beautiful and modern. For styles use Tailwind CSS version 4 unless project already uses different version.

- **Indentation:** 2 spaces (inferred from common Svelte/JS practices and Prettier configuration).
- **Code Formatting:** Enforced with Prettier (`pnpm format`).
- **Linting:** Enforced with ESLint (`pnpm lint`).
- **Svelte Kit Adapters:** The project uses `@sveltejs/adapter-auto` and `@sveltejs/adapter-node` for deployment flexibility.
- **Database:** SQLite database handled via `src/lib/server/db.js`.
- **Persona Management:** Persona data is managed via `src/lib/server/personas.json` and exposed through `src/routes/api/personas/+server.js`.
- **UI Components:** Svelte components are located in `src/lib/` and `src/routes/`.
- **Tailwind CSS:** Configuration is in `tailwind.config.js`. Ensure proper Tailwind classes are used for styling.
- **Security:** `dompurify` and `isomorphic-dompurify` are used, suggesting attention to sanitizing user-generated content.
