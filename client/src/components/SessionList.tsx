export default function SessionList({ sessions, onSelect, onCreate, onDelete }) {
  return (
    <div style={{ width: "30%", borderRight: "1px solid #ddd", padding: 12 }}>
      <button onClick={onCreate}>+ New Session</button>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
        {sessions.map((s) => (
          <li
            key={s._id}
            style={{
              padding: "6px 4px",
              cursor: "pointer",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span onClick={() => onSelect(s)}>{s.title || "(untitled)"}</span>
            <button onClick={() => onDelete(s)} style={{ marginLeft: 8 }}>
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
