/*
 Fix duplicate orders for GB Categories per language.
 Strategy: For each language_id, scan categories sorted by createdAt/order/name,
 assign order values starting at 0 upwards without gaps, ensuring uniqueness.

 Usage:
   PowerShell:
     $env:MONGODB_URI="<uri>"; node api/scripts/fix-gbcategory-duplicate-orders.js
   Bash:
     MONGODB_URI="<uri>" node api/scripts/fix-gbcategory-duplicate-orders.js
*/

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/template-db';

async function main() {
  console.log('Connecting to', uri);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const coll = db.collection('gbcategories');

  // Get distinct languages present in gbcategories
  const languageIds = await coll.distinct('language_id');
  let totalUpdated = 0;

  for (const lang of languageIds) {
    const docs = await coll
      .find({ language_id: lang })
      .project({ _id: 1, order: 1, name: 1, createdAt: 1 })
      .sort({ order: 1, createdAt: 1, name: 1 })
      .toArray();

    let next = 0;
    const bulk = [];
    for (const d of docs) {
      const desired = next; // sequential assign starting at 0
      if (typeof d.order !== 'number' || d.order !== desired) {
        bulk.push({ updateOne: { filter: { _id: d._id }, update: { $set: { order: desired } } } });
      }
      next += 1;
    }

    if (bulk.length > 0) {
      const res = await coll.bulkWrite(bulk, { ordered: false });
      totalUpdated += res.modifiedCount || 0;
      console.log(`[gbcategories] language ${lang} updated ${res.modifiedCount || 0} docs`);
    } else {
      console.log(`[gbcategories] language ${lang} already sequential`);
    }
  }

  await mongoose.disconnect();
  console.log('Done. Total updated:', totalUpdated);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


