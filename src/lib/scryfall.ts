
// import { MongoClient } from "mongodb";

// if (!process.env.MONGODB_URI) {
//   throw new Error("Please define the MONGODB_URI environment variable in .env.local");
// }

// const uri = process.env.MONGODB_URI;
// const options = {};

// // Расширяем типизацию для globalThis
// declare global {
//   // eslint-disable-next-line no-var
//   var _mongoClientPromise: Promise<MongoClient> | undefined;
// }

// let client: MongoClient;
// let clientPromise: Promise<MongoClient>;

// if (process.env.NODE_ENV === "development") {
//   if (!global._mongoClientPromise) {
//     client = new MongoClient(uri, options);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
//   client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// export default clientPromise;


// import { MongoClient } from "mongodb";

// const uri = process.env.MONGODB_URI;
// const options = {};

// let client;
// let clientPromise;

// if (!process.env.MONGODB_URI) {
//   throw new Error("Please add your Mongo URI to .env.local");
// }

// if (process.env.NODE_ENV === "development") {
//   if (!global._mongoClientPromise) {
//     client = new MongoClient(uri, options);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
//   client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// export default clientPromise;

export interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  set_name: string;
  rarity?: string;
  artist?: string;
  type_line?: string;
  colors?: string[];
  image_uris?: { normal?: string };
  card_faces?: Array<{
    side?: "front" | "back";
    image_uris?: { normal?: string };
  }>;
  legalities?: Record<string, string>;
}

export function mapScryfallToCard(data: ScryfallCard) {
  const faces =
    data.card_faces?.length
      ? data.card_faces
          .map((f) => ({
            side: f.side ?? "front",
            imageUrl: f.image_uris?.normal ?? "",
          }))
          .filter((f) => !!f.imageUrl)
      : data.image_uris?.normal
        ? [{ side: "front", imageUrl: data.image_uris.normal }]
        : [];

  return {
    scryfall_id: data.id,
    name: data.name,
    set: data.set,
    set_name: data.set_name,
    rarity: data.rarity ?? "",
    artist: data.artist ?? "",
    types: data.type_line ?? "",
    colors: data.colors ?? [],
    legalities: data.legalities ?? {},
    faces,
  };
}
