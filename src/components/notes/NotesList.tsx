// src/components/NotesList.tsx
import {component$, useStore, useResource$, Resource, $} from '@builder.io/qwik';
import * as api from '../../services/api';
import styles from "~/components/notes/notes.module.css";

export interface Note {
    id: number;
    title: string;
    content: string;
    created: string;
    updated: string;
}

export const NotesList = component$(() => {
    const store = useStore({
        notes: [] as Note[],
        newNote: { title: '', content: '' } as Note,
        loading: true,
    });

    const notesResource = useResource$<Note[]>(async () => {
        const notes = await api.getNotes();
        store.notes = notes;
        store.loading = false;
        return notes;
    });

    const updateNote = $(async (note: Note) => {
        try {
            await api.updateNote(note.id, note.title, note.content);
            // Optionally refresh the list or show a success message
        } catch (error) {
            console.error('Failed to update note:', error);
        }
    });

    const deleteNote = $(async (id: number) => {
        try {
            await api.deleteNote(id);
            store.notes = store.notes.filter((note) => note.id !== id);
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    });

    const addNote = $(async () => {
        if (!store.newNote.title || !store.newNote.content) {
            console.error('Title and content are required.');
            return;
        }
        const newNote = await api.createNote(store.newNote.title, store.newNote.content);
        // create empty note
        const insertedNote = { id: 0, title: store.newNote.title, content: store.newNote.content, created: '', updated: '' };
        // Ensure the new note has all the necessary properties, including the ID from the database.
        if (newNote && newNote.id > 0) {
            store.notes = [...store.notes, insertedNote];
        } else {
            throw new Error('New note was not returned by the API');
        }
        // Reset the new note form fields.
        store.newNote.title = '';
        store.newNote.content = '';
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div>
            <Resource
                value={notesResource}
                onResolved={() => (
                    <>
                        {store.notes.map((note) => (
                            <div key={note.id} class={styles.note}>
                                <input
                                    type="text"
                                    value={note.id.toString()}
                                    disabled
                                />
                                <input class={styles.noteInput}
                                    type="text"
                                    value={note.title}
                                    onInput$={(e) => (note.title = (e.target as HTMLInputElement).value)}
                                />
                                <textarea class={styles.noteTextArea}
                                    value={note.content}
                                    onInput$={(e) => (note.content = (e.target as HTMLTextAreaElement).value)}
                                ></textarea>
                                <input class={styles.noteMeta}
                                    type="text"
                                    value={formatDate(note.created)}
                                    disabled
                                />
                                <input class={styles.noteMeta}
                                    type="text"
                                    value={formatDate(note.updated)}
                                    disabled
                                />
                                <button class={styles.noteButton} onClick$={() => updateNote(note)}>Save</button>
                                <button class={styles.noteButton} onClick$={() => deleteNote(note.id)}>Delete</button>
                            </div>
                        ))}
                        <div class={styles.note}>
                            <input class={styles.noteInput}
                                type="text"
                                placeholder="Title"
                                value={store.newNote.title}
                                onInput$={(e) => (store.newNote.title = (e.target as HTMLInputElement).value)}
                            />
                            <textarea class={styles.noteTextArea}
                                placeholder="Content"
                                value={store.newNote.content}
                                onInput$={(e) => (store.newNote.content = (e.target as HTMLTextAreaElement).value)}
                            ></textarea>
                            <button class={styles.noteButton} onClick$={addNote}>Add Note</button>
                        </div>
                    </>
                )}
            />
        </div>
    );
});
