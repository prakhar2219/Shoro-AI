/*
 Fix duplicate orders for GB Subtopics per (gb_topic_id, language_id).
 Assign sequential orders starting at 0 within each (topic, language) scope.

 Usage:
   $env:MONGODB_URI="<uri>"; node api/scripts/fix-gbsubtopic-duplicate-orders.js
*/

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/template-db';

async function main() {
  console.log('Connecting to', uri);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const coll = db.collection('gbsubtopics');

  // Get distinct topic ids
  const gbTopicIds = await coll.distinct('gb_topic_id');
  let total = 0;

  for (const topicId of gbTopicIds) {
    const languageIds = await coll.distinct('language_id', { gb_topic_id: topicId });
    for (const lang of languageIds) {
      const docs = await coll
        .find({ gb_topic_id: topicId, language_id: lang })
        .project({ _id: 1, order: 1, name: 1, createdAt: 1 })
        .sort({ order: 1, createdAt: 1, name: 1 })
        .toArray();

      let next = 0;
      const ops = [];
      for (const d of docs) {
        const desired = next;
        if (typeof d.order !== 'number' || d.order !== desired) {
          ops.push({ updateOne: { filter: { _id: d._id }, update: { $set: { order: desired } } } });
        }
        next += 1;
      }

      if (ops.length > 0) {
        const res = await coll.bulkWrite(ops, { ordered: false });
        total += res.modifiedCount || 0;
        console.log(`[gbsubtopics] topic ${topicId} lang ${lang} updated ${res.modifiedCount || 0}`);
      }
    }
  }

  await mongoose.disconnect();
  console.log('Done. Total updated:', total);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


