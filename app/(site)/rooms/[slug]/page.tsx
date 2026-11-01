import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDB } from "@/lib/db";
import RoomDetail from "@/components/site/RoomDetail";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const room = (await getDB()).rooms.find((r) => r.slug === slug);
  return room ? { title: room.name, description: room.description, openGraph: { images: [room.images[0]] } } : {};
}

export default async function RoomPage({ params }: P) {
  const { slug } = await params;
  const db = await getDB();
  const room = db.rooms.find((r) => r.slug === slug && r.active);
  if (!room) notFound();
  const others = db.rooms.filter((r) => r.active && r.id !== room.id).slice(0, 3);
  const d = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
  return <RoomDetail room={room} others={others} checkIn={d(14)} checkOut={d(17)} />;
}
