import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const drivers = await prisma.driver.findMany({
    include: {
      user: true,
      routes: {
        where: { status: { in: ["PLANNED", "IN_PROGRESS"] } },
        include: { stops: true },
        orderBy: { date: "asc" },
        take: 1,
      },
    },
  });

  const data = drivers.map((d) => {
    const route = d.routes[0];
    return {
      id: d.id,
      name: d.user.name,
      vehicle: d.vehicle,
      status: d.status,
      lat: d.lastLat,
      lng: d.lastLng,
      lastLocatedAt: d.lastLocatedAt,
      stopsTotal: route?.stops.length ?? 0,
      stopsDone: route?.stops.filter((s) => s.status === "COMPLETED").length ?? 0,
    };
  });

  return NextResponse.json(data);
}
