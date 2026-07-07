import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@envoyroute.com" },
    update: {},
    create: {
      email: "admin@envoyroute.com",
      name: "Ava Dispatcher",
      role: "ADMIN",
      passwordHash,
    },
  });

  const driverUser1 = await prisma.user.upsert({
    where: { email: "driver1@envoyroute.com" },
    update: {},
    create: {
      email: "driver1@envoyroute.com",
      name: "Marcus Reid",
      role: "DRIVER",
      passwordHash,
      driver: {
        create: {
          phone: "555-0101",
          vehicle: "Ford Transit - VAN12",
          status: "ACTIVE",
          lastLat: 40.7128,
          lastLng: -74.006,
          lastLocatedAt: new Date(),
        },
      },
    },
    include: { driver: true },
  });

  const driverUser2 = await prisma.user.upsert({
    where: { email: "driver2@envoyroute.com" },
    update: {},
    create: {
      email: "driver2@envoyroute.com",
      name: "Priya Nair",
      role: "DRIVER",
      passwordHash,
      driver: {
        create: {
          phone: "555-0102",
          vehicle: "Sprinter - VAN07",
          status: "OFFLINE",
          lastLat: 40.73,
          lastLng: -73.99,
          lastLocatedAt: new Date(),
        },
      },
    },
    include: { driver: true },
  });

  const customerA = await prisma.customer.create({
    data: {
      name: "Brightside Bakery",
      phone: "555-1001",
      email: "orders@brightsidebakery.com",
      address: "221 Baker St, New York, NY",
      lat: 40.7148,
      lng: -74.0021,
    },
  });

  const customerB = await prisma.customer.create({
    data: {
      name: "Union Hardware",
      phone: "555-1002",
      email: "shipping@unionhardware.com",
      address: "88 Union Ave, New York, NY",
      lat: 40.718,
      lng: -73.958,
    },
  });

  const customerC = await prisma.customer.create({
    data: {
      name: "Riverside Clinic",
      phone: "555-1003",
      email: "supplies@riversideclinic.com",
      address: "500 Riverside Dr, New York, NY",
      lat: 40.815,
      lng: -73.964,
    },
  });

  const order1 = await prisma.order.create({
    data: {
      customerId: customerA.id,
      description: "12x pastry boxes",
      weightKg: 8.5,
      address: customerA.address,
      lat: customerA.lat,
      lng: customerA.lng,
      status: "ASSIGNED",
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: customerB.id,
      description: "Pallet of fasteners",
      weightKg: 120,
      address: customerB.address,
      lat: customerB.lat,
      lng: customerB.lng,
      status: "ASSIGNED",
    },
  });

  const order3 = await prisma.order.create({
    data: {
      customerId: customerC.id,
      description: "Medical supplies restock",
      weightKg: 22,
      address: customerC.address,
      lat: customerC.lat,
      lng: customerC.lng,
      status: "PENDING",
    },
  });

  const driver1 = driverUser1.driver!;

  const route1 = await prisma.route.create({
    data: {
      driverId: driver1.id,
      date: new Date(),
      status: "IN_PROGRESS",
      stops: {
        create: [
          { orderId: order1.id, sequence: 1, status: "PENDING" },
          { orderId: order2.id, sequence: 2, status: "PENDING" },
        ],
      },
    },
  });

  console.log({
    admin: admin.email,
    drivers: [driverUser1.email, driverUser2.email],
    route1: route1.id,
    order3: order3.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
