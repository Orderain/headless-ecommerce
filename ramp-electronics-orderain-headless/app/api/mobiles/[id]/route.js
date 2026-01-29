// import { NextResponse } from "next/server";
// import { db } from "@/lib/firebase";
// import { doc, getDoc } from "firebase/firestore";

// export async function GET(req, { params }) {
//   try {
//     const { id } = await params; // Ensure params is awaited in newer Next.js versions

//     const docRef = doc(db, "mobiles", id);
//     const docSnap = await getDoc(docRef);

//     if (!docSnap.exists()) {
//       return NextResponse.json(
//         { message: "Mobile not found" },
//         { status: 404 },
//       );
//     }

//     return NextResponse.json({
//       id: docSnap.id,
//       ...docSnap.data(),
//     });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
