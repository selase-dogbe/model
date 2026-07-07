"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";

export async function createCustomer(formData: FormData) {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;

  if (!name || !address) {
    throw new Error("Name and address are required");
  }

  await prisma.customer.create({
    data: { name, address, phone, email },
  });

  revalidatePath("/customers");
}

export async function deleteCustomer(customerId: string) {
  await requireAdmin();
  await prisma.customer.delete({ where: { id: customerId } });
  revalidatePath("/customers");
}
