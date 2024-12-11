const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create some dummy users
  await prisma.user.createMany({
    data: [
      { 
        username: "alice123", 
        password: "hashed_password" 
      },
      { 
        username: "bob456", 
        password: "hashed_password" 
      },
    ],
  });

  // Create some dummy items
  await prisma.item.createMany({
    data: [
      { 
        name: "Laptop", 
        details: "A high-performance laptop" 
      },
      { 
        name: "Smartphone", 
        details: "A smartphone with excellent camera quality" 
      },
    ],
  });

  // Create some dummy reviews
  const users = await prisma.user.findMany();
  const items = await prisma.item.findMany();

  await prisma.review.createMany({
    data: [
      { 
        content: "Great product!", 
        rating: 5, 
        userId: users[0].id, 
        itemId: items[0].id 
      },
      { 
        content: "Not bad", 
        rating: 3, 
        userId: users[1].id, 
        itemId: items[1].id 
      },
    ],
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });