import Dexie, { Table } from 'dexie';
import { Note } from '../types/Note';

class NotesDB extends Dexie {
  notes!: Table<Note, string>;

  constructor() {
    super('NotesDatabase');
    this.version(1).stores({
      notes: 'id, updatedAt, title, synced',
    });
  }
}

export const db = new NotesDB();
