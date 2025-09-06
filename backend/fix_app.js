const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Update the incorrect app record
  await prisma.app.updateMany({
    where: {
      OR: [
        { name: 'Go to a file' },
        { name: 'Go to File…' },
        { category: 'Other' }
      ]
    },
    data: {
      name: 'VS Code',
      category: 'Development',
      description: 'Visual Studio Code - IDE',
      iconColor: '#007ACC'
    }
  });

  console.log('Fixed VS Code app record');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });