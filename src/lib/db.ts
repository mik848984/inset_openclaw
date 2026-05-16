import mongoose from 'mongoose';

// Расширяем глобальный объект для кэша соединения
declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

let cached = globalThis.mongooseGlobal;

if (!cached) {
  cached = globalThis.mongooseGlobal = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached!.conn) {
    return cached!.conn;
  }

  const {
    MONGODB_URI,
    MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD,
    MONGODB_HOST,
    MONGODB_DB,
  } = process.env;

  // 1) Если явно задан MONGODB_URI — используем его (на будущее)
  let uri = MONGODB_URI || null;

  // 2) Иначе собираем строку как на проде: root-логин/пароль + контейнер mongodb + база iiset
  if (!uri && MONGO_INITDB_ROOT_USERNAME && MONGO_INITDB_ROOT_PASSWORD) {
    const user = encodeURIComponent(MONGO_INITDB_ROOT_USERNAME);
    const pass = encodeURIComponent(MONGO_INITDB_ROOT_PASSWORD);
    const host = MONGODB_HOST || 'mongodb';
    const db = MONGODB_DB || 'iiset';

    uri = `mongodb://${user}:${pass}@${host}:27017/${db}?authSource=admin`;
  }

  if (!uri) {
    throw new Error(
      'MongoDB config error: neither MONGODB_URI nor Mongo root credentials are set.',
    );
  }

  if (!cached!.promise) {
    mongoose.set('strictQuery', false);

    cached!.promise = mongoose.connect(uri).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

export default dbConnect;
