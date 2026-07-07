import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    throw new Error("Not authorized");
  }
  return session;
}

export async function requireDriver() {
  const session = await auth();
  if (!session?.user || session.user.role !== "DRIVER" || !session.user.driverId) {
    throw new Error("Not authorized");
  }
  return session;
}
