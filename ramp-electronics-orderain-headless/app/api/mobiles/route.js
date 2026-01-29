// import { NextResponse } from "next/server";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   addDoc,
//   getDocs,
//   query,
//   where,
//   serverTimestamp,
// } from "firebase/firestore";

// export async function POST(req) {
//   try {
//     const data = await req.json();
//     await addDoc(collection(db, "mobiles"), {
//       ...data,
//       createdAt: serverTimestamp(),
//     });
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const category = searchParams.get("category");

//     const mobilesRef = collection(db, "mobiles");
//     // If a category is passed in URL (?category=deals), filter it
//     const q = category
//       ? query(mobilesRef, where("category", "==", category))
//       : mobilesRef;

//     const snapshot = await getDocs(q);
//     const mobiles = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     return NextResponse.json(mobiles);
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
