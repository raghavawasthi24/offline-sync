interface SessionListI {

}

export default function SessionList({ sessions, onSelect, onCreate, onDelete }) {
  return (
    <div className="w-1/3 p-4 border-r-2 flex flex-col gap-2">
      <button onClick={onCreate} className="border-2 border-black p-2 rounded-xl">+ New Session</button>
      <ul>
        {sessions.map((s) => (
          <li
            key={s._id}
            className="p-2 cursor-pointer border-b-2 flex justify-between items-center"
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
