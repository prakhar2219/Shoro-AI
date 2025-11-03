/*
 One-time maintenance script to enforce the intended unique order scopes:
 - chapters:      { subject_id: 1, language_id: 1, order: 1 }
 - topics:        { chapter_id: 1, language_id: 1, order: 1 }
 - subtopics:     { topic_id: 1, language_id: 1, order: 1 }
 - gb_categories: { language_id: 1, order: 1 }
 - gb_topics:     { gb_category_id: 1, language_id: 1, order: 1 }
 - gb_subtopics:  { gb_topic_id: 1, language_id: 1, order: 1 }
 - gb_questions:  { gb_subtopic_id: 1, language_id: 1, order: 1 }

 Usage (Windows PowerShell):
   $env:MONGODB_URI="mongodb://localhost:27017/your-db"; node api/scripts/rebuild-order-indexes.js
 or (bash):
   MONGODB_URI="mongodb://localhost:27017/your-db" node api/scripts/rebuild-order-indexes.js
*/

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/template-db';

const tasks = [
  {
    coll: 'chapters',
    drop: [ { subject_id: 1, order: 1 } ],
    create: [ { key: { subject_id: 1, language_id: 1, order: 1 }, options: { unique: true } } ]
  },
  {
    coll: 'topics',
    drop: [ { chapter_id: 1, order: 1 } ],
    create: [ { key: { chapter_id: 1, language_id: 1, order: 1 }, options: { unique: true } } ]
  },
  {
    coll: 'subtopics',
    drop: [ { topic_id: 1, order: 1 } ],
    create: [ { key: { topic_id: 1, language_id: 1, order: 1 }, options: { unique: true } } ]
  },
  {
    coll: 'gbcategories',
    drop: [ { order: 1 } ],
    create: [ { key: { language_id: 1, order: 1 }, options: { unique: true } } ]
  },
  {
    coll: 'gbtopics',
    drop: [ { gb_category_id: 1, order: 1 } ],
    create: [ { key: { gb_category_id: 1, language_id: 1, order: 1 }, options: { unique: true } } ]
  },
  {
    coll: 'gbsubtopics',
    drop: [ { gb_topic_id: 1, order: 1 } ],
    create: [ { key: { gb_topic_id: 1, language_id: 1, order: 1 }, options: { unique: true } } ]
  },
  {
    coll: 'gbquestions',
    drop: [ { gb_subtopic_id: 1, order: 1 } ],
    create: [ { key: { gb_subtopic_id: 1, language_id: 1, order: 1 }, options: { unique: true } } ]
  }
];

async function ensureIndex(db, { coll, drop, create }) {
  const collection = db.collection(coll);
  const existing = await collection.indexes();
  const existingKeys = new Set(existing.map((i) => JSON.stringify(i.key)));

  // Drop stale/conflicting indexes if present
  for (const key of drop) {
    const sig = JSON.stringify(key);
    if (existingKeys.has(sig)) {
      const name = existing.find((i) => JSON.stringify(i.key) === sig)?.name;
      try {
        await collection.dropIndex(name);
        console.log(`[${coll}] dropped index`, name || sig);
      } catch (e) {
        console.log(`[${coll}] drop skipped`, name || sig, e.message);
      }
    }
  }

  // Create desired indexes
  for (const { key, options } of create) {
    const sig = JSON.stringify(key);
    if (!existingKeys.has(sig)) {
      await collection.createIndex(key, options || {});
      console.log(`[${coll}] created index`, key, options || {});
    } else {
      console.log(`[${coll}] index already exists`, key);
    }
  }
}

async function main() {
  console.log('Connecting to', uri);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  for (const t of tasks) {
    await ensureIndex(db, t);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


