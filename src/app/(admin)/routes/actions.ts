"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function createRoute(formData: FormData) {
  await requireAdmin();

  const driverId = formData.get("driverId") as string;
  const date = formData.get("date") as string;
  const orderIds = formData.getAll("orderIds") as string[];

  if (!driverId || !date) {
    throw new Error("Driver and date are required");
  }

  const route = await prisma.route.create({
    data: {
      driverId,
      date: new Date(date),
      stops: {
        create: orderIds.map((orderId, i) => ({ orderId, sequence: i + 1 })),
      },
    },
  });

  if (orderIds.length > 0) {
    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status: "ASSIGNED" },
    });
  }

  revalidatePath("/routes");
  revalidatePath("/orders");
  return route.id;
}

export async function addStopToRoute(routeId: string, orderId: string) {
  await requireAdmin();

  const maxSeq = await prisma.stop.aggregate({
    where: { routeId },
    _max: { sequence: true },
  });

  await prisma.$transaction([
    prisma.stop.create({
      data: { routeId, orderId, sequence: (maxSeq._max.sequence ?? 0) + 1 },
    }),
    prisma.order.update({ where: { id: orderId }, data: { status: "ASSIGNED" } }),
  ]);

  revalidatePath(`/routes/${routeId}`);
  revalidatePath("/orders");
}

export async function removeStop(stopId: string) {
  await requireAdmin();

  const stop = await prisma.stop.delete({ where: { id: stopId } });
  await prisma.order.update({ where: { id: stop.orderId }, data: { status: "PENDING" } });

  revalidatePath(`/routes/${stop.routeId}`);
  revalidatePath("/orders");
}

export async function moveStop(stopId: string, direction: "up" | "down") {
  await requireAdmin();

  const stop = await prisma.stop.findUniqueOrThrow({ where: { id: stopId } });
  const neighbor = await prisma.stop.findFirst({
    where: {
      routeId: stop.routeId,
      sequence: direction === "up" ? { lt: stop.sequence } : { gt: stop.sequence },
    },
    orderBy: { sequence: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) return;

  await prisma.$transaction([
    prisma.stop.update({ where: { id: stop.id }, data: { sequence: neighbor.sequence } }),
    prisma.stop.update({ where: { id: neighbor.id }, data: { sequence: stop.sequence } }),
  ]);

  revalidatePath(`/routes/${stop.routeId}`);
}

export async function updateRouteStatus(routeId: string, status: "PLANNED" | "IN_PROGRESS" | "COMPLETED") {
  await requireAdmin();
  await prisma.route.update({ where: { id: routeId }, data: { status } });
  revalidatePath(`/routes/${routeId}`);
  revalidatePath("/routes");
}

export async function deleteRoute(routeId: string) {
  await requireAdmin();

  const stops = await prisma.stop.findMany({ where: { routeId } });
  await prisma.order.updateMany({
    where: { id: { in: stops.map((s) => s.orderId) } },
    data: { status: "PENDING" },
  });
  await prisma.route.delete({ where: { id: routeId } });

  revalidatePath("/routes");
  revalidatePath("/orders");
}
