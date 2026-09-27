import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const q = query(collection(db, 'content'), where('contentType', '==', 'Question Bank'));
  const snapshot = await getDocs(q);
  
  let totalFixed = 0;
  
  for (const document of snapshot.docs) {
    let body = document.data().body;
    let modified = false;

    const blockRegex = /\$\$([\s\S]*?)\$\$/g;
    body = body.replace(blockRegex, (match, mathContent) => {
      let newMath = mathContent.replace(/(?<!\\)%/g, '\\%');
      if (newMath.includes('&') && !newMath.includes('align') && !newMath.includes('matrix') && !newMath.includes('cases') && !newMath.includes('array')) {
        newMath = `\\begin{aligned} ${newMath} \\end{aligned}`;
      }
      if (newMath !== mathContent) modified = true;
      return `$$${newMath}$$`;
    });
    
    const inlineRegex = /(?<!\$)\$([^$\n]+)\$(?!\$)/g;
    body = body.replace(inlineRegex, (match, mathContent) => {
      let newMath = mathContent.replace(/(?<!\\)%/g, '\\%');
      if (newMath !== mathContent) modified = true;
      return `$${newMath}$`;
    });

    if (modified) {
      await updateDoc(doc(db, 'content', document.id), { body });
      console.log(`Fixed formatting issues in: ${document.data().subject} - ${document.data().chapter}`);
      totalFixed++;
    }
  }
  
  console.log(`\nSuccessfully fixed ${totalFixed} documents in the database.`);
  process.exit(0);
}

run().catch(console.error);
