
export default function SyncStatusBar({ online, syncing, lastSyncAt }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        background: online ? "#e0ffe0" : "#ffe0e0",
        display: "flex",
        justifyContent: "space-between",
        fontSize: 14
      }}
    >
      <span>{online ? "Online" : "Offline (changes will sync later)"}</span>
      <span>{syncing ? "Syncing..." : lastSyncAt ? `Last sync: ${new Date(lastSyncAt).toLocaleTimeString()}` : "Never synced"}</span>
    </div>
  );
}
