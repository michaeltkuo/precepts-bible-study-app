import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  it("renders sessions and triggers callbacks", () => {
    const onSelectSession = vi.fn();
    const onDeleteSession = vi.fn();
    const onNewStudy = vi.fn();

    render(
      <Sidebar
        sessions={[
          {
            id: 1,
            title: "Session One",
            passageRef: "JHN.3.16",
            createdAt: "2026-03-28",
            stageCompleted: 1,
          },
        ]}
        activeSessionId={1}
        onSelectSession={onSelectSession}
        onDeleteSession={onDeleteSession}
        onNewStudy={onNewStudy}
      />
    );

    expect(screen.getByText("Session One")).toBeInTheDocument();
    fireEvent.click(screen.getByText("+ New Study"));
    expect(onNewStudy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Session One"));
    expect(onSelectSession).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByLabelText("Delete Session One"));
    expect(onDeleteSession).toHaveBeenCalledWith(1);
  });
});
