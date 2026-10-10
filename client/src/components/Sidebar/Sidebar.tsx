import { Button, Icon, IconButton, Segmented, SessionItem, useTheme, type ThemePreference } from "../../design-system";
import type { SessionSummary } from "../../types/study";

type SidebarProps = {
  sessions: SessionSummary[];
  activeSessionId: number | null;
  onSelectSession: (id: number) => void;
  onDeleteSession: (id: number) => void;
  onNewStudy: () => void;
  onClose?: () => void;
};

export const Sidebar = ({ sessions, activeSessionId, onSelectSession, onDeleteSession, onNewStudy, onClose }: SidebarProps) => {
  const { preference, setPreference } = useTheme();

  return (
    <aside aria-label="Study sessions" className="flex h-full flex-col gap-4 bg-paper-sunken p-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="flex items-center gap-2 font-display text-lg font-medium text-ink">
          <span className="grid size-7 place-items-center rounded-md bg-ribbon text-sm text-ribbon-ink">
            <Icon name="bookmark-fill" />
          </span>
          Precepts Study
        </p>
        {onClose ? <IconButton icon="layout-sidebar" label="Close sidebar" size="sm" onClick={onClose} /> : null}
      </div>

      <Button variant="secondary" size="sm" icon="plus-lg" onClick={onNewStudy} className="w-full">
        New study
      </Button>

      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <p className="px-1 font-ui text-2xs font-semibold uppercase tracking-[0.12em] text-ink-faint">My studies</p>
        <ul className="flex min-h-0 flex-col gap-0.5 overflow-y-auto">
          {sessions.map((session) => (
            <li key={session.id} className="group relative">
              <SessionItem
                title={session.title}
                reference={session.passageRef}
                stage={session.stageCompleted}
                active={session.id === activeSessionId}
                onClick={() => onSelectSession(session.id)}
              />
              <IconButton
                icon="trash3"
                label={`Delete ${session.title}`}
                size="sm"
                variant="danger"
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
                onClick={() => onDeleteSession(session.id)}
              />
            </li>
          ))}
        </ul>
      </div>

      <Segmented<ThemePreference>
        label="Colour theme"
        value={preference}
        onChange={setPreference}
        options={[
          { value: "light", label: "Light", icon: "sun" },
          { value: "dark", label: "Dark", icon: "moon-stars" },
          { value: "system", label: "Auto", icon: "circle-half" },
        ]}
      />
    </aside>
  );
};
