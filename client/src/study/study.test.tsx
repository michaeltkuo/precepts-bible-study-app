import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KEY_WORD_BY_ID } from "../marking/library";
import { MarkingToolbar } from "./MarkingToolbar";
import { PassagePane } from "./PassagePane";

const TEXT = "For God so loved the world, that whoever believes in Him; the world believes.";

describe("PassagePane", () => {
  it("renders the passage with its marks and suggests unmarked key words", () => {
    const godStart = TEXT.indexOf("God");
    render(
      <PassagePane
        reference="JHN.3.16"
        translation="NASB 2020"
        text={TEXT}
        marks={[{ id: "a", startOffset: godStart, endOffset: godStart + 3, keywordId: "god" }]}
        onMarksChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Passage view")).toHaveTextContent(TEXT);
    expect(screen.getByText(/1 mark$/)).toBeInTheDocument();
    const also = screen.getByLabelText("Also in this passage");
    expect(within(also).getAllByText("believe").length).toBeGreaterThan(0);
  });

  it("marks every occurrence from the legend", () => {
    const onMarksChange = vi.fn();
    render(<PassagePane reference="JHN.3.16" translation="NASB 2020" text={TEXT} marks={[]} onMarksChange={onMarksChange} />);

    const row = within(screen.getByLabelText("Also in this passage")).getAllByRole("listitem").find((li) => li.textContent?.includes("world"))!;
    fireEvent.click(within(row).getByRole("button", { name: "Mark all" }));

    const marks = onMarksChange.mock.calls[0][0];
    expect(marks).toHaveLength(2);
    expect(marks.every((m: { keywordId: string }) => m.keywordId === "world")).toBe(true);
  });

  it("renders legacy category marks through the library", () => {
    render(
      <PassagePane
        reference="JHN.3.16"
        translation="NASB 2020"
        text={TEXT}
        marks={[{ id: "old", startOffset: 4, endOffset: 7, category: "god" }]}
        onMarksChange={vi.fn()}
      />,
    );
    expect(screen.getByTitle("God")).toHaveTextContent("God");
  });
});

describe("MarkingToolbar", () => {
  const start = TEXT.indexOf("believes");
  const props = {
    text: TEXT,
    selection: { start, end: start + 8 },
    recent: [],
    existing: [],
    countFor: () => 2,
    onRemove: vi.fn(),
    onClose: vi.fn(),
  };

  it("suggests the matching key word and applies it", () => {
    const onApply = vi.fn();
    render(<MarkingToolbar {...props} onApply={onApply} onMarkAll={vi.fn()} />);
    const dialog = screen.getByRole("dialog", { name: "Mark selection" });
    fireEvent.click(within(dialog).getAllByText("believe")[0]);
    expect(onApply).toHaveBeenCalledWith("believe", { start, end: start + 8 });
  });

  it("marks all occurrences and searches the library", () => {
    const onMarkAll = vi.fn();
    render(<MarkingToolbar {...props} onApply={vi.fn()} onMarkAll={onMarkAll} />);
    fireEvent.click(screen.getAllByRole("button", { name: "All 2" })[0]);
    expect(onMarkAll).toHaveBeenCalledWith("believe");

    fireEvent.change(screen.getByPlaceholderText("Find a key word…"), { target: { value: "satan" } });
    expect(screen.getByText(KEY_WORD_BY_ID.devil.label)).toBeInTheDocument();
  });
});
