import { describe, expect, it } from "vitest";
import { PRECEPT_GLYPHS } from "./glyphs";
import { KEY_WORDS, KEY_WORD_BY_ID, LEGACY_CATEGORY_TO_KEYWORD } from "./library";
import { buildMarkTree } from "./markTree";
import { findOccurrences, findUnmarkedKeyWords, searchLibrary, snapToWords, suggestForSelection } from "./matcher";
import { isEmptyRecipe } from "./recipe";

const JOHN_3_16 =
  "For God so loved the world, that He gave His only Son, so that everyone who believes in Him will not perish, but have eternal life.";

const kw = (id: string) => {
  const found = KEY_WORD_BY_ID[id];
  if (!found) throw new Error(`missing key word ${id}`);
  return found;
};

describe("key word library", () => {
  it("has unique ids and a drawable recipe for every entry", () => {
    const ids = KEY_WORDS.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const k of KEY_WORDS) expect(isEmptyRecipe(k.recipe), k.id).toBe(false);
  });

  it("only references Precept glyphs that exist", () => {
    for (const k of KEY_WORDS) {
      const glyph = k.recipe.symbol?.glyph;
      if (glyph?.startsWith("p:")) expect(PRECEPT_GLYPHS[glyph.slice(2)], `${k.id} → ${glyph}`).toBeDefined();
    }
  });

  it("flags the Precept Ministries core words", () => {
    const core = KEY_WORDS.filter((k) => k.source === "precept").map((k) => k.label);
    expect(core).toEqual(expect.arrayContaining(["God", "Jesus Christ", "Holy Spirit", "covenant", "believe", "repent"]));
    expect(core.length).toBeGreaterThanOrEqual(30);
  });

  it("maps every legacy category to a real key word", () => {
    for (const id of Object.values(LEGACY_CATEGORY_TO_KEYWORD)) expect(KEY_WORD_BY_ID[id], id).toBeDefined();
  });
});

describe("matching", () => {
  it("matches inflections and aliases", () => {
    expect(findOccurrences(JOHN_3_16, kw("believe")).map((o) => JOHN_3_16.slice(o.start, o.end))).toEqual(["believes"]);
    expect(findOccurrences(JOHN_3_16, kw("love"))).toHaveLength(1);
    expect(findOccurrences("by grace through faith", kw("believe"))).toHaveLength(1);
  });

  it("respects capitalisation for God and god", () => {
    const text = "God said, You shall have no other gods before Me.";
    expect(findOccurrences(text, kw("god"))).toHaveLength(1);
    expect(findOccurrences(text, kw("god-false-god"))).toHaveLength(1);
  });

  it("matches whole words only", () => {
    expect(findOccurrences("He was allied with them", kw("all"))).toHaveLength(0);
    expect(findOccurrences("all things", kw("all"))).toHaveLength(1);
  });

  it("matches phrases across line breaks and curly apostrophes", () => {
    expect(findOccurrences("the day of\nthe Lord is near", kw("day-of-the-lord"))).toHaveLength(1);
    expect(findOccurrences("the Lord’s anointed", kw("anointed"))).toHaveLength(1);
  });

  it("snaps rough selections to whole words", () => {
    const start = JOHN_3_16.indexOf("od so");
    const range = snapToWords(JOHN_3_16, start, start + 9);
    expect(JOHN_3_16.slice(range.start, range.end)).toBe("God so loved");
  });
});

describe("suggestions", () => {
  it("puts the exact key word first", () => {
    const start = JOHN_3_16.indexOf("believes");
    const [first] = suggestForSelection(JOHN_3_16, { start, end: start + 8 }, KEY_WORDS);
    expect(first.keyword.id).toBe("believe");
    expect(first.kind).toBe("exact");
  });

  it("offers the whole phrase when part of it is selected", () => {
    const start = JOHN_3_16.indexOf("eternal");
    const suggestions = suggestForSelection(JOHN_3_16, { start, end: start + 7 }, KEY_WORDS);
    const phrase = suggestions.find((s) => s.keyword.id === "eternal-life");
    expect(phrase?.kind).toBe("phrase");
    expect(JOHN_3_16.slice(phrase!.range.start, phrase!.range.end)).toBe("eternal life");
  });

  it("finds key words inside a longer selection", () => {
    const suggestions = suggestForSelection(JOHN_3_16, { start: 0, end: 27 }, KEY_WORDS);
    expect(suggestions.map((s) => s.keyword.id)).toEqual(expect.arrayContaining(["god", "love", "world"]));
  });

  it("searches by name and alias", () => {
    expect(searchLibrary("faith", KEY_WORDS)[0].id).toBe("believe");
    expect(searchLibrary("satan", KEY_WORDS).map((k) => k.id)).toContain("devil");
  });

  it("lists library words that are still unmarked", () => {
    const godStart = JOHN_3_16.indexOf("God");
    const unmarked = findUnmarkedKeyWords(JOHN_3_16, KEY_WORDS, [{ start: godStart, end: godStart + 3, keywordId: "god" }]);
    const ids = unmarked.map((u) => u.keyword.id);
    expect(ids).not.toContain("god");
    expect(ids).toEqual(expect.arrayContaining(["believe", "eternal-life", "world"]));
  });
});

describe("buildMarkTree", () => {
  const text = "the word of the Lord came";
  const mark = (id: string, phrase: string, from = 0) => {
    const start = text.indexOf(phrase, from);
    return { id, startOffset: start, endOffset: start + phrase.length };
  };

  it("nests a word inside a marked phrase", () => {
    const tree = buildMarkTree(text, [mark("lord", "Lord"), mark("phrase", "word of the Lord")]);
    expect(tree.map((n) => n.type)).toEqual(["text", "mark", "text"]);
    const outer = tree[1];
    if (outer.type !== "mark") throw new Error();
    expect(outer.mark.id).toBe("phrase");
    expect(outer.children.some((c) => c.type === "mark" && c.mark.id === "lord")).toBe(true);
  });

  it("splits a mark that crosses another", () => {
    const tree = buildMarkTree(text, [mark("a", "word of"), mark("b", "of the Lord")]);
    const rendered = tree.map((n) => (n.type === "text" ? n.text : `[${n.mark.id}]`)).join("");
    expect(rendered).toBe("the [a][b] came");
  });

  it("keeps every character exactly once", () => {
    const tree = buildMarkTree(text, [mark("a", "word of"), mark("b", "of the Lord"), mark("c", "the", 5)]);
    const flatten = (nodes: typeof tree): string =>
      nodes.map((n) => (n.type === "text" ? n.text : flatten(n.children))).join("");
    expect(flatten(tree)).toBe(text);
  });
});
