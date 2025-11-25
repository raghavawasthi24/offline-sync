interface StatusBarI {
  online: boolean;
  syncing: boolean;
}

export default function SyncStatusBar({ online, syncing }: StatusBarI) {
  return (
    <div
      className="py-1 px-2 flex justify-between text-sm"
      style={{
        background: online ? "#e0ffe0" : "#ffe0e0",
      }}
    >
      <span>{online ? "Online" : "Offline (changes will sync later)"}</span>
      <span>{syncing && "Syncing..."}</span>
    </div>
  );
}
