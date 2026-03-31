import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PassageView } from "./PassageView";

describe("PassageView", () => {
  it("renders passage text and highlight count", () => {
    render(
      <PassageView
        passageRef="JHN.3.16"
        text="For God so loved the world"
        highlights={[
          { id: "a", startOffset: 0, endOffset: 3, category: "god" },
          { id: "b", startOffset: 12, endOffset: 17, category: "salvation" },
        ]}
        quickCategories={["god", "jesus", "holySpirit", "people", "sin"]}
        selectedStyle="highlight-yellow"
        onQuickHighlight={vi.fn()}
        onDeleteHighlightsInRange={vi.fn()}
        onSelectStyle={vi.fn()}
        onSelectionContextChange={vi.fn()}
      />
    );

    expect(screen.getByText("JHN.3.16")).toBeInTheDocument();
    expect(screen.getByText("2 highlights")).toBeInTheDocument();
    expect(screen.getByLabelText("Passage view")).toHaveTextContent("For God so loved the world");
  });
});
