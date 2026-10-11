import { useEffect, useMemo, useState, type ReactNode } from "react";
import { KEY_WORDS, KEY_WORD_BY_ID, keyWordName, SOURCE_LABEL, type KeyWordSource } from "../../marking/library";
import { PENCIL_COLORS, type MarkRecipe } from "../../marking/recipe";
import { MarkingToolbar } from "../../study/MarkingToolbar";
import { PassagePane } from "../../study/PassagePane";
import type { HighlightMark } from "../../types/study";
import {
  Badge,
  Banner,
  Button,
  Eyebrow,
  Field,
  GuidanceCard,
  Heading,
  Icon,
  IconButton,
  KeyWordSample,
  Rule,
  Segmented,
  SessionItem,
  StageStepper,
  Surface,
  TextArea,
  TextInput,
  useTheme,
  type ThemePreference,
} from "..";
import { JOHN_3_16_18, JOHN_MARKS, SAMPLE_QUESTIONS, SAMPLE_SESSIONS } from "./sample";

const SECTIONS = [
  { id: "preview", label: "Study screen" },
  { id: "color", label: "Colour" },
  { id: "type", label: "Type" },
  { id: "marks", label: "Key words" },
  { id: "library", label: "Library" },
  { id: "components", label: "Components" },
  { id: "principles", label: "Principles" },
];

export const DesignSystemPage = () => {
  const { preference, setPreference } = useTheme();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-rule bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-ribbon text-ribbon-ink">
              <Icon name="bookmark-fill" />
            </span>
            <p className="font-display text-lg font-medium">Precepts · Design System</p>
          </div>
          <nav aria-label="Sections" className="order-3 flex w-full gap-1 overflow-x-auto md:order-none md:w-auto">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="whitespace-nowrap rounded-sm px-2.5 py-1 font-ui text-sm font-semibold text-ink-muted hover:bg-paper-sunken hover:text-ink"
              >
                {s.label}
              </a>
            ))}
          </nav>
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
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-4 py-12 sm:px-6">
        <section className="max-w-2xl">
          <Eyebrow className="mb-3">The Study Desk</Eyebrow>
          <h1 className="mb-4 font-display text-3xl font-medium">An open study Bible, a pencil case, and a good question.</h1>
          <p className="font-scripture text-lg leading-8 text-ink-muted">
            Paper surfaces, ink text, an oxblood ribbon for the one thing to do next, and gilt for the study guide.
            The passage is the page; everything else sits in the margins. Dark mode is the same desk by lamplight.
          </p>
        </section>

        <Section id="preview" eyebrow="Putting it together" title="The study screen">
          <p className="mb-6 max-w-2xl text-ink-muted">
            The real study components with sample data. Select any word in the passage to see suggested marks, type to
            search the library, or use “Mark all”. Tap a key word under the passage to trace it.
          </p>
          <StudyScreenPreview />
        </Section>

        <Section id="color" eyebrow="Tokens" title="Colour">
          <ColorTokens preference={preference} />
        </Section>

        <Section id="type" eyebrow="Tokens" title="Type">
          <TypeSpecimens />
        </Section>

        <Section id="marks" eyebrow="Precepts" title="Key-word marks">
          <MarkAnatomy />
        </Section>

        <Section id="library" eyebrow="Precepts" title="Key-word library">
          <LibrarySheet />
        </Section>

        <Section id="components" eyebrow="Library" title="Components">
          <ComponentGallery />
        </Section>

        <Section id="principles" eyebrow="Usage" title="Principles">
          <Principles />
        </Section>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-4 py-6 font-ui text-sm text-ink-faint sm:px-6">
          Scripture quotations taken from the (NASB®) New American Standard Bible®, Copyright © 2020 by The Lockman
          Foundation. Used by permission. All rights reserved. lockman.org
        </div>
      </footer>
    </div>
  );
};

const Section = ({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) => (
  <section id={id} className="scroll-mt-28">
    <div className="mb-6 flex flex-col gap-1.5">
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading level={2} className="text-2xl">
        {title}
      </Heading>
    </div>
    {children}
  </section>
);

/* ── Study screen preview ─────────────────────────────────────────────── */

const StudyScreenPreview = () => {
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(2);
  const [marks, setMarks] = useState<HighlightMark[]>(JOHN_MARKS);

  return (
    <div className="overflow-hidden rounded-lg border border-rule-strong bg-paper shadow-float">
      <div className="grid lg:grid-cols-[13.5rem_minmax(0,1fr)_20rem]">
        <aside className="hidden flex-col gap-4 border-r border-rule bg-paper-sunken p-3 lg:flex">
          <div className="flex items-center justify-between px-1">
            <span className="font-display text-base font-medium">My studies</span>
            <IconButton icon="layout-sidebar" label="Collapse sidebar" size="sm" />
          </div>
          <Button variant="secondary" size="sm" icon="plus-lg" className="w-full">
            New study
          </Button>
          <div className="flex flex-col gap-0.5">
            {SAMPLE_SESSIONS.map((s, i) => (
              <SessionItem key={s.title} {...s} active={i === 0} />
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-3 border-b border-rule px-4 py-2.5">
            <StageStepper current={stage} completed={1} stale={[4]} onSelect={setStage} />
          </div>
          <div className="px-5 py-8 sm:px-10">
            <PassagePane reference="John 3:16–18" translation="NASB 2020" text={JOHN_3_16_18} marks={marks} onMarksChange={setMarks} />
          </div>
        </div>

        <aside className="flex flex-col gap-5 border-t border-rule bg-paper-raised p-5 lg:border-t-0 lg:border-l">
          <div className="flex flex-col gap-1">
            <Eyebrow>Stage {stage} of 6</Eyebrow>
            <Heading level={3} className="text-xl">
              Mark key words & themes
            </Heading>
            <p className="text-sm text-ink-muted">Select a word to see suggested marks. Use “All” to mark every occurrence at once.</p>
          </div>
          <GuidanceCard questions={SAMPLE_QUESTIONS} />
          <Field id="preview-notes" label="Your notes">
            <TextArea id="preview-notes" defaultValue="“World” shows up four times in two verses. God loves it, doesn't send the Son to judge it, wants it saved." />
          </Field>
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" icon="arrow-left">
              Read
            </Button>
            <Button variant="primary" iconAfter="arrow-right">
              Continue to Ask
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};

/* ── Colour ───────────────────────────────────────────────────────────── */

const COLOR_GROUPS: Array<{ title: string; note: string; tokens: Array<[string, string]> }> = [
  {
    title: "Paper",
    note: "Surfaces, from the desk up to a popover.",
    tokens: [
      ["--paper", "Page"],
      ["--paper-sunken", "Sidebar, wells"],
      ["--paper-raised", "Cards, panels"],
      ["--paper-overlay", "Popovers, inputs"],
    ],
  },
  {
    title: "Ink & rules",
    note: "Text and hairlines. Muted for secondary text, faint for hints only.",
    tokens: [
      ["--ink", "Text"],
      ["--ink-muted", "Secondary"],
      ["--ink-faint", "Hints"],
      ["--rule", "Divider"],
      ["--rule-strong", "Input border"],
    ],
  },
  {
    title: "Ribbon & gilt",
    note: "Ribbon marks the next action and where you are. Gilt is the study guide's colour.",
    tokens: [
      ["--ribbon", "Primary"],
      ["--ribbon-soft", "Selected"],
      ["--gilt", "Guide, progress"],
      ["--gilt-soft", "Guide wash"],
    ],
  },
  {
    title: "States",
    note: "Separate from the accent. Always paired with an icon or a word.",
    tokens: [
      ["--success", "Saved, done"],
      ["--warn", "Out of date"],
      ["--danger", "Errors, delete"],
      ["--focus", "Keyboard focus"],
    ],
  },
];

const useTokenValues = (names: string[], key: string) => {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      setValues(Object.fromEntries(names.map((n) => [n, style.getPropertyValue(n).trim()])));
    };
    read();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", read);
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      media.removeEventListener("change", read);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return values;
};

const ColorTokens = ({ preference }: { preference: ThemePreference }) => {
  const names = COLOR_GROUPS.flatMap((g) => g.tokens.map(([n]) => n));
  const values = useTokenValues(names, preference);
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {COLOR_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-3">
          <div>
            <h3 className="font-display text-lg font-medium">{group.title}</h3>
            <p className="text-sm text-ink-muted">{group.note}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {group.tokens.map(([name, role]) => (
              <div key={name} className="overflow-hidden rounded-md border border-rule bg-paper-raised">
                <div className="h-14 border-b border-rule" style={{ background: `var(${name})` }} />
                <div className="px-2.5 py-2">
                  <p className="font-ui text-sm font-semibold">{role}</p>
                  <p className="font-mono text-2xs text-ink-faint">{name.replace("--", "")}</p>
                  <p className="font-mono text-2xs uppercase text-ink-faint">{values[name]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Type ─────────────────────────────────────────────────────────────── */

const TypeSpecimens = () => (
  <div className="flex flex-col gap-8">
    <div className="grid gap-4 md:grid-cols-3">
      <Surface className="flex flex-col gap-3">
        <Eyebrow>Display · EB Garamond</Eyebrow>
        <p className="font-display text-3xl font-medium leading-tight">The Gospel of John</p>
        <p className="text-sm text-ink-muted">Headings, study titles, passage references. Classic Bible typography. Use sparingly.</p>
      </Surface>
      <Surface className="flex flex-col gap-3">
        <Eyebrow>Scripture · Literata</Eyebrow>
        <p className="font-scripture text-scripture">For God so loved the world, that He gave His only Son…</p>
        <p className="text-sm text-ink-muted">The passage, study-guide questions, and your journal notes. Built for long reading on screens.</p>
      </Surface>
      <Surface className="flex flex-col gap-3">
        <Eyebrow>Interface · Source Sans 3</Eyebrow>
        <p className="font-ui text-xl font-semibold">Continue to Stage 3</p>
        <p className="text-sm text-ink-muted">Buttons, labels, menus, counts. Quiet and clear so it doesn't compete with the text.</p>
      </Surface>
    </div>
    <div className="overflow-x-auto rounded-lg border border-rule">
      <table className="w-full min-w-[34rem] text-left">
        <tbody>
          {[
            ["3xl · 48", "font-display text-3xl font-medium", "Page title"],
            ["2xl · 36", "font-display text-2xl font-medium", "Passage reference"],
            ["xl · 26", "font-display text-xl font-medium", "Section heading"],
            ["scripture · 19", "font-scripture text-scripture", "Bible text"],
            ["lg · 20", "font-ui text-lg font-semibold", "Panel title"],
            ["base · 16", "font-ui text-base", "Body and controls"],
            ["sm · 14", "font-ui text-sm", "Secondary text"],
            ["2xs · 11", "font-ui text-2xs font-semibold uppercase tracking-[0.12em]", "Eyebrow label"],
          ].map(([size, cls, use]) => (
            <tr key={size} className="border-b border-rule last:border-b-0">
              <td className="w-32 px-4 py-3 align-middle font-mono text-xs text-ink-faint">{size}</td>
              <td className={`px-4 py-3 ${cls}`}>{use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* ── Key-word marks ───────────────────────────────────────────────── */

const ANATOMY: Array<{ title: string; body: string; examples: Array<[string, MarkRecipe]> }> = [
  {
    title: "Wash",
    body: "A coloured-pencil fill. One colour, or two side by side.",
    examples: [
      ["nations", { wash: "green" }],
      ["coming of the Lord", { wash: ["sky", "yellow"] }],
    ],
  },
  {
    title: "Outline",
    body: "Box, double box, oval, dashed, brackets, cloud, bubble, banner, slant, arrow, jagged, roof, arch, canopy, bowl, table, castle.",
    examples: [
      ["bless", { wash: "pink", outline: { shape: "cloud", color: "blue" } }],
      ["believe", { wash: "green", outline: { shape: "banner", color: "blue" } }],
      ["remnant", { outline: { shape: "slant", color: "blue" } }],
      ["tabernacle", { wash: "sky", outline: { shape: "roof", color: "blue" } }],
    ],
  },
  {
    title: "Underline",
    body: "Single, double, dotted, dashed, wavy, zigzag, scalloped.",
    examples: [
      ["Greece", { underline: { style: "double", color: "green" } }],
      ["Jordan", { underline: { style: "wavy", color: "blue" } }],
      ["conjure", { wash: "yellow", underline: { style: "zigzag", color: "black" } }],
    ],
  },
  {
    title: "Symbol",
    body: "Above, over, before, after or at both ends. Precept glyphs, any of 2,000 icons, or letters.",
    examples: [
      ["God", { symbol: { glyph: "p:triangle", color: "purple", placement: "over", fill: "yellow" } }],
      ["blood", { symbol: { glyph: "bi:droplet-fill", color: "red", placement: "above" } }],
      ["Elijah", { symbol: { glyph: "t:E", color: "blue", placement: "over" } }],
      ["but", { symbol: { glyph: "p:angle", color: "red", placement: "before" } }],
    ],
  },
  {
    title: "Modifier",
    body: "A slash for “not”, a strike, an X, or arrows at both ends.",
    examples: [
      ["unholy", { wash: "yellow", outline: { shape: "bubble", color: "purple" }, modifiers: [{ kind: "slash", color: "purple" }] }],
      ["desolate", { modifiers: [{ kind: "strike", color: "red" }] }],
      ["dedicate", { modifiers: [{ kind: "arrowsUp", color: "purple" }] }],
    ],
  },
];

const MarkAnatomy = () => (
  <div className="flex flex-col gap-8">
    <p className="max-w-2xl text-ink-muted">
      Every mark is a recipe of up to five pencil strokes, combined freely. That's how the 352 key words in the library
      are drawn, and it's what custom marks will be built from later.
    </p>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {ANATOMY.map((part) => (
        <Surface key={part.title} className="flex flex-col gap-3 p-4">
          <div>
            <h3 className="font-display text-lg font-medium">{part.title}</h3>
            <p className="text-xs leading-snug text-ink-muted">{part.body}</p>
          </div>
          <div className="flex flex-col gap-1">
            {part.examples.map(([text, recipe]) => (
              <KeyWordSample key={text} recipe={recipe} text={text} className="text-lg" />
            ))}
          </div>
        </Surface>
      ))}
    </div>
    <div className="flex flex-col gap-2">
      <h3 className="font-display text-lg font-medium">Pencils</h3>
      <div className="flex flex-wrap gap-2">
        {PENCIL_COLORS.map((color) => (
          <div key={color} className="flex items-center gap-2 rounded-md border border-rule bg-paper-raised py-1 pl-1 pr-2.5">
            <span className="grid size-7 place-items-center rounded-sm" style={{ background: `var(--pencil-${color}-wash)` }}>
              <span className="size-3 rounded-full" style={{ background: `var(--pencil-${color})` }} />
            </span>
            <span className="font-ui text-sm font-semibold capitalize">{color}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SOURCES: Array<KeyWordSource | "all"> = ["all", "precept", "kkd", "general"];

/** Every key word in the library, for checking against the printed A–Z sheets. */
const LibrarySheet = () => {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<KeyWordSource | "all">("all");
  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...KEY_WORDS]
      .filter((kw) => source === "all" || kw.source === source)
      .filter((kw) => !q || [kw.label, kw.note ?? "", ...kw.aliases].some((n) => n.toLowerCase().includes(q)))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  }, [query, source]);

  return (
    <div className="flex flex-col gap-5">
      <p className="max-w-2xl text-ink-muted">
        Transcribed from Kari King Dent's A–Z key word symbol sheets (karikingdent.com), with the words Precept Ministries
        International suggests marked as Precept. Words in brackets share the same mark. Compare against the printed sheets
        and note anything that looks off.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Segmented<KeyWordSource | "all">
          label="Source"
          value={source}
          onChange={setSource}
          options={SOURCES.map((s) => ({ value: s, label: s === "all" ? `All ${KEY_WORDS.length}` : SOURCE_LABEL[s] }))}
        />
        <TextInput
          id="library-search"
          aria-label="Search the library"
          placeholder="Search key words…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-8 w-56 text-sm"
        />
        <span className="font-ui text-sm tabular-nums text-ink-faint">{entries.length} shown</span>
      </div>
      <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((kw) => (
          <li key={kw.id} className="flex min-w-0 items-baseline gap-2 border-b border-rule py-1">
            <KeyWordSample recipe={kw.recipe} text={kw.label} className="shrink-0 text-base" />
            <span className="min-w-0 flex-1 truncate font-ui text-xs text-ink-muted" title={keyWordName(kw)}>
              {[kw.note, kw.aliases.length ? `(${kw.aliases.join(", ")})` : ""].filter(Boolean).join(" ")}
            </span>
            {kw.source === "precept" ? <Badge tone="gilt">Precept</Badge> : null}
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ── Components ───────────────────────────────────────────────────────── */

const Demo = ({ title, note, children, wide }: { title: string; note?: string; children: ReactNode; wide?: boolean }) => (
  <div className={wide ? "min-w-0 md:col-span-2" : "min-w-0"}>
    <div className="mb-3">
      <h3 className="font-display text-lg font-medium">{title}</h3>
      {note ? <p className="text-sm text-ink-muted">{note}</p> : null}
    </div>
    <div className="flex min-w-0 flex-wrap items-start gap-3 rounded-lg border border-dashed border-rule-strong p-5">{children}</div>
  </div>
);

const ComponentGallery = () => {
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(3);
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <Demo title="Buttons" note="One primary per view: the next step. Everything else is secondary or ghost.">
        <Button variant="primary" iconAfter="arrow-right">
          Continue
        </Button>
        <Button variant="secondary" icon="plus-lg">
          New study
        </Button>
        <Button variant="ghost" icon="arrow-left">
          Back
        </Button>
        <Button variant="danger" icon="trash3">
          Delete
        </Button>
        <Button variant="primary" disabled>
          Loading…
        </Button>
        <div className="flex gap-1">
          <IconButton icon="layout-sidebar" label="Toggle sidebar" variant="secondary" />
          <IconButton icon="search" label="Search studies" />
          <IconButton icon="three-dots" label="More" />
        </div>
      </Demo>

      <Demo title="Fields" note="Inputs sit on overlay paper. Long-form notes use the reading face.">
        <div className="flex w-full flex-col gap-4">
          <Field id="demo-passage" label="Passage" hint="A book and chapter, like John 3 or Romans 8:1–11.">
            <div className="flex gap-2">
              <TextInput id="demo-passage" defaultValue="John 3:16–21" />
              <Button variant="primary">Open</Button>
            </div>
          </Field>
          <Field id="demo-bad" label="Passage" error="Only one chapter at a time. Try Romans 8 instead of Romans 8–9.">
            <TextInput id="demo-bad" defaultValue="Romans 8–9" aria-invalid="true" aria-describedby="demo-bad-error" />
          </Field>
          <Field id="demo-prayer" label="Opening prayer" optional>
            <TextArea id="demo-prayer" placeholder="Lord, open my eyes to see…" className="min-h-20" />
          </Field>
        </div>
      </Demo>

      <Demo title="Stage path" note="Gilt for done, ribbon for current, an amber dot when the guide is out of date." wide>
        <StageStepper current={stage} completed={2} stale={[5]} onSelect={setStage} />
      </Demo>

      <Demo title="Badges">
        <Badge>NASB 2020</Badge>
        <Badge tone="accent" icon="bookmark-fill">
          Current
        </Badge>
        <Badge tone="gilt" icon="feather">
          Guide ready
        </Badge>
        <Badge tone="success" icon="check2">
          Saved
        </Badge>
        <Badge tone="warn" icon="hourglass-split">
          Out of date
        </Badge>
        <Badge tone="danger" icon="wifi-off">
          Offline
        </Badge>
      </Demo>

      <Demo title="Study history">
        <div className="w-full max-w-xs rounded-md bg-paper-sunken p-2">
          {SAMPLE_SESSIONS.slice(0, 3).map((s, i) => (
            <SessionItem key={s.title} {...s} active={i === 0} />
          ))}
        </div>
      </Demo>

      <Demo title="Banners" wide>
        <div className="flex w-full flex-col gap-2">
          <Banner tone="warn" title="Stages 4–6 are out of date" action={<Button size="sm">Refresh now</Button>}>
            You changed your marks. The guide will refresh each stage when you get there.
          </Banner>
          <Banner tone="info">Precepts studies work best one chapter at a time. Your range was trimmed to John 3.</Banner>
          <Banner tone="danger" title="Couldn't load the passage">
            YouVersion didn't respond. Check your connection and try again.
          </Banner>
        </div>
      </Demo>

      <Demo title="Marking toolbar" note="Opens over a selection. Shown for “believes”: suggestions first, search below, recent and by-meaning marks at the bottom." wide>
        <div className="relative h-[27rem] w-full">
          <MarkingToolbar
            text={JOHN_3_16_18}
            selection={{ start: JOHN_3_16_18.indexOf("believes"), end: JOHN_3_16_18.indexOf("believes") + 8 }}
            recent={[KEY_WORD_BY_ID.god, KEY_WORD_BY_ID.world]}
            existing={[]}
            countFor={() => 2}
            onApply={() => undefined}
            onMarkAll={() => undefined}
            onRemove={() => undefined}
            onClose={() => undefined}
            style={{ top: 0, left: 0 }}
          />
        </div>
      </Demo>

      <Demo title="Study guide" note="Ready, then out of date. It asks questions; it doesn't give answers.">
        <div className="flex w-full flex-col gap-4">
          <GuidanceCard questions={SAMPLE_QUESTIONS.slice(0, 2)} />
          <GuidanceCard status="stale" questions={SAMPLE_QUESTIONS.slice(2)} />
        </div>
      </Demo>

      <Demo title="Surfaces & dividers" note="Raise only what should stand apart. Never nest raised in raised.">
        <div className="flex w-full flex-col gap-4">
          <Surface>
            <p className="font-ui text-sm font-semibold">Raised</p>
            <p className="text-sm text-ink-muted">The passage, popovers, the stage panel.</p>
          </Surface>
          <Surface tone="sunken">
            <p className="font-ui text-sm font-semibold">Sunken</p>
            <p className="text-sm text-ink-muted">The sidebar and inset wells.</p>
          </Surface>
          <Rule ornament />
        </div>
      </Demo>
    </div>
  );
};

/* ── Principles ───────────────────────────────────────────────────────── */

const Principles = () => (
  <div className="grid gap-6 md:grid-cols-3">
    {[
      ["The text comes first", "Scripture gets the biggest type, the widest column and the best paper. Tools stay in the margins until you need them."],
      ["One next step", "Each screen has a single ribbon-coloured action. Going back is always allowed but never shouts."],
      ["Questions, not answers", "The study guide's gilt notes ask what the text says. They're styled as margin notes, not as an authority."],
    ].map(([title, body]) => (
      <div key={title} className="flex flex-col gap-2 border-t-2 border-gilt pt-4">
        <h3 className="font-display text-lg font-medium">{title}</h3>
        <p className="text-ink-muted">{body}</p>
      </div>
    ))}
  </div>
);
