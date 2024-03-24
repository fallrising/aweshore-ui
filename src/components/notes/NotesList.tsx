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
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
        totalCount: 0,
        newNote: { title: '', content: '' } as Note,
        loading: true,
    });

    const fetchNotes = $(async () => {
        const { notes, totalPages, totalCount } = await api.getNotes(store.currentPage, store.pageSize);
        store.notes = notes;
        store.totalPages = totalPages;
        store.totalCount = totalCount;
    });

    const notesResource = useResource$<Note[]>(async () => {
        const { notes, totalPages, totalCount } = await api.getNotes(store.currentPage, store.pageSize);
        store.notes = notes;
        store.loading = false;
        store.totalPages = totalPages;
        store.totalCount = totalCount;
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
            <div>
                <div class={styles.paginationControls}>
                    <input
                        type="number"
                        class={styles.pageInput}
                        value={store.currentPage}
                        onInput$={(e) => (store.currentPage = parseInt((e.target as HTMLTextAreaElement).value))}
                        placeholder="Page Number"
                    />
                    <input
                        type="number"
                        class={styles.pageSizeInput}
                        value={store.pageSize}
                        onInput$={(e) => (store.pageSize = parseInt((e.target as HTMLTextAreaElement).value))}
                        placeholder="Page Size"
                    />
                    <span>Total Notes: {store.totalCount}</span>
                    <button onClick$={() => store.currentPage = Math.max(1, store.currentPage - 1)}>Prev</button>
                    <button
                        onClick$={() => store.currentPage = Math.min(store.totalPages, store.currentPage + 1)}>Next
                    </button>
                </div>
                {/* Note rendering and other component logic remains the same */}
            </div>
            <div>Total Notes: {store.totalCount}</div>
            <div class={styles.rwdTable}>
                <div class={styles.rwdTr}>
                    <div class={styles.rwdTh}>ID</div>
                    <div class={styles.rwdTh}>Title</div>
                    <div class={styles.rwdTh}>Content</div>
                    <div class={styles.rwdTh}>Created</div>
                    <div class={styles.rwdTh}>Updated</div>
                    <div class={styles.rwdTh}>Actions</div>
                </div>

                <Resource
                    value={notesResource}
                    onResolved={() => (
                        <>
                            {store.notes.map((note) => (
                                <div key={note.id} class={styles.rwdTr}>
                                    <div class={styles.rwdTd}>{note.id}</div>
                                    {/* Update data-th attributes if needed */}
                                    <div class={styles.rwdTd} data-th="Title">
                                        <input
                                            type="text"
                                            value={note.title}
                                            onInput$={(e) => (note.title = (e.target as HTMLInputElement).value)}
                                        />
                                    </div>
                                    {/* Other cells similarly */}
                                    <div class={styles.rwdTd} data-th="Content">
                                    <textarea
                                        value={note.content}
                                        onInput$={(e) => (note.content = (e.target as HTMLTextAreaElement).value)}
                                    ></textarea>
                                    </div>
                                    <div class={styles.rwdTd}>{formatDate(note.created)}</div>
                                    <div class={styles.rwdTd}>{formatDate(note.updated)}</div>
                                    <div class={styles.rwdTd}>
                                        <button onClick$={() => updateNote(note)}>Save
                                        </button>
                                        <button
                                            onClick$={() => deleteNote(note.id)}>Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {/* Row for adding a new note */}
                            <div class={styles.rwdTr}>
                                <div class={styles.rwdTd}>
                                </div>
                                <div class={styles.rwdTd}>
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={store.newNote.title}
                                        onInput$={(e) => (store.newNote.title = (e.target as HTMLInputElement).value)}
                                    />
                                </div>
                                <div class={styles.rwdTd}>
                                <textarea
                                    placeholder="Content"
                                    value={store.newNote.content}
                                    onInput$={(e) => (store.newNote.content = (e.target as HTMLTextAreaElement).value)}
                                ></textarea>
                                </div>
                                <div class={styles.rwdTd}>
                                </div>
                                <div class={styles.rwdTd}>
                                </div>
                                <div class={styles.rwdTd}>
                                    <button onClick$={addNote}>Add Note</button>
                                </div>
                            </div>
                        </>
                    )}
                />
            </div>
        </div>
    );
});
