# Reframe

**Reframe** is a cross-generational platform designed to help individuals, including kids, become better versions of themselves through project-based self-improvement and AI-driven wisdom.

## Tech Stack

- **Frontend**: React 18.3.1 (TypeScript), Tailwind CSS
- **AI**: Google Gemini API (@google/genai)
- **Icons**: Lucide React
- **Architecture**: Single Page Application (SPA)

## Setup Instructions

### Prerequisites

1.  **Node.js**: Ensure you have Node.js installed (v18 or higher recommended).
2.  **API Key**: You need a valid Google Gemini API Key. Get one at [aistudio.google.com](https://aistudiocdn.com).

### Running Locally

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/reframe.git
    cd reframe
    ```

2.  **Install Dependencies**
    *Note: The current provided code is optimized for an in-browser ES module environment (using importmap). To run locally with a bundler like Vite, you will need to set up a standard `package.json`.*

    **Quick Start with Vite:**
    ```bash
    npm create vite@latest reframe -- --template react-ts
    cd reframe
    npm install tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    npm install @google/genai lucide-react
    ```
    *Then copy the contents of the `src` files provided here into your Vite `src` folder.*

3.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    VITE_API_KEY=your_gemini_api_key_here
    ```
    *(Note: If using Vite, use `import.meta.env.VITE_API_KEY` instead of `process.env.API_KEY`, or configure your bundler to define `process.env`)*.

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

### Backend & Database (Future Scope)

As per the vision, the production app will include:
- **Backend**: Python (FastAPI/Django)
- **Database**: SQL (PostgreSQL)
- **Auth**: Firebase Authentication

### Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request