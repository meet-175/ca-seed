import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const q = query(collection(db, 'content'), where('contentType', '==', 'Question Bank'));
  const snapshot = await getDocs(q);
  const data = {};
  snapshot.forEach(doc => {
    const d = doc.data();
    if (!data[d.subject]) data[d.subject] = new Set();
    data[d.subject].add(d.chapter);
  });
  
  for (const subject in data) {
    console.log(`\n**${subject}**`);
    const sorted = Array.from(data[subject]).sort((a,b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
    sorted.forEach(c => console.log("- " + c));
  }
  process.exit(0);
}

run().catch(console.error);
