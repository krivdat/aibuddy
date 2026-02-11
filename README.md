# AI Buddy

AI Buddy is an entertaining chat web application where users can interact with a variety of AI-powered personas. It serves as a platform for fun conversations, creative exploration or practicing social interactions.

## Features

- **Persona Selection:** Choose from a variety of unique AI personalities:
  - Chairman Meow, the Grumpy Cat
  - Lulu the Wise Turtle
  - Gary the Hypochondriac
  - Brenda, the Passive-Aggressive Neighbor
  - Chad, the Over-Enthusiastic Intern
  - Kevin, the Awkward Teen
  - Raven, the Emo Poet
  - Al, the Conspiracy Theorist
  - Grandpa Joe, the Storyteller
  - Nerd, the IT Expert
  - Ms. Taylor, the Friendly Teacher
  - Normal AI

- **Real-time Chat:** Engaging, fluid conversations powered by Google Gemini.
- **Chat History:** Session based chat history preserved when switching between personas.
- **Responsive Design:** Mobile-first UI built with Svelte 5 and Tailwind CSS v4.

## Getting Started

### Prerequisites

- Node.js
- npm (or pnpm/yarn)
- A Google Gemini API Key

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/krivdat/aibuddy.git
    cd aibuddy
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**

    Create a `.env` file in the root directory (or rename `.env.example` to `.env`) and add your Google Gemini API key:

    ```env
    GEMINI_API_KEY="your_api_key_here"
    ```

### Running the App

Start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
