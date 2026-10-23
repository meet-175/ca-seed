import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  console.log("Fetching all documents in 'content' collection...");
  const snapshot = await getDocs(collection(db, 'content'));
  console.log(`Total documents found: ${snapshot.size}`);

  const issuesFound = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;
    const body = data.body || '';
    const subject = data.subject || 'Unknown Subject';
    const chapter = data.chapter || 'Unknown Chapter';
    const level = data.level || 'Unknown Level';
    const contentType = data.contentType || 'Unknown Type';

    const docIssues = [];

    // 1. Check for unescaped % inside math delimiters
    // Find all $$...$$
    const displayMathRegex = /\$\$([\s\S]*?)\$\$/g;
    let m;
    while ((m = displayMathRegex.exec(body)) !== null) {
      const content = m[1];
      // Check for % not preceded by \
      const unescapedPct = /(?<!\\)%/.test(content);
      if (unescapedPct) {
        docIssues.push({
          type: 'unescaped_percent_display',
          snippet: m[0].substring(0, 80)
        });
      }
      // Check for standalone & not preceded by \ and not inside aligned/matrix/array/tabular/cases
      const hasAlignEnv = /\\begin\{(aligned|align\*?|matrix|pmatrix|bmatrix|vmatrix|cases|array|tabular)\}/.test(content);
      if (!hasAlignEnv) {
        // check for standalone & (not \&)
        if (/(?<!\\)&/.test(content)) {
          docIssues.push({
            type: 'stray_ampersand_display',
            snippet: m[0].substring(0, 80)
          });
        }
      }
    }

    // Find all $...$ (inline math)
    const inlineMathRegex = /(?<!\$)\$([^$\n\r]+)\$(?!\$)/g;
    while ((m = inlineMathRegex.exec(body)) !== null) {
      const content = m[1];
      if (/(?<!\\)%/.test(content)) {
        docIssues.push({
          type: 'unescaped_percent_inline',
          snippet: m[0].substring(0, 80)
        });
      }
      if (/(?<!\\)&/.test(content)) {
        docIssues.push({
          type: 'stray_ampersand_inline',
          snippet: m[0].substring(0, 80)
        });
      }
    }

    // Find all \(...\) and \[...\]
    const parenMathRegex = /\\\(([\s\S]*?)\\\)/g;
    while ((m = parenMathRegex.exec(body)) !== null) {
      const content = m[1];
      if (/(?<!\\)%/.test(content)) {
        docIssues.push({
          type: 'unescaped_percent_paren',
          snippet: m[0].substring(0, 80)
        });
      }
    }

    // 2. Check for unmatched math delimiters
    // Count $$
    const doubleDollars = (body.match(/\$\$/g) || []).length;
    if (doubleDollars % 2 !== 0) {
      docIssues.push({
        type: 'unbalanced_double_dollar',
        count: doubleDollars
      });
    }

    // Count \( and \)
    const openParens = (body.match(/\\\(/g) || []).length;
    const closeParens = (body.match(/\\\)/g) || []).length;
    if (openParens !== closeParens) {
      docIssues.push({
        type: 'unbalanced_latex_paren',
        open: openParens,
        close: closeParens
      });
    }

    // Count \[ and \]
    const openBrackets = (body.match(/\\\[/g) || []).length;
    const closeBrackets = (body.match(/\\\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      docIssues.push({
        type: 'unbalanced_latex_bracket',
        open: openBrackets,
        close: closeBrackets
      });
    }

    // 3. Check for naked LaTeX commands outside math tags
    // Let's strip away all valid math blocks, tags, style, script, then check for \frac, \times, \sqrt, \begin{aligned}, etc.
    let textOnly = body
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/\$\$[\s\S]*?\$\$/g, '')
      .replace(/(?<!\$)\$[^$\n\r]+\$(?!\$)/g, '')
      .replace(/\\\[[\s\S]*?\\\]/g, '')
      .replace(/\\\([\s\S]*?\\\)/g, '');

    // Now look for naked LaTeX macros in textOnly
    const nakedMacros = [
      /\\frac\{[^{}]*\}\{[^{}]*\}/g,
      /\\begin\{(?:aligned|align\*?|matrix|cases)\}/g,
      /\\(?:times|div|pm|approx|ne|le|ge|cdot|sqrt|sum|int|prod|alpha|beta|gamma|theta|sigma|mu|lambda|pi|infty)\b/g
    ];

    for (const macroRegex of nakedMacros) {
      let macroMatch;
      while ((macroMatch = macroRegex.exec(textOnly)) !== null) {
        // Grab context around it
        const idx = macroMatch.index;
        const start = Math.max(0, idx - 40);
        const end = Math.min(textOnly.length, idx + macroMatch[0].length + 40);
        docIssues.push({
          type: 'naked_latex_outside_math_tags',
          macro: macroMatch[0],
          context: textOnly.substring(start, end).replace(/\s+/g, ' ')
        });
        if (docIssues.length > 20) break;
      }
    }

    if (docIssues.length > 0) {
      issuesFound.push({
        id,
        level,
        subject,
        chapter,
        contentType,
        issues: docIssues
      });
    }
  });

  console.log(`\n================ SCAN SUMMARY ================`);
  console.log(`Total documents with LaTeX issues: ${issuesFound.length}`);
  for (const item of issuesFound) {
    console.log(`\n[${item.id}] ${item.level} > ${item.subject} > ${item.chapter} (${item.contentType})`);
    for (const iss of item.issues) {
      console.log(`  - [${iss.type}] ${iss.macro || ''} ${iss.snippet || iss.context || JSON.stringify(iss)}`);
    }
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Error during scan:", err);
  process.exit(1);
});
