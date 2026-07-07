"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function createOrder(formData: FormData) {
  await requireAdmin();

  const customerId = formData.get("customerId") as string;
  const description = (formData.get("description") as string)?.trim();
  const weightKg = formData.get("weightKg") ? Number(formData.get("weightKg")) : null;
  const addressOverride = (formData.get("address") as string)?.trim();

  if (!customerId || !description) {
    throw new Error("Customer and description are required");
  }

  const customer = await prisma.customer.findUniqueOrThrow({ where: { id: customerId } });

  await prisma.order.create({
    data: {
      customerId,
      description,
      weightKg,
      address: addressOverride || customer.address,
      lat: customer.lat,
      lng: customer.lng,
    },
  });

  revalidatePath("/orders");
}

export async function deleteOrder(orderId: string) {
  await requireAdmin();
  await prisma.order.delete({ where: { id: orderId } });
  revalidatePath("/orders");
}

export async function cancelOrder(orderId: string) {
  await requireAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
  revalidatePath("/orders");
}
