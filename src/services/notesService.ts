import axios from 'axios';
import { Note } from '../types/Note';

const API_URL = 'http://localhost:3001/notes';

export const NotesService = {
  fetchNotes: async (): Promise<Note[]> => (await axios.get(API_URL)).data,
  createNote: async (note: Note): Promise<Note> => (await axios.post(API_URL, note)).data,
  updateNote: async (note: Note): Promise<Note> => (await axios.put(`${API_URL}/${note.id}`, note)).data,
  deleteNote: async (id: string): Promise<void> => { await axios.delete(`${API_URL}/${id}`); }
};
