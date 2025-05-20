
# Synduct Chat

Text to text generation model built with Next.js, React, TypeScript, Zustand, and Firebase.

## Table of Contents


- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Firebase Setup](#firebase-setup)
  - [Running the Development Server](#running-the-development-server)
- [Project Structure](#project-structure)


## Features

The application includes the following features:

*   User Authentication (Sign up, Login with Email/Password, Google Login)
*   Create, list, and manage chat conversations
*   Send and receive messages within a chat
*   Update chat titles
*   Remove chats
*   Pin/Unpin chats
*   Add reactions to messages
*   Basic user activity logging

## Technologies Used

*   [Next.js](https://nextjs.org/) (v14+, App Router)
*   [React](https://reactjs.org/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Zustand](https://zustand-bearbites.vercel.app/) for state management
*   [Firebase](https://firebase.google.com/) (Authentication, Firestore)
*   [Tailwind CSS](https://tailwindcss.com/) (Styling)
*   [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) for font optimization (Geist font)


## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

*   Node.js (version 18 or higher)
*   npm, yarn, pnpm, or bun

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    ```
    ```bash
    cd synduct-chat
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Firebase Setup

1.  Create a new project in the [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Authentication** and set up desired sign-in methods (e.g., Email/Password, Google).
3.  Enable **Firestore Database**. Start in production mode and set up security rules later.
4.  Get your Firebase project configuration.
5.  Create a `.env.local` file in the root of your project and add your Firebase configuration:

    ```dotenv
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID # Optional
    ```

### Running the Development Server

First, run the development server:

```bash
npm run dev
```

## Project Structure

*   `app/`: Contains the Next.js App Router pages and layouts. `app/chat/[chatId]/page.tsx` handles individual chat views.
*   `components/`: Reusable React components (e.g., `AuthForm`, `ChatList`, `ChatWindow`, `ChatMessage`, `ChatInput`).
*   `lib/`: Utility functions, Firebase initialization and interaction logic (`lib/firebase`), and Zustand stores (`lib/zustand`).
*   `src/`: The main source directory containing the above.
