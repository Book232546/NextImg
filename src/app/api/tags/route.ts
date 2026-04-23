import { NextResponse } from "next/server";

// 🔧 TODO: เปลี่ยนเป็น database query จริงของคุณ
async function getFromDatabase(tag: string) {
  // mock data
  const allData = [
    {
      id: 1,
      image: "/test1.jpg",
      tags: "cat cute",
      source: "local",
    },
    {
      id: 2,
      image: "/test2.jpg",
      tags: "dog",
      source: "local",
    },
  ];

  if (!tag) return allData;

  return allData.filter((item) =>
    item.tags.toLowerCase().includes(tag.toLowerCase())
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag") || "";

  try {
    const data = await getFromDatabase(tag);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch local data" },
      { status: 500 }
    );
  }
}