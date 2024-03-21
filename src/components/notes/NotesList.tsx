// src/components/NotesList.tsx
import { component$, useStore, useResource$, Resource, $ } from '@builder.io/qwik';
import * as api from '../../services/api';

export interface Note {
    id: number;
    title: string;
    content: string;
    created: string; // Dates will be received as strings in JSON
    updated: string;
}
export const NotesList = component$(() => {

    const store = useStore<{ notes: Note[]; loading: boolean }>({
        notes: [],
        loading: true,
    });

    const reposResource = useResource$<Note[]>(({cleanup }) => {
        const controller = new AbortController();
        cleanup(() => controller.abort());

        return api.getNotes();
    });

    // Wrap the deleteNote function with $() for proper serialization
    const deleteNote = $(async (id: number) => {
        try {
            await api.deleteNote(id);
            // Update the store directly or refetch notes as needed
            store.notes = store.notes.filter((note) => note.id !== id); // Remove the deleted note from the list
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    });

    return (
        <Resource
            value={reposResource}
            onPending={() => <>Loading...</>}
            onRejected={(error) => <>Error: {error.message}</>}
            onResolved={() => (
                <ul>
                    {store.notes.map((note) => (
                        <li key={note.id}>
                            {note.title} - {note.content}{' '}
                            <button onClick$={() => deleteNote(note.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        />
    );
});
