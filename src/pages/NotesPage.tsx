import React, { useEffect, useState } from 'react';
import { db } from '../db/indexedDb';
import { Note } from '../types/Note';
import { v4 as uuidv4 } from 'uuid';
import { NotesService } from '../services/notesService';
import { useDebouncedEffect } from '../hooks/useDebouncedEffect';

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  useEffect(() => {
    db.notes.toArray().then(setNotes);
  }, []);

  useDebouncedEffect(() => {
    if (currentNote) {
      saveNote(currentNote);
    }
  }, [currentNote?.title, currentNote?.content], 500);

  const createNote = async () => {
    const note: Note = {
      id: uuidv4(),
      title: '',
      content: '',
      updatedAt: new Date().toISOString(),
      synced: false,
    };
    await db.notes.put(note);
    setNotes(await db.notes.toArray());
    setCurrentNote(note);
  };

  const saveNote = async (note: Note) => {
    const updatedNote = {
      ...note,
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    await db.notes.put(updatedNote);
    setNotes(await db.notes.toArray());

    if (online) {
      try {
        const res = await fetch(`http://localhost:3001/notes/${note.id}`);
        if (res.status === 404) {
          await NotesService.createNote({ ...updatedNote, synced: true });
        } else {
          await NotesService.updateNote({ ...updatedNote, synced: true });
        }

        updatedNote.synced = true;
        await db.notes.put(updatedNote);
        setNotes(await db.notes.toArray());
      } catch (err) {
        console.error('Sync error:', err);
      }
    }
  };

  const deleteNote = async (id: string) => {
    const confirm = window.confirm('Delete this note?');
    if (!confirm) return;

    const targetNote = notes.find((n) => n.id === id);
    try {
      await db.notes.delete(id);
      if (online && targetNote?.synced) {
        await NotesService.deleteNote(id);
      }
      setNotes(await db.notes.toArray());
      if (currentNote?.id === id) {
        setCurrentNote(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filtered = notes
    .filter((note) =>
      `${note.title} ${note.content}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-600 rounded-sm"></div>
          <span className="text-xl font-semibold tracking-tight">Offline Notes</span>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${
            online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}
        >
          {online ? 'Online' : 'Offline'}
        </span>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-4 py-2 shadow-sm"
            placeholder="Search your notes..."
          />
          <button
            onClick={createNote}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg shadow-md transition"
          >
            New Note
          </button>
        </div>

        {currentNote && (
          <div className="bg-white border rounded-xl px-5 py-4 shadow-sm mb-6">
            <input
              className="w-full text-lg font-semibold border-b border-gray-300 mb-3 p-2"
              placeholder="Title"
              value={currentNote.title}
              onChange={(e) =>
                setCurrentNote({ ...currentNote, title: e.target.value })
              }
            />
            <textarea
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Write your content..."
              rows={6}
              value={currentNote.content}
              onChange={(e) =>
                setCurrentNote({ ...currentNote, content: e.target.value })
              }
            />
            <p className="text-right text-xs text-gray-500 mt-2">Autosave enabled</p>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-md hover:border-blue-500 transition cursor-pointer"
            >
              <div className="flex justify-between items-center mb-1">
                <h2
                  onClick={() => setCurrentNote(note)}
                  className="text-lg font-semibold text-gray-800 truncate"
                >
                  {note.title || 'Untitled'}
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      note.synced
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {note.synced ? 'Synced' : 'Unsynced'}
                  </span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500">{new Date(note.updatedAt).toLocaleString()}</p>
              <p className="text-sm mt-2 text-gray-700 truncate">{note.content || '...'}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default NotesPage;
