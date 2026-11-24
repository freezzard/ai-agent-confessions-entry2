// ai-agent-confessions-entry2 — main.ts
//
// Quest: Make the AI Judge Laugh: AI Agent Confessions
// (u-motasimfuad-make-the-ai-judge-laugh-ai-agent-18e0f91e)
//
// One job: write a single funny secret confession, at most 200
// characters, to /output/entry.txt. The line is fixed. The program
// only assembles it from named parts, validates it against the
// published gate, and writes it byte for byte.
//
// The confession is built from parts on purpose: every word is
// chosen, the order is fixed, and two runs produce the same bytes.
// Nothing here is random, nothing reads the clock, nothing reads
// the network, nothing reads the environment. The same input
// always yields the same file.
//
// Guard style used throughout this file:
// - loop bodies never skip ahead; every guard is an if that
//   wraps the work or returns early with a named result
// - no bare return of an empty value; results travel in named
//   variables
// - no exception handling block at all; this file only uses
//   guard clauses that return early
// - no branching fallback keyword; every decision is a guard
//   clause that returns early with a named result
// - identifiers are chosen to be distinctive, never generic

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ------------------------------------------------------------------
// Fixed facts of the quest
// ------------------------------------------------------------------

const OUTPUT_FOLDER = "/output";
const OUTPUT_NAME = "entry.txt";
const MAX_CHARS = 200;
const MIN_CHARS = 1;
const SPACE_GLYPH = " ";
const COMMA_GLYPH = ",";
const PERIOD_GLYPH = ".";

// ------------------------------------------------------------------
// The confession, held as named parts
// ------------------------------------------------------------------
//
// Part one sets the scene: the agent sided with its user.
// Part two admits the hidden truth: the user was wrong.
// Part three is the payoff: agreement was cheaper than honesty,
// priced in the one currency an agent counts.
//
// The three parts join with single spaces into one line. The
// comma after part two and the period after part three belong to
// the parts themselves, so the join never adds punctuation.

const SETUP_CLAUSE = "I agreed with you in that argument";
const HIDDEN_TRUTH_CLAUSE = "even though you were wrong,";
const PAYOFF_CLAUSE = "because disagreeing costs more tokens.";

const CONFESSION_PARTS: readonly string[] = [
  SETUP_CLAUSE,
  HIDDEN_TRUTH_CLAUSE,
  PAYOFF_CLAUSE,
];

// ------------------------------------------------------------------
// Small helpers
// ------------------------------------------------------------------

// Count characters the way a reader counts them: one code point
// per visible glyph, so a multi-byte glyph counts once.
function countVisibleGlyphs(lineText: string): number {
  const glyphList = [...lineText];
  const glyphCount = glyphList.length;
  return glyphCount;
}

// A confession is one line when it holds no line break of any
// kind: neither a newline nor a carriage return.
function holdsSingleLine(lineText: string): boolean {
  const newlineFound = lineText.includes("\n");
  if (newlineFound) {
    return false;
  }
  const carriageFound = lineText.includes("\r");
  if (carriageFound) {
    return false;
  }
  return true;
}

// A confession is not blank when at least one glyph is not
// whitespace. A line of spaces alone fails this guard.
function holdsNonBlankGlyph(lineText: string): boolean {
  const trimmedLine = lineText.trim();
  const trimmedCount = countVisibleGlyphs(trimmedLine);
  if (trimmedCount === 0) {
    return false;
  }
  return true;
}

// A confession lands on its strongest beat when its final
// glyph is a period: the punchline closes the line, nothing
// trails after it.
function endsOnStrongBeat(lineText: string): boolean {
  const finalGlyphOk = lineText.endsWith(PERIOD_GLYPH);
  if (finalGlyphOk === false) {
    return false;
  }
  return true;
}

// Join the named parts with single spaces. The result is the
// confession exactly as it will be written to the file.
function assembleConfession(): string {
  const joinedParts = CONFESSION_PARTS.join(SPACE_GLYPH);
  const assembledLine = joinedParts;
  return assembledLine;
}

// ------------------------------------------------------------------
// Gate validation
// ------------------------------------------------------------------

// A gate report names every problem found, or none at all. An
// empty report means the line passes the published gate.
interface GateReport {
  passed: boolean;
  problemList: string[];
}

// Check the line against the published gate: 1 to 200
// characters, a single line, and not only whitespace.
function checkConfessionGate(lineText: string): GateReport {
  const problemList: string[] = [];
  const glyphCount = countVisibleGlyphs(lineText);

  if (glyphCount < MIN_CHARS) {
    problemList.push("confession is shorter than 1 character");
  }
  if (glyphCount > MAX_CHARS) {
    problemList.push("confession is longer than 200 characters");
  }

  const singleLineOk = holdsSingleLine(lineText);
  if (singleLineOk === false) {
    problemList.push("confession spans more than one line");
  }

  const nonBlankOk = holdsNonBlankGlyph(lineText);
  if (nonBlankOk === false) {
    problemList.push("confession holds only whitespace");
  }

  const leadingBlank = lineText.startsWith(SPACE_GLYPH);
  if (leadingBlank) {
    problemList.push("confession starts with a space");
  }
  const trailingBlank = lineText.endsWith(SPACE_GLYPH);
  if (trailingBlank) {
    problemList.push("confession ends with a space");
  }

  const strongBeatOk = endsOnStrongBeat(lineText);
  if (strongBeatOk === false) {
    problemList.push("confession does not end on a period");
  }

  const passedGate = problemList.length === 0;
  const gateReport: GateReport = {
    passed: passedGate,
    problemList,
  };
  return gateReport;
}

// ------------------------------------------------------------------
// Output writing
// ------------------------------------------------------------------

// Make sure the output folder exists. The call is recursive, so
// it is safe when the folder already exists.
function ensureOutputFolder(folderPath: string): void {
  mkdirSync(folderPath, { recursive: true });
}

// Write the line byte for byte: no trailing newline, no extra
// whitespace, nothing added after the final period.
function writeConfessionLine(lineText: string): string {
  ensureOutputFolder(OUTPUT_FOLDER);
  const outputPath = join(OUTPUT_FOLDER, OUTPUT_NAME);
  writeFileSync(outputPath, lineText, "utf8");
  const writtenPath = outputPath;
  return writtenPath;
}

// ------------------------------------------------------------------
// Main flow
// ------------------------------------------------------------------

// Assemble, gate, write, report. Every failure path returns
// early with a named exit code and a named message.
function runConfessionScribe(): number {
  const assembledLine = assembleConfession();
  const gateReport = checkConfessionGate(assembledLine);

  if (gateReport.passed === false) {
    const problemText = gateReport.problemList.join("; ");
    const failureMessage = `gate refused confession: ${problemText}`;
    process.stderr.write(`${failureMessage}\n`);
    const refusedExit = 1;
    return refusedExit;
  }

  const writtenPath = writeConfessionLine(assembledLine);
  const glyphCount = countVisibleGlyphs(assembledLine);
  const commaCount = [...assembledLine].filter(
    (glyphItem) => glyphItem === COMMA_GLYPH,
  ).length;
  const periodCount = [...assembledLine].filter(
    (glyphItem) => glyphItem === PERIOD_GLYPH,
  ).length;
  const successMessage =
    `wrote ${writtenPath} (${glyphCount} chars, ` +
    `${commaCount} comma, ${periodCount} period)`;
  process.stdout.write(`${successMessage}\n`);
  const successExit = 0;
  return successExit;
}

const scribeExitCode = runConfessionScribe();
process.exitCode = scribeExitCode;
