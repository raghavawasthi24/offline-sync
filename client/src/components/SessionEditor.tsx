export default function SessionEditor({ session, onChange }) {
  if (!session) {
    return <div style={{ padding: 12 }}>Select or create a session to start practicing.</div>;
  }

  const handleFieldChange = (field, value) => {
    onChange({ ...session, [field]: value });
  };

  return (
    <div style={{ flex: 1, padding: 12 }}>
      <input
        style={{ width: "100%", padding: 8, fontSize: 18, marginBottom: 8 }}
        value={session.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
        placeholder="Session title"
      />
      <textarea
        style={{ width: "100%", height: "70vh", padding: 8 }}
        value={session.content}
        onChange={(e) => handleFieldChange("content", e.target.value)}
        placeholder="Type your practice content here..."
      />
    </div>
  );
}
