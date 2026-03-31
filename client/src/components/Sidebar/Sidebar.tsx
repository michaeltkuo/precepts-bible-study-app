import type { SessionSummary } from "../../types/study";

type SidebarProps = {
  sessions: SessionSummary[];
  activeSessionId: number | null;
  onSelectSession: (id: number) => void;
  onDeleteSession: (id: number) => void;
  onNewStudy: () => void;
};

export const Sidebar = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewStudy,
}: SidebarProps) => {
  return (
    <aside className="sidebar" aria-label="Study sessions">
      <div className="sidebar-header">
        <h1>Precepts Study</h1>
        <button type="button" onClick={onNewStudy}>
          + New Study
        </button>
      </div>

      <ul className="session-list">
        {sessions.map((session) => (
          <li key={session.id} className="session-pill-row">
            <button
              type="button"
              className={`session-pill ${session.id === activeSessionId ? "active" : ""}`}
              onClick={() => onSelectSession(session.id)}
            >
              <div className="session-title">{session.title}</div>
              <div className="session-subtitle">{session.passageRef}</div>
            </button>
            <button
              type="button"
              className="session-delete"
              aria-label={`Delete ${session.title}`}
              title="Delete session"
              onClick={() => onDeleteSession(session.id)}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0A.5.5 0 0 1 8.5 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2H5V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h2.5a1 1 0 0 1 1 1ZM6 1v1h4V1H6Zm-2 3v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4Z" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};
