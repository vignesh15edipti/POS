const mongoose = require('mongoose');

async function migrate() {
  const localUri = 'mongodb://127.0.0.1:27017/retail_pos';
  const remoteUri = 'mongodb://vignesh1515official_db_user:8tOwri1ix8PSzL3K@ac-jaw17md-shard-00-00.xqbabtx.mongodb.net:27017,ac-jaw17md-shard-00-01.xqbabtx.mongodb.net:27017,ac-jaw17md-shard-00-02.xqbabtx.mongodb.net:27017/retail_pos?ssl=true&authSource=admin&retryWrites=true&w=majority';

  console.log('Connecting to local database...');
  const localConn = await mongoose.createConnection(localUri).asPromise();
  console.log('Connecting to remote database...');
  const remoteConn = await mongoose.createConnection(remoteUri).asPromise();

  console.log('Connected to both databases.');

  const collections = await localConn.db.listCollections().toArray();
  console.log(`Found ${collections.length} collections.`);

  for (const collInfo of collections) {
    const collName = collInfo.name;
    console.log(`\nMigrating collection: ${collName}`);

    const localColl = localConn.db.collection(collName);
    const docs = await localColl.find({}).toArray();
    console.log(`Found ${docs.length} documents in ${collName}.`);

    if (docs.length > 0) {
      const remoteColl = remoteConn.db.collection(collName);
      
      try {
        await remoteColl.insertMany(docs, { ordered: false });
        console.log(`Successfully migrated ${docs.length} documents to ${collName}.`);
      } catch (err) {
        if (err.code === 11000) {
           console.log(`Some documents were skipped due to duplicate keys (likely already migrated).`);
        } else {
           console.error(`Error migrating ${collName}:`, err.message);
        }
      }
    }
  }

  await localConn.close();
  await remoteConn.close();
  console.log('\nMigration complete.');
}

migrate().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
