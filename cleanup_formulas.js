import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

function fixUnescapedPercentInMath(body) {
  let modified = false;

  // 1. In $$ ... $$ display blocks
  let newBody = body.replace(/\$\$([\s\S]*?)\$\$/g, (fullMatch, mathContent) => {
    if (/(?<!\\)%/.test(mathContent)) {
      modified = true;
      const fixedMath = mathContent.replace(/(?<!\\)%/g, '\\%');
      return `$$${fixedMath}$$`;
    }
    return fullMatch;
  });

  // 2. In \( ... \) inline blocks
  newBody = newBody.replace(/\\\(([\s\S]*?)\\\)/g, (fullMatch, mathContent) => {
    if (/(?<!\\)%/.test(mathContent)) {
      modified = true;
      const fixedMath = mathContent.replace(/(?<!\\)%/g, '\\%');
      return `\\(${fixedMath}\\)`;
    }
    return fullMatch;
  });

  // 3. In $ ... $ inline blocks (excluding already processed $$)
  newBody = newBody.replace(/(?<!\$)\$([^$\n\r]+)\$(?!\$)/g, (fullMatch, mathContent) => {
    if (/(?<!\\)%/.test(mathContent)) {
      modified = true;
      const fixedMath = mathContent.replace(/(?<!\\)%/g, '\\%');
      return `$${fixedMath}$`;
    }
    return fullMatch;
  });

  return { newBody, modified };
}

async function run() {
  console.log("Starting automated LaTeX and formula cleanup across Firestore database...");
  const snapshot = await getDocs(collection(db, 'content'));
  console.log(`Scanning ${snapshot.size} documents in 'content' collection...`);

  let updatedCount = 0;
  const updatedDocs = [];

  for (const docSnap of snapshot.docs) {
    const id = docSnap.id;
    const data = docSnap.data();
    let body = data.body || '';
    let docModified = false;
    const fixesApplied = [];

    // Specific fix for tcqhw0ca4 (Quantitative Aptitude - Theoretical Distributions)
    if (id === 'tcqhw0ca4') {
      // Fix 1: Missing closing \) on binomial calculation
      const target1 = `\\({}^{8}C_2 (5/8)^2 (3/8)^6 = 28 × 25/64 × 729/262144 = 510300/16777216 = 0.0304</p>`;
      const replace1 = `\\({}^{8}C_2 (5/8)^2 (3/8)^6 = 28 × 25/64 × 729/262144 = 510300/16777216 = 0.0304\\)</p>`;
      if (body.includes(target1)) {
        body = body.replace(target1, replace1);
        docModified = true;
        fixesApplied.push("Closed missing \\) delimiter in binomial calculation");
      }

      // Fix 2: Remove redundant nested \( in multinomial sum
      const target2 = `\\({}^{8}C_5 (1/3)^5 (2/3)^3 + \\({}^{8}C_6 (1/3)^6 (2/3)^2 + \\({}^{8}C_7 (1/3)^7 (2/3)^1 + \\({}^{8}C_8 (1/3)^8\\)`;
      const replace2 = `\\({}^{8}C_5 (1/3)^5 (2/3)^3 + {}^{8}C_6 (1/3)^6 (2/3)^2 + {}^{8}C_7 (1/3)^7 (2/3)^1 + {}^{8}C_8 (1/3)^8\\)`;
      if (body.includes(target2)) {
        body = body.replace(target2, replace2);
        docModified = true;
        fixesApplied.push("Removed 3 rogue nested \\( delimiters in sum expression");
      }
    }

    // Specific fix for vbf2gr1o7 (Accounting - Theoretical Framework)
    if (id === 'vbf2gr1o7') {
      // Fix naked \frac in table row
      const target1 = `<tr><td>Less: Depreciation \\frac{6,00,000-35,000}{10}</td><td></td><td></td><td>56,500</td></tr>`;
      const replace1 = `<tr><td>Less: Depreciation $\\frac{6,00,000-35,000}{10}$</td><td></td><td></td><td>56,500</td></tr>`;
      if (body.includes(target1)) {
        body = body.replace(target1, replace1);
        docModified = true;
        fixesApplied.push("Wrapped naked \\frac depreciation formula in $ delimiters");
      }

      // Fix interpolation formula
      const target2 = `<p>Now we use interpolation formula: 10\\% + \\frac{86,543}{86,543 - (-1,22,720)} \\times 10\\% = 10\\% + \\frac{86,543}{2,09,263} \\times 10\\% = 10\\% + 4.14\\% = 14.14\\%</p>`;
      const replace2 = `<p>Now we use interpolation formula: $10\\% + \\frac{86,543}{86,543 - (-1,22,720)} \\times 10\\% = 10\\% + \\frac{86,543}{2,09,263} \\times 10\\% = 10\\% + 4.14\\% = 14.14\\%$</p>`;
      if (body.includes(target2)) {
        body = body.replace(target2, replace2);
        docModified = true;
        fixesApplied.push("Wrapped interpolation formula in $ math delimiters");
      }

      // Fix ARR formula
      const target3 = `<p>Note: For ARR, use the formula \\frac{\\text{Profit after tax}}{\\text{Investment in the beginning of the year}}`;
      const replace3 = `<p>Note: For ARR, use the formula $\\frac{\\text{Profit after tax}}{\\text{Investment in the beginning of the year}}$`;
      if (body.includes(target3)) {
        body = body.replace(target3, replace3);
        docModified = true;
        fixesApplied.push("Wrapped ARR ratio formula in $ math delimiters");
      }

      // Fix Cash Inflow/Outflow ratio
      const target4 = `<p>It can be stated in the form of a ratio as follows: \\frac{\\text{Cash inflows}}{\\text{Cash Outflows}} = 1</p>`;
      const replace4 = `<p>It can be stated in the form of a ratio as follows: $\\frac{\\text{Cash inflows}}{\\text{Cash Outflows}} = 1$</p>`;
      if (body.includes(target4)) {
        body = body.replace(target4, replace4);
        docModified = true;
        fixesApplied.push("Wrapped Cash inflows / Outflows formula in $ math delimiters");
      }
    }

    // Specific fix for xkktb5l0d (Advanced Accounting - Foreign Branches)
    if (id === 'xkktb5l0d') {
      // In this document, all $ are currency symbols (US$, A$, $6000) rather than LaTeX math
      // Replace $ with &#36; (or USD / A$) so MathJax doesn't misinterpret them as math delimiters
      const originalBody = body;
      // Replace A$ with A&#36;
      body = body.replace(/A\$/g, 'A&#36;');
      // Replace US$ with US&#36;
      body = body.replace(/US\$/g, 'US&#36;');
      // Replace remaining standalone $ followed by digit or space with &#36;
      body = body.replace(/\$([0-9])/g, '&#36;$1');
      body = body.replace(/\$ /g, '&#36; ');
      body = body.replace(/\$/g, '&#36;');
      if (body !== originalBody) {
        docModified = true;
        fixesApplied.push("Escaped foreign currency dollar signs ($ -> &#36;) to prevent false math delimiter parsing");
      }
    }

    // General fix: Unescaped % inside math blocks across ALL documents
    const pctResult = fixUnescapedPercentInMath(body);
    if (pctResult.modified) {
      body = pctResult.newBody;
      docModified = true;
      fixesApplied.push("Escaped unescaped % inside LaTeX math expressions (% -> \\%)");
    }

    // If document was modified, write update to Firestore
    if (docModified) {
      await setDoc(doc(db, 'content', id), {
        id: data.id,
        level: data.level,
        subject: data.subject,
        chapter: data.chapter,
        contentType: data.contentType,
        body: body,
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now()
      });
      updatedCount++;
      updatedDocs.push({
        id,
        level: data.level,
        subject: data.subject,
        chapter: data.chapter,
        contentType: data.contentType,
        fixes: fixesApplied
      });
      console.log(`[SUCCESS] Updated ${id} (${data.subject} > ${data.chapter}): ${fixesApplied.join('; ')}`);
    }
  }

  console.log(`\n================ CLEANUP SUMMARY ================`);
  console.log(`Total documents updated: ${updatedCount}`);
  for (const d of updatedDocs) {
    console.log(`- [${d.id}] ${d.level} > ${d.subject} > ${d.chapter} (${d.contentType})`);
    for (const f of d.fixes) {
      console.log(`    * ${f}`);
    }
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Cleanup script failed:", err);
  process.exit(1);
});
