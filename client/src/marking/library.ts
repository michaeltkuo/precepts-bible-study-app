import { recipe, type MarkRecipe } from "./recipe";

/**
 * Where a key word's mark comes from:
 * - precept: suggested by Precept Ministries International (asterisked in the A–Z sheet)
 * - kkd: Kari King Dent's A–Z key word symbol sheets (karikingdent.com)
 * - general: inductive-study marks not on either list
 * - custom: made by the user (coming later)
 */
export type KeyWordSource = "precept" | "kkd" | "general" | "custom";

export type KeyWord = {
  id: string;
  /** Display name, and the main form matched in the text. */
  label: string;
  /** Tells apart marks that share a word, e.g. "of God" vs "of Satan". */
  note?: string;
  /** Other words marked the same way; shown and matched. */
  aliases: string[];
  /** Extra match-only forms such as irregular inflections. */
  forms: string[];
  /** Match capitalisation exactly ("God" vs "god", "Law" vs "law"). */
  caseSensitive: boolean;
  /** False for marks applied by meaning rather than by word, like places. */
  matchable: boolean;
  source: KeyWordSource;
  recipe: MarkRecipe;
};

type Options = {
  note?: string;
  aka?: string[];
  forms?: string[];
  cs?: boolean;
  core?: boolean;
  general?: boolean;
  byMeaning?: boolean;
};

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const k = (label: string, short: Parameters<typeof recipe>[0], opts: Options = {}): KeyWord => ({
  id: slug(opts.note ? `${label} ${opts.note}` : label),
  label,
  note: opts.note,
  aliases: opts.aka ?? [],
  forms: opts.forms ?? [],
  caseSensitive: Boolean(opts.cs),
  matchable: !opts.byMeaning,
  source: opts.core ? "precept" : opts.general ? "general" : "kkd",
  recipe: recipe(short),
});

type Short = Parameters<typeof recipe>[0];

/* Repeated recipes, named for readability. */
const WORD_OF_THE_LORD: Short = { w: "green", o: ["box", "red"] };
const DEVIL: Short = { s: ["p:pitchfork", "red"] };
const SLAY: Short = { s: ["t:Ʒ", "red"] };
const UP: Short = { s: ["bi:arrow-up", "red"] };
const BUILD: Short = { o: ["box", "brown"], u: ["zigzag", "brown"] };
const MONEY: Short = { s: ["bi:currency-dollar", "forest"] };
const OFFERING: Short = { s: ["bi:currency-dollar", "purple"] };
const WAVES: Short = { u: ["wavy", "blue"] };
const SUFFERING: Short = { m: [["slash", "red"]] };
const PROPHET_OF_GOD: Short = { s: ["bi:megaphone-fill", "forest", "over"] };


export const KEY_WORDS: KeyWord[] = [
  /* ── A–B ─────────────────────────────────────────────────────────── */
  k("abide", { s: ["bi:house", "blue"] }),
  k("abomination of desolation", { u: ["single", "red"], m: [["cross", "black"]] }),
  k("according to", { w: "green" }),
  k("according to its kind", { u: ["scallop", "brown"] }, { aka: ["after their kind"] }),
  k("according to the word of the Lord", WORD_OF_THE_LORD),
  k("act unfaithfully", { w: "green", o: ["box", "blue"], m: [["slash", "purple"]] }),
  k("Adam", { s: ["t:A", "purple"] }, { aka: ["first man"], cs: true }),
  k("advice", { w: "yellow", o: ["oval", "blue"] }, { aka: ["counsel"] }),
  k("afraid", { m: [["slash", "orange"]] }, { aka: ["fear"], forms: ["fearful", "feared"] }),
  k("all", { w: "red", o: ["oval", "red"] }),
  k("all flesh", { w: "yellow", o: ["oval", "brown"] }),
  k("allied", { s: ["bi:link-45deg", "red"] }),
  k("altar", { w: "orange", o: ["brackets", "brown"] }),
  k("ambush", { w: "pink", o: ["jagged", "brown"] }),
  k("and it was so", { o: ["slant", "red"] }),
  k("angel", { s: ["p:angel", "yellow"] }, { note: "of God", aka: ["Gabriel"] }),
  k("angel", { s: ["p:angel", "black"] }, { note: "of Satan" }),
  k("angel of the Lord", { s: ["p:angel", "purple", "over", "yellow"] }, { aka: ["man of God"] }),
  k("anger", { s: ["bi:emoji-angry-fill", "red", "above"] }, { forms: ["angry", "angered"] }),
  k("anointed", { o: ["box", "orange"] }, { aka: ["Lord's anointed"] }),
  k("antichrists", { o: ["cloud", "black"] }, { forms: ["antichrist"] }),
  k("appointed", { w: "purple", o: ["cloud", "orange"] }),
  k("arise", UP, { aka: ["rise", "raise", "resurrection"], forms: ["arose", "risen", "raised", "rose"] }),
  k("ark", { w: "sky", o: ["bowl", "black"] }, { note: "Noah's" }),
  k("ark of the covenant", { w: "yellow", o: ["box", "brown"] }, { aka: ["ark of the Lord"] }),
  k("armies of the living God", { w: "yellow", o: ["box", "blue"] }),
  k("Asaph", { s: ["t:A", "pink"] }, { note: "in Nehemiah", cs: true }),
  k("ash", { w: "gray", o: ["cloud", "black"] }, { forms: ["ashes"] }),
  k("Assyria", { w: "green" }, { cs: true, forms: ["Assyrians"] }),
  k("atonement", { w: "orange", o: ["arch", "red"] }, { aka: ["propitiation"], core: true }),
  k("author", { o: ["oval", "blue"] }, { note: "of a book or epistle" }),
  k("authority", { s: ["bi:magic", "blue"] }, { aka: ["dominion"] }),
  k("avenge", { u: ["zigzag", "red"], s: ["t:•", "red", "above"] }),
  k("avenger", { o: ["slant", "red"], s: ["t:•", "red", "above"] }, { aka: ["avenger of blood"] }),
  k("Babylon", { w: "purple", u: ["single", "forest"] }, { aka: ["Chaldea"], cs: true }),
  k("banquet", { o: ["table", "brown"] }),
  k("baptism", { s: ["bi:water", "sky", "above"] }, { aka: ["baptize"], forms: ["baptized", "baptizing"] }),
  k("be strong and courageous", { w: "sky", o: ["cloud", "red"] }, { aka: ["strong and courageous"] }),
  k("beast", { s: ["p:beast", "red"] }, { note: "1st beast of Rev. 13", aka: ["little horn"] }),
  k("beast", { s: ["p:beast", "black"] }, { note: "2nd beast of Rev. 13", aka: ["false prophet"] }),
  k("believe", { w: "green", o: ["banner", "blue"] }, { aka: ["faith", "truth"], forms: ["belief", "true"], core: true }),
  k("besiege", { o: ["castle", "black"] }, { aka: ["siege"] }),
  k("birthright", { w: "red", o: ["banner", "brown"] }),
  k("blaspheme", { w: "gray", o: ["cloud", "orange"] }, { aka: ["blasphemy", "boastful words"] }),
  k("bless", { w: "pink", o: ["cloud", "blue"] }, { forms: ["blessed", "blessing", "blessings"], core: true }),
  k("blood", { s: ["bi:droplet-fill", "red", "above"] }, { core: true }),
  k("Boaz", { s: ["t:B", "blue"] }, { cs: true }),
  k("body", { s: ["p:person", "brown"] }),
  k("bondwoman", { w: "gray", o: ["box", "black"] }),
  k("born of God", { w: "yellow", s: ["t:b", "green"] }, { aka: ["children of God", "sons of God"] }),
  k("bought", { w: "yellow", o: ["bubble", "red"] }),
  k("bow", { s: ["bi:arrow-down-circle", "purple", "above"] }, { aka: ["humble"], forms: ["bowed"] }),
  k("bowls", { w: "purple", o: ["bowl", "blue"] }, { aka: ["plague"] }),
  k("bread", { s: ["p:bread", "brown"] }),
  k("build", BUILD, { aka: ["carried out repairs", "made repairs", "rebuild", "repair"], forms: ["built"] }),
  k("burnt offering", { w: "orange", o: ["box", "red"] }),
  k("but", { s: ["p:angle", "red", "before"] }, { aka: ["yet", "however"] }),

  /* ── C–D ─────────────────────────────────────────────────────────── */
  k("Caesar", { o: ["oval", "green"] }, { cs: true }),
  k("calamity", { s: ["bi:tornado", "red"] }),
  k("call", { w: "pink", s: ["p:vase", "purple", "over", "pink"] }, { note: "to God in prayer" }),
  k("captive", { s: ["bi:link-45deg", "brown"] }, { aka: ["captivity"] }),
  k("Chaldean", { w: "purple" }, { aka: ["Babylonian"], cs: true }),
  k("choose", { o: ["oval", "purple"] }, { forms: ["chose", "chosen"] }),
  k("church", { s: ["bi:house-fill", "green"] }),
  k("circumcise", { m: [["strike", "red"]] }, { forms: ["circumcised", "circumcision"], core: true }),
  k("city of refuge", { w: "green", o: ["box", "yellow"] }),
  k("cleanse", { w: "purple", o: ["cloud", "blue"] }, { aka: ["purification", "purify"] }),
  k("close relative", { w: "yellow", o: ["oval", "red"] }, { aka: ["closest relative"] }),
  k("cloud", { w: "yellow", o: ["banner", "orange"] }, { aka: ["glory", "glorify", "glory of the Lord"] }),
  k("the coming of the Lord", { w: ["sky", "yellow"], o: ["cloud", "blue"] }, { aka: ["coming of the Lord"], core: true }),
  k("command", { w: "yellow", o: ["box", "red"] }, { aka: ["commandment"] }),
  k("compassion", { s: ["bi:heart-fill", "blue"] }),
  k("conjure", { w: "yellow", u: ["zigzag", "black"] }),
  k("consecrate", { w: "sky", o: ["cloud", "purple"] }),
  k("consider", { w: "pink", o: ["cloud", "purple"] }),
  k("contribution", OFFERING),
  k("covenant", { w: "red", o: ["box", "yellow"] }, { aka: ["agreement", "oath", "sworn"], core: true }),
  k("create", { s: ["p:circle", "blue", "over", "yellow"] }, { aka: ["creation"], forms: ["created"] }),
  k("credited", { w: "sky", o: ["arch", "purple"] }, { aka: ["reckoned"] }),
  k("cross over", { o: ["arch", "blue"], s: ["bi:caret-right-fill", "blue", "after"] }, { aka: ["crossed"] }),
  k("crown", { s: ["p:crown", "orange", "over", "yellow"] }),
  k("cry", { s: ["t:C", "red"] }, { forms: ["cried", "cries"], core: true }),
  k("curse", { w: "brown", o: ["cloud", "red"] }, { forms: ["cursed"], core: true }),
  k("custom", { w: "sky", u: ["single", "blue"] }, { aka: ["customs"] }),
  k("David", { w: "sky" }, { cs: true }),
  k("day of the Lord", { w: "pink", o: ["box", "red"] }, { aka: ["day of the Lord's anger"], core: true }),
  k("death", { s: ["p:tomb", "black", "above"] }, { aka: ["die"], forms: ["died", "dead", "dies"] }),
  k("declares the Lord", WORD_OF_THE_LORD),
  k("decree", { s: ["p:pennant", "purple", "over", "purple"] }, { aka: ["edict"] }),
  k("dedicate", { m: [["arrowsUp", "purple"]] }, { forms: ["dedicated"] }),
  k("defile", { s: ["t:Ʒ", "black"] }, { forms: ["defiled"] }),
  k("deliver", { s: ["bi:arrow-up-right", "orange", "above"] }, { aka: ["deliverance", "deliverer"] }),
  k("descendants", { w: "gray", o: ["oval", "blue"] }, { aka: ["seed"] }),
  k("desolate", { m: [["strike", "red"]] }, { aka: ["desolation"] }),
  k("destroy", { s: ["t:Ʒ", "purple"] }, { aka: ["destruction"], forms: ["destroyed"] }),
  k("devil", DEVIL, { aka: ["Satan", "dragon", "serpent", "evil one"] }),
  k("did evil in the sight of the Lord", { o: ["cloud", "black"] }),
  k("did not drive them out", { o: ["box", "blue"], m: [["slash", "blue"]] }),
  k("did not return", { w: "pink", s: ["bi:arrow-return-left", "black", "after"], m: [["slash", "black"]] }),
  k("did not take possession", { w: "green", o: ["cloud", "green"], m: [["slash", "blue"]] }),
  k("did right in the sight of the Lord", { o: ["oval", "yellow"] }),
  k("discern", { o: ["slant", "yellow"] }, { aka: ["discernment"] }),
  k("disciple", { u: ["single", "red"], s: ["bi:arrow-right", "red", "after"] }, { forms: ["disciples"] }),
  k("doctrine", { w: "green", o: ["banner", "red"] }),
  k("does not know", { w: "yellow", m: [["slash", "blue"]] }),
  k("dream", { w: "sky", o: ["cloud", "blue"] }, { aka: ["vision"] }),
  k("dry land", { w: "gray", u: ["single", "green"] }),

  /* ── E–G ─────────────────────────────────────────────────────────── */
  k("earth", { s: ["bi:globe-americas", "green"] }),
  k("eat", { w: "brown" }, { aka: ["food"], forms: ["ate", "eaten"] }),
  k("Edom", { w: "red", o: ["oval", "red"] }, { cs: true }),
  k("Egypt", { w: "orange", u: ["single", "green"] }, { cs: true, forms: ["Egyptians"] }),
  k("Elijah", { s: ["t:E", "blue"] }, { cs: true }),
  k("encourage", { o: ["oval", "pink"] }, { aka: ["exhort"] }),
  k("end of the age", { w: "pink", s: ["p:clock", "green"] }, { aka: ["end of time", "end time", "time of the end"] }),
  k("enemy", { m: [["cross", "red"]] }, { forms: ["enemies"] }),
  k("ephod", { w: "blue", o: ["box", "purple"] }),
  k("Ephraim", { w: "yellow", s: ["t:E", "blue"] }, { cs: true }),
  k("Esau", { w: "red", o: ["oval", "red"] }, { cs: true }),
  k("establish", { u: ["double", "purple"] }, { forms: ["established"] }),
  k("eternal life", { w: "sky", o: ["box", "green"] }, { core: true }),
  k("evil", { o: ["cloud", "black"] }, { aka: ["wicked", "wickedness"] }),
  k("evil spirit", { w: "pink", o: ["jagged", "black"] }),
  k("example", { o: ["dashed", "blue"] }, { aka: ["pattern", "plan"] }),
  k("exile", { w: "sky", o: ["arrow", "green"] }),
  k("expanse", { u: ["wavy", "sky"] }, { aka: ["heavens"] }),
  k("exterminated", SLAY, { aka: ["kill", "slay", "slew"], forms: ["killed"] }),
  k("false prophet", PROPHET_OF_GOD, { note: "not a prophet of God" }),
  k("famine", { w: "gray", o: ["box", "black"] }),
  k("fast", { s: ["bi:slash-circle", "red"] }, { aka: ["fasting"] }),
  k("favor", { w: "yellow", o: ["bubble", "yellow"] }),
  k("feast", { o: ["table", "brown"] }),
  k("fellowship", { w: "yellow", o: ["cloud", "green"] }),
  k("fire", { s: ["bi:fire", "red"] }, { aka: ["furnace"] }),
  k("firstborn", { w: "red", o: ["box", "red"], s: ["t:1", "red", "above"] }),
  k("flesh", { w: "yellow", u: ["single", "brown"] }, { aka: ["fleshly"] }),
  k("follow", { u: ["single", "red"], s: ["bi:arrow-right", "red", "after"] }, { forms: ["followed"] }),
  k("forgive", { o: ["arch", "red"], s: ["p:cross", "brown", "above"] }, { forms: ["forgiven", "forgiveness"] }),
  k("free", { s: ["bi:link-45deg", "green"] }, { aka: ["released"] }),
  k("free woman", { w: "green", o: ["box", "blue"] }),
  k("gate", { s: ["bi:door-closed-fill", "brown"] }, { aka: ["gatekeepers"] }),
  k("Gentiles", { w: "sky", s: ["t:G", "blue"] }, { cs: true }),
  k("geographical locations", { u: ["double", "green"] }, { core: true, byMeaning: true }),
  k("gift", { s: ["bi:gift-fill", "purple"] }, { aka: ["present"] }),
  k("give thanks", { u: ["single", "orange"], s: ["p:post", "orange", "ends", "orange"] }, { aka: ["thanksgiving"] }),
  k("goat", { w: "sky" }, { note: "of Daniel 8" }),
  k("god", { s: ["p:idol", "orange", "over", "yellow"] }, { note: "false god", aka: ["idol", "image"], cs: true, forms: ["gods"] }),
  k("God", { s: ["p:triangle", "purple", "over", "yellow"] }, { cs: true, core: true }),
  k("God saw it was good", { u: ["wavy", "pink"] }),
  k("Goliath", { w: "green", s: ["t:P", "purple"] }, { cs: true }),
  k("gospel", { s: ["bi:megaphone-fill", "red"] }, { core: true }),
  k("grace", { w: "sky", o: ["box", "yellow"] }, { core: true }),
  k("Greece", { w: "sky", u: ["double", "green"] }, { cs: true }),

  /* ── H–K ─────────────────────────────────────────────────────────── */
  k("harlot", { s: ["t:H", "red"] }, { aka: ["harlotry"] }),
  k("hate", { s: ["bi:heart", "red"], m: [["slash", "black"]] }, { forms: ["hated", "hatred"] }),
  k("hear", { s: ["bi:ear", "green"] }, { aka: ["listen"], forms: ["heard"] }),
  k("heart", { s: ["bi:heart", "red"] }),
  k("Hebrew", { w: "sky", o: ["box", "blue"] }, { cs: true, forms: ["Hebrews"] }),
  k("high places", { s: ["p:peak", "purple"] }),
  k("highly esteemed", { w: "yellow", o: ["oval", "sky"] }, { aka: ["man of high esteem"] }),
  k("His lovingkindness is everlasting", { u: ["single", "red"], s: ["bi:heart-fill", "pink"] }),
  k("holy", { w: "yellow", o: ["bubble", "purple"] }, { core: true }),
  k("holy city", { w: "sky", u: ["single", "green"], s: ["t:T", "green"] }, { aka: ["Jerusalem"] }),
  k("Holy Spirit", { w: "yellow", o: ["cloud", "purple"] }, { aka: ["Spirit"], cs: true, core: true }),
  k("hope", { s: ["p:anchor", "purple"] }),
  k("house", { s: ["bi:house", "black"] }),
  k("house", { s: ["bi:house-fill", "purple"] }, { note: "of God", aka: ["temple"] }),
  k("husband", { s: ["bi:gender-male", "blue"] }, { aka: ["man"] }),
  k("I am not writing", { w: "sky", o: ["box", "blue"], m: [["slash", "purple"]] }),
  k("I am writing", { w: "sky", o: ["box", "blue"] }, { aka: ["these things I have written"] }),
  k("if", { o: ["box", "red"] }),
  k("in the heavenly places", { w: "sky", o: ["cloud", "blue"] }),
  k("in the name of Jesus Christ", { u: ["single", "red"] }),
  k("inherit", { w: "pink", o: ["banner", "purple"] }, { aka: ["inheritance", "portion"] }),
  k("iniquity", { s: ["bi:slash-circle", "black"] }, { aka: ["sin"], forms: ["sins", "sinned", "iniquities"] }),
  k("injunction", { s: ["p:pennant", "purple"] }),
  k("inquired of the Lord", { w: "pink", o: ["oval", "purple"] }),
  k("inscription", { w: "red" }),
  k("interpret", { o: ["box", "blue"] }, { aka: ["interpretation"] }),
  k("Israel", { w: "yellow" }, { note: "northern kingdom", cs: true, aka: ["king of Israel"] }),
  k("Israel", { s: ["p:star6", "blue"] }, { note: "the man, nation, people", cs: true, core: true }),
  k("Jesus Christ", { w: "yellow", s: ["p:cross", "purple"] }, { aka: ["Jesus", "Christ"], cs: true, core: true }),
  k("Jew", { s: ["p:star6", "sky"] }, { cs: true, forms: ["Jews"] }),
  k("Jordan River", WAVES, { cs: true, aka: ["Jordan"] }),
  k("Joseph", { w: "orange", o: ["oval", "blue"] }, { cs: true }),
  k("Judah", { w: "sky" }, { note: "southern kingdom", cs: true, aka: ["king of Judah"] }),
  k("judge", { o: ["box", "brown"] }, { aka: ["judgment"], forms: ["judged", "judges"] }),
  k("just", { o: ["brackets", "purple"] }, { aka: ["justice", "justification", "justify"], forms: ["justified"] }),
  k("kept", { s: ["bi:lock", "black"] }),
  k("king of Assyria", { w: "green" }),
  k("king of Babylon", { w: "purple" }),
  k("king of Egypt", { w: "orange" }),
  k("king of Persia", { w: "pink" }),
  k("king of the North", { u: ["dotted", "green"] }, { note: "Daniel 11" }),
  k("king of the South", { u: ["dotted", "orange"] }, { note: "Daniel 11" }),
  k("kingdom", { s: ["p:crown", "blue", "over", "purple"] }, { core: true }),
  k("kinsman", { w: "orange", o: ["oval", "red"] }, { aka: ["kinsman redeemer"] }),
  k("know", { w: "yellow", o: ["box", "orange"] }, { aka: ["knowledge"], forms: ["knew", "known"] }),

  /* ── L–O ─────────────────────────────────────────────────────────── */
  k("lamb", { o: ["cloud", "blue"] }),
  k("land", { w: "sky", u: ["double", "green"] }, { note: "Israel's land", core: true }),
  k("last days", { w: "pink", s: ["p:clock", "green"] }, { aka: ["latter days"] }),
  k("Law", { w: "yellow", s: ["bi:book", "black"] }, { note: "of God", cs: true }),
  k("law", { s: ["bi:book", "black"] }, { note: "of man", cs: true, core: true }),
  k("let us", { w: "sky" }),
  k("Levites", { w: "orange", o: ["box", "blue"] }, { cs: true }),
  k("life", { o: ["canopy", "green"] }, { aka: ["living", "alive"] }),
  k("light", { s: ["bi:lightbulb-fill", "yellow"] }),
  k("Lord has fulfilled His word", { o: ["cloud", "purple"] }),
  k("Lord has spoken", WORD_OF_THE_LORD, { aka: ["word of the Lord", "thus says the Lord"] }),
  k("Lord raised up judges", { o: ["box", "brown"], m: [["arrowsUp", "brown"]] }),
  k("lot", { o: ["box", "black"] }),
  k("love", { s: ["bi:heart-fill", "red"] }, { forms: ["loved", "loves"] }),
  k("lovingkindness", { s: ["bi:heart-fill", "purple"] }, { aka: ["mercy"] }),
  k("magician", { w: "yellow", u: ["zigzag", "purple"] }, { forms: ["magicians"] }),
  k("man dressed in linen", { w: "yellow", o: ["box", "orange"] }, { note: "Daniel 12" }),
  k("manna", { w: "yellow", o: ["bowl", "brown"] }),
  k("manslayer", { w: "pink", o: ["arrow", "brown"], m: [["slash", "black"]] }),
  k("mantle", { s: ["p:garment", "brown"] }),
  k("mark of the beast", { s: ["t:666", "black", "above"] }),
  k("member", { o: ["oval", "brown"] }),
  k("men of the council", { u: ["zigzag", "orange"] }),
  k("mighty men of valor", { w: "purple", o: ["box", "red"] }),
  k("mockers", { s: ["t:••", "red", "above"], m: [["slash", "red"]] }),
  k("money", MONEY, { aka: ["wages", "price", "rich", "riches"] }),
  k("Moses", { s: ["t:M", "blue"] }, { cs: true }),
  k("mountain", { s: ["p:mountain", "brown"] }),
  k("mouth", { o: ["oval", "red"] }),
  k("mystery", { s: ["bi:question-lg", "green"] }),
  k("nakedness", { s: ["p:garment", "black"], m: [["slash", "black"]] }),
  k("nations", { w: "green" }, { core: true }),
  k("Nazirite", { s: ["t:N", "blue"] }, { cs: true }),
  k("Nineveh", { w: "green", s: ["t:N", "forest"] }, { cs: true }),
  k("obedience", { s: ["t:V", "pink"] }, { aka: ["obedient", "obey"], forms: ["obeyed"] }),
  k("offering", OFFERING, { aka: ["tithe"] }),
  k("oppress", { m: [["slash", "red"]] }, { forms: ["oppressed", "oppression"] }),
  k("overcome", { s: ["bi:check-lg", "blue"] }, { aka: ["overcomer"] }),

  /* ── P–R ─────────────────────────────────────────────────────────── */
  k("Passover", { o: ["table", "red"] }, { cs: true }),
  k("peace", { s: ["p:circleCross", "red", "over", "sky"] }),
  k("perish", { s: ["t:Ʒ", "purple"] }),
  k("persecute", SUFFERING, { aka: ["persecution"] }),
  k("Persia", { w: "pink" }, { cs: true }),
  k("pestilence", { m: [["cross", "brown"]] }),
  k("Philistines", { s: ["t:P", "green"] }, { cs: true }),
  k("poor", { s: ["t:¢", "green"] }),
  k("possess", { w: "green", o: ["cloud", "green"] }, { aka: ["possession"] }),
  k("power", { w: "red", o: ["box", "black"], s: ["bi:lightning-fill", "black", "after"] }),
  k("practice", { w: "gray", o: ["box", "blue"] }),
  k("praise", { w: "sky", o: ["bowl", "blue"] }),
  k("pray", { w: "pink", s: ["p:vase", "purple", "over", "pink"] }, { aka: ["prayer", "supplication"], core: true }),
  k("precepts", { s: ["p:tablets", "purple", "over", "yellow"] }),
  k("presenting", { s: ["p:triangleDown", "black", "over", "yellow"] }),
  k("pride", { s: ["bi:person-arms-up", "black"] }),
  k("priest", { w: "orange", o: ["cloud", "blue"] }, { aka: ["priesthood"] }),
  k("proclaim", { s: ["bi:megaphone", "green"] }, { aka: ["proclamation"] }),
  k("promise", { w: "purple", o: ["box", "yellow"] }),
  k("prophesy", { s: ["bi:megaphone", "forest"] }),
  k("prophet", PROPHET_OF_GOD, { note: "false", aka: ["seer"] }),
  k("prophet", { s: ["bi:megaphone-fill", "yellow"] }, { note: "God's", aka: ["seer"] }),
  k("provoked God to anger", { u: ["wavy", "red"], s: ["bi:emoji-angry-fill", "red", "above"] }),
  k("ram", { w: "brown" }, { note: "of Daniel 8" }),
  k("recipient", { o: ["oval", "orange"] }, { note: "of a letter or epistle" }),
  k("reconcile", { u: ["single", "blue"], s: ["bi:arrow-left-right", "blue", "above"] }, { forms: ["reconciled", "reconciliation"] }),
  k("redeem", { w: "yellow", o: ["bubble", "red"] }, { aka: ["redemption", "redeemed"], core: true }),
  k("redeemer", { w: "yellow", o: ["oval", "red"] }),
  k("references to time", { s: ["p:clock", "green"] }, {
    core: true,
    aka: ["then", "when", "after", "until", "day", "night", "morning", "evening", "hour", "today", "now"],
  }),
  k("refuge", { s: ["p:idol", "red", "over", "yellow"] }),
  k("relent", { s: ["p:triangleDown", "red"] }, { aka: ["yield"] }),
  k("remnant", { o: ["slant", "blue"] }, { core: true }),
  k("repent", { w: "yellow", s: ["bi:arrow-return-left", "red", "after"] }, { forms: ["repentance", "repented"], core: true }),
  k("rest", { w: "sky", o: ["brackets", "blue"] }),
  k("return", { w: "pink", s: ["bi:arrow-return-left", "brown", "after"] }, { aka: ["return to the Lord"] }),
  k("righteous", { w: "sky", s: ["t:R", "blue"] }, { aka: ["righteousness"], core: true }),
  k("Ruth", { s: ["t:R", "pink"] }, { cs: true }),

  /* ── S–T ─────────────────────────────────────────────────────────── */
  k("sackcloth", { w: "gray", o: ["cloud", "black"] }),
  k("sacrifice", { w: "orange", o: ["oval", "red"] }),
  k("saints", { s: ["p:person", "purple", "over", "sky"] }),
  k("salvation", { w: "green", o: ["arch", "blue"], s: ["p:cross", "red", "above"] }, { forms: ["saved", "save"] }),
  k("Samaria", { w: "yellow", u: ["single", "green"], s: ["t:S", "pink"] }, { cs: true }),
  k("scroll", { s: ["p:scroll", "red"] }),
  k("seas", WAVES, { aka: ["waters"] }),
  k("seek", { s: ["p:glasses", "black"] }, { aka: ["seek the Lord"], forms: ["sought"] }),
  k("serve", { o: ["bubble", "black"] }, { aka: ["service"] }),
  k("seventh day", { w: "purple", s: ["p:clock", "green"] }),
  k("shadow of Your wings", { w: "yellow", o: ["banner", "sky"] }, { aka: ["shelter of Your wings"] }),
  k("shield", { s: ["bi:shield-fill", "purple"] }),
  k("Shiloh", { o: ["roof", "sky"], u: ["double", "green"] }, { cs: true }),
  k("sign", { s: ["bi:octagon-fill", "orange"] }, { forms: ["signs"] }),
  k("singers", { s: ["bi:music-note", "blue"] }, { aka: ["song leaders"] }),
  k("slave", { s: ["bi:link-45deg", "black"] }, { aka: ["slavery"] }),
  k("Sodom", { u: ["double", "green"], s: ["t:Ʒ", "forest"] }, { cs: true }),
  k("son of man", { u: ["single", "blue"], s: ["t:S", "purple"] }),
  k("speak", { s: ["bi:chat", "red"] }, { forms: ["spoke", "spoken"] }),
  k("spear", { s: ["p:spear", "black"] }),
  k("stand", { w: "sky", o: ["brackets", "black"] }, { aka: ["stand firm"] }),
  k("statutes", { s: ["p:tablets", "brown", "over", "yellow"] }),
  k("stronghold", { o: ["brackets", "red"] }),
  k("success", { w: "green", o: ["oval", "green"] }, { aka: ["successful"] }),
  k("suffer", SUFFERING, { aka: ["sufferings"], forms: ["suffered", "suffering"], core: true }),
  k("sword", { s: ["p:sword", "black"] }),
  k("tabernacle", { w: "sky", o: ["roof", "blue"] }, { aka: ["tent", "tent of meeting", "tent of the Lord"] }),
  k("test", SUFFERING, { note: "trial (noun)", aka: ["trial", "tribulation"] }),
  k("test", { o: ["box", "red"], s: ["bi:check-lg", "red"] }, { note: "try (verb)", aka: ["try"], forms: ["tested"] }),
  k("testify", { w: "green", s: ["bi:arrow-up", "red", "after"] }, { aka: ["testimony"] }),
  k("the Way", { s: ["t:W", "green"] }, { cs: true, aka: ["Way"] }),
  k("then God said", { w: "yellow", o: ["oval", "green"] }),
  k("there was evening and morning", { w: "yellow" }),
  k("therefore", { s: ["t:∴", "red"] }),
  k("throne", { s: ["p:throne", "blue"] }),
  k("thrown down", { u: ["single", "black"], s: ["bi:arrow-down", "black", "after"] }),
  k("Thus the Lord God showed me", { w: "sky", o: ["box", "red"] }),
  k("tongue", { o: ["oval", "black"] }),
  k("tradition", { w: "orange", s: ["t:T", "black"] }),
  k("tree", { o: ["canopy", "green"] }),
  k("tree of knowledge of good and evil", { o: ["canopy", "black"] }),
  k("tree of life", { o: ["canopy", "green"], u: ["single", "brown"] }),
  k("trumpet", { s: ["bi:megaphone", "black"] }),
  k("trust", { w: "green", o: ["oval", "purple"] }, { forms: ["trusted"] }),
  k("tunic", { s: ["p:garment", "purple", "over", "orange"] }, { note: "Joseph's" }),

  /* ── U–Z ─────────────────────────────────────────────────────────── */
  k("uncircumcised", { m: [["strike", "red"], ["slash", "red"]] }),
  k("unclean", { w: "sky", o: ["cloud", "purple"] }),
  k("under the ban", { w: "purple", o: ["oval", "black"] }),
  k("understanding", { s: ["t:( )", "orange"] }, { aka: ["wisdom", "wise"] }),
  k("undisciplined", { o: ["cloud", "red"] }, { aka: ["unruly"] }),
  k("unfaithful", { w: "green", o: ["banner", "blue"], m: [["slash", "purple"]] }),
  k("unfaithful act", { w: "green", o: ["box", "blue"], m: [["slash", "purple"]] }),
  k("unholy", { w: "yellow", o: ["bubble", "purple"], m: [["slash", "purple"]] }, { core: true }),
  k("unintentionally", { u: ["single", "red"] }),
  k("unrighteous", { w: "sky", s: ["t:R", "blue"], m: [["slash", "blue"]] }, { aka: ["unrighteousness"], core: true }),
  k("usury", { s: ["t:%", "green"] }),
  k("valiant men", { w: "red", o: ["box", "blue"] }),
  k("vessels", { s: ["bi:cup-fill", "yellow"] }, { note: "from the temple" }),
  k("violence", { m: [["slash", "black"]] }),
  k("walk", { s: ["bi:person-walking", "blue"] }, { forms: ["walked", "walks"] }),
  k("wall", { o: ["castle", "black"] }, { forms: ["walls"] }),
  k("war", { s: ["p:swords", "black"] }),
  k("warn", { s: ["p:pennant", "red"] }, { forms: ["warned", "warning"] }),
  k("weak", { m: [["strike", "sky"]] }, { forms: ["weakness"] }),
  k("weep", { s: ["bi:droplet-fill", "blue"] }, { forms: ["wept"] }),
  k("well", { w: "sky", o: ["bowl", "blue"] }),
  k("white garments", { s: ["p:garment", "black"] }),
  k("wife", { s: ["bi:gender-female", "pink"] }, { aka: ["woman"], forms: ["wives", "women"] }),
  k("wise men of Babylon", { w: "yellow", u: ["zigzag", "blue"] }),
  k("witness", { w: "orange", o: ["box", "black"], s: ["bi:arrow-up", "black", "after"] }, { note: "of the gospel" }),
  k("witnesses", { u: ["single", "black"], s: ["bi:arrow-up", "black", "after"] }, { note: "eyewitnesses" }),
  k("woe", { w: "yellow", o: ["box", "black"] }),
  k("woman", { w: "pink", o: ["box", "blue"] }, { note: "in Revelation 12" }),
  k("world", { s: ["bi:globe-americas", "blue"] }),
  k("worship", { s: ["bi:person-arms-up", "blue"] }, { forms: ["worshiped", "worshipped"] }),
  k("worthy", { w: "purple", o: ["bubble", "yellow"] }),
  k("wrath", { s: ["t:V", "red"], m: [["slash", "red"]] }, { core: true }),
  k("write", { s: ["bi:pen-fill", "black"] }, { forms: ["wrote", "written"] }),

  /* ── General inductive marks ─────────────────────────────────────── */
  k("comparison", { u: ["dashed", "blue"] }, { general: true, byMeaning: true, aka: ["like", "as"] }),
  k("purpose", { s: ["bi:bullseye", "red", "before"] }, { general: true, aka: ["so that", "in order that"] }),
];

export const KEY_WORD_BY_ID: Record<string, KeyWord> = Object.fromEntries(KEY_WORDS.map((kw) => [kw.id, kw]));

/** Old category marks map onto library key words so earlier studies still render. */
export const LEGACY_CATEGORY_TO_KEYWORD: Record<string, string> = {
  god: "god",
  jesus: "jesus-christ",
  holySpirit: "holy-spirit",
  people: "nations",
  sin: "iniquity",
  salvation: "salvation",
  commands: "command",
  location: "geographical-locations",
  time: "references-to-time",
  contrast: "but",
};

export const SOURCE_LABEL: Record<KeyWordSource, string> = {
  precept: "Precept",
  kkd: "Kari King Dent",
  general: "General",
  custom: "Custom",
};

/** "angel (of God)" style name for lists. */
export const keyWordName = (kw: KeyWord) => (kw.note ? `${kw.label} (${kw.note})` : kw.label);
