# Reframe

**Reframe** is a cross-generational platform designed to help individuals, including kids, become better versions of themselves through project-based self-improvement and AI-driven wisdom.

## Tech Stack

- **Frontend**: React 18.3.1 (TypeScript), Tailwind CSS
- **AI**: Google Gemini API (@google/genai)
- **Authentication**: Firebase Auth (Google, Facebook, X)
- **Icons**: Lucide React
- **Architecture**: Single Page Application (SPA)

## Setup Instructions

### 1. Prerequisites

*   **Node.js**: Ensure you have Node.js installed (v18 or higher recommended).
*   **Google Gemini API Key**: Get one at [aistudio.google.com](https://aistudiocdn.com).

### 2. Firebase Configuration (Required for Social Login)

To enable social logins, you must create a Firebase project:

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and follow the steps.
3.  Once the project is created, click the **Web icon (</>)** to add a web app.
4.  Copy the `firebaseConfig` object (it looks like `const firebaseConfig = { apiKey: "...", ... };`).
5.  Open `services/firebase.ts` in this project and paste your config into the `firebaseConfig` variable.
6.  **Enable Auth Providers**:
    *   Go to **Build** -> **Authentication** -> **Sign-in method**.
    *   Enable **Google** (no extra setup needed usually).
    *   Enable **Facebook** (requires App ID/Secret from [Meta for Developers](https://developers.facebook.com/)).
    *   Enable **Twitter / X** (requires API Key/Secret from [X Developer Portal](https://developer.x.com/)).

### 3. Running Locally

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
    npm install @google/genai lucide-react firebase
    ```
    *Then copy the contents of the `src` files provided here into your Vite `src` folder.*

3.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    VITE_API_KEY=your_gemini_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

### Backend & Database (Future Scope)

As per the vision, the production app will include:
- **Backend**: Python (FastAPI/Django)
- **Database**: SQL (PostgreSQL)
- **Auth**: Firebase Authentication (already integrated on frontend)

### Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
