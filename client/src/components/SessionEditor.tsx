import { useEffect, useState } from "react";

export default function SessionEditor({ session, onChange }) {
  console.log("session", session)
  const [value, setValue] = useState(session);


  useEffect(()=>{
    setValue(session)
  },[session])

  console.log("VAlue", value)
  if (!value) {
    return <div className="p-3">Select or create a session to start practicing.</div>;
  }

  const handleFieldChange = (field, newVal) => {
    setValue({ ...value, [field]: newVal })
  };

  return (
    <div className="flex-1 p-2">
      <input
        className="w-full p-2 text-md"
        value={value.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
        placeholder="Session title"
      />
      <textarea
        className="w-full min-h-24 p-2"
        value={value.content}
        onChange={(e) => handleFieldChange("content", e.target.value)}
        placeholder="Type your practice content here..."
      />

      <button onClick={() => onChange(value)}>Save</button>
    </div>
  );
}
