export interface NotesI {
    title: string;
    content: string;
    _id: string;
}

export interface SyncServerI {
    changes : NotesI;
    _id: string;
    ops: string;
}
