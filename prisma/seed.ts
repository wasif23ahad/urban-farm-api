import { PrismaClient, Role, CertStatus, Status } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: undefined, // Prisma 7 configuration
  datasource: {
    url: process.env.DATABASE_URL
  }
} as any);

async function main() {
  console.log('Seeding database...');
  const password = await bcrypt.hash('password123', 10);

  // 1. Create Admins
  await prisma.user.createMany({
    data: [
      { name: 'Admin One', email: 'admin1@farm.com', password, role: Role.ADMIN },
      { name: 'Admin Two', email: 'admin2@farm.com', password, role: Role.ADMIN },
    ],
  });

  // 2. Create Vendors (at least 10)
  const vendors = [];
  for (let i = 0; i < 12; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password,
        role: Role.VENDOR,
        vendorProfile: {
          create: {
            farmName: `${faker.commerce.productAdjective()} Urban Farm`,
            certificationStatus: CertStatus.VERIFIED,
            farmLocation: faker.location.streetAddress(),
          },
        },
      },
      include: { vendorProfile: true },
    });
    if (user.vendorProfile) vendors.push(user.vendorProfile);
  }

  // 3. Create Customers
  for (let i = 0; i < 20; i++) {
    await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password,
        role: Role.CUSTOMER,
      },
    });
  }

  // 4. Create Products (at least 100)
  const categories = ['Seeds', 'Tools', 'Organic Fertilizer', 'Vegetables', 'Fruits'];
  for (let i = 0; i < 110; i++) {
    const vendor = faker.helpers.arrayElement(vendors);
    await prisma.produce.create({
      data: {
        vendorId: vendor.id,
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 5, max: 100 })),
        category: faker.helpers.arrayElement(categories),
        availableQuantity: faker.number.int({ min: 10, max: 100 }),
        certificationStatus: CertStatus.VERIFIED,
      },
    });
  }

  // 5. Create Rental Spaces
  for (const vendor of vendors) {
    await prisma.rentalSpace.create({
      data: {
        vendorId: vendor.id,
        location: vendor.farmLocation,
        size: `${faker.number.int({ min: 10, max: 50 })} sq ft`,
        price: parseFloat(faker.commerce.price({ min: 50, max: 500 })),
        availability: true,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
