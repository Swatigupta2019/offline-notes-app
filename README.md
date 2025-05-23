
# Offline Notes App

This is an offline-first notes application built with React and TypeScript. It allows users to create, edit, delete, and search through notes even without internet connectivity. Notes are stored in the browser using IndexedDB and are automatically synced to a mock backend when the device is back online.

---

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/Swatigupta2019/offline-notes-app.git
   cd offline-notes-app
   ```

2. Install project dependencies:

   ```bash
   npm install
   ```

3. Start the mock backend using json-server:

   ```bash
   npm install -g json-server
   json-server --watch db.json --port 3001
   ```

4. Start the app:

   ```bash
   npm start
   ```

---

## Features

- Create, edit, and delete notes
- Works fully offline using IndexedDB
- Syncs automatically when internet is back
- Debounced autosave while editing
- Sync status indicator (Synced / Unsynced)
- Search notes by title or content
- Notes sorted by last modified date

---

## Design Decisions

- Used idb for a clean abstraction over IndexedDB
- Notes have UUIDs to avoid collisions and support syncing
- Manual sync logic allows better handling of retries and errors
- UI is built with Tailwind CSS for faster styling
- json-server is used for simulating backend REST endpoints

---

## Assumptions and Limitations

- Conflict resolution is "last write wins"
- Only single-user functionality (no login/auth)
- Markdown is saved as plain text, no advanced rendering
- Notes deleted offline will only be removed from the server once back online
- Not a full PWA (no service worker)

---

## How to Test

- Open Chrome DevTools and go to the "Network" tab
- Set the network to "Offline"
- Create or edit some notes
- Re-enable the network; notes will automatically sync
- Visit http://localhost:3001/notes to confirm they were saved to the mock API

---

## Project Structure

```
offline-notes-app/
├── public/
│   └── index.html
├── src/
│   ├── db/               # IndexedDB setup
│   ├── hooks/            # Custom React hooks (e.g., autosave, connectivity)
│   ├── pages/            # NotesPage UI
│   ├── services/         # REST API logic
│   ├── types/            # TypeScript models
│   ├── index.tsx         # Main entry point
│   └── index.css         # Tailwind CSS configuration
├── db.json               # Mock backend data
└── README.md
```

---

## Optional Deployment

The app can be deployed using platforms like Vercel or Netlify. Note that the mock backend (json-server) must be separately hosted or replaced with a real backend for full sync functionality in production.
