"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireDriver } from "@/lib/guards";

export async function completeStop(stopId: string) {
  const session = await requireDriver();

  const stop = await prisma.stop.findUniqueOrThrow({
    where: { id: stopId },
    include: { route: true },
  });

  if (stop.route.driverId !== session.user.driverId) {
    throw new Error("Not authorized");
  }

  await prisma.$transaction([
    prisma.stop.update({
      where: { id: stopId },
      data: { status: "COMPLETED", completedAt: new Date() },
    }),
    prisma.order.update({ where: { id: stop.orderId }, data: { status: "DELIVERED" } }),
  ]);

  revalidatePath("/driver");
}

export async function reportLocation(lat: number, lng: number) {
  const session = await requireDriver();
  const driverId = session.user.driverId as string;

  await prisma.$transaction([
    prisma.driver.update({
      where: { id: driverId },
      data: { lastLat: lat, lastLng: lng, lastLocatedAt: new Date(), status: "ACTIVE" },
    }),
    prisma.locationPing.create({ data: { driverId, lat, lng } }),
  ]);
}

export async function setDriverStatus(status: "ACTIVE" | "OFFLINE" | "ON_BREAK") {
  const session = await requireDriver();
  await prisma.driver.update({
    where: { id: session.user.driverId as string },
    data: { status },
  });
  revalidatePath("/driver");
}
