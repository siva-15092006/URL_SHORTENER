# URL Shortener 

A React-based URL Shortener web application with integrated logging middleware, built for the Frontend assessment track.

## Repository Structure
├── LoggingMiddleware/        Reusable logging package

└── FrontendTestSubmission/   React application (URL Shortener)

## Overview

This repository contains two components:

### LoggingMiddleware

A reusable Node.js package exposing a single `Log(stack, level, package, message)` function. Every significant event in the frontend application — successes, state changes, warnings, and errors — is sent through this function instead of using `console.log` or any built-in logger.

### FrontendTestSubmission

A React application that allows users to:

- Shorten up to 5 URLs at once, with optional custom validity (in minutes, defaults to 30) and optional custom shortcodes
- View all shortened URLs and their analytics on a dedicated statistics page, including click counts and detailed click history (timestamp, source, location)
- Get redirected automatically when visiting a shortened URL, handled entirely client-side via React Router

The app runs exclusively on `http://localhost:3000` and uses Material UI for styling.

## Setup & Running Locally

1. Install dependencies for the logging package:
```bash
   cd LoggingMiddleware
   npm install
```

2. Install dependencies for the frontend app:
```bash
   cd ../FrontendTestSubmission
   npm install
```

3. Start the application:
```bash
   npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- React (Create React App)
- React Router (client-side routing)
- Material UI (styling)
- Axios (HTTP requests)
- `localStorage` (client-side persistence)

## Key Design Decisions

- **Data persistence**: All shortened URL records are stored in the browser's `localStorage`, since the application is fully client-side with no dedicated backend server for this track.
- **Shortcode reuse**: Expired shortcodes become available for reuse; creating a new URL with a previously expired shortcode replaces the old record.
- **Routing**: A catch-all dynamic route (`/:shortcode`) handles redirection, placed after the fixed routes (`/` and `/stats`) to avoid route-matching conflicts.
- **Logging**: The Logging Middleware is integrated from the first function executed in the application and used throughout all layers (pages, state, utilities) instead of console logging.
