import { component$ } from '@builder.io/qwik';
import {NotesList} from "~/components/notes/NotesList";


export default component$(() => {
    return (
        <div>
            <NotesList />
        </div>
    );
});