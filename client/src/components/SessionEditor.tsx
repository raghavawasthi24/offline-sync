import { useEffect, useState } from "react";
import type { NotesI } from "../types/notes";

interface NotesEditorI {
  note: NotesI | null;
  onChange: (value: NotesI) => void;
}

export default function NotesEditor({ note, onChange }: NotesEditorI) {
  const [value, setValue] = useState(note);

  useEffect(() => {
    setValue(note)
  }, [note])

  if (!value) {
    return <div className="p-3">Select or create a note to start practicing.</div>;
  }

  const handleFieldChange = (field: string, newVal: string) => {
    setValue({ ...value, [field]: newVal })
  };

  return (
    <div className="flex-1 p-2">
      <input
        className="w-full p-2 text-md border"
        value={value.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
        placeholder="Notes title"
      />
      <textarea
        className="w-full min-h-24 p-2 border"
        value={value.content}
        onChange={(e) => handleFieldChange("content", e.target.value)}
        placeholder="Type your practice content here..."
      />

      <button onClick={() => onChange(value)}>Save</button>
    </div>
  );
}
