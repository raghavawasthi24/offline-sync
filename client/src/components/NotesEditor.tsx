import { useEffect, useState, useMemo } from "react";
import type { NotesI } from "../types/notes";

interface NotesEditorI {
  note: NotesI | null;
  onChange: (value: NotesI) => void;
}

export default function NotesEditor({ note, onChange }: NotesEditorI) {
  const [value, setValue] = useState(note);

  useEffect(() => {
    setValue(note);
  }, [note]);

  const isDirty = useMemo(() => {
    return JSON.stringify(value) !== JSON.stringify(note);
  }, [value, note]);

  if (!value) {
    return (
      <div className="p-6 text-gray-500 text-center text-md">
        Select or create a note to begin.
      </div>
    );
  }

  const handleFieldChange = (field: keyof NotesI, newVal: string) => {
    setValue({ ...value, [field]: newVal });
  };


  return (
    <div className="flex flex-col h-full p-4 gap-4 w-2/3">
      <input
        className="w-full p-3 text-xl font-semibold border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={value.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
        placeholder="Title"
      />

      <textarea
        className="flex-1 p-3 border rounded resize-none leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={value.content}
        onChange={(e) => handleFieldChange("content", e.target.value)}
        placeholder="Start typing..."
      />

      <div className="flex justify-end">
        <button
          onClick={() => onChange(value)}
          disabled={!isDirty}
          className={`px-5 py-2 rounded text-white font-medium transition
            ${isDirty ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}
          `}
        >
          Save
        </button>
      </div>
    </div>
  );
}
