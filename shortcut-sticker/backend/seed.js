const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const appConfigs = {
  'VS Code': { category: 'Development', description: 'Visual Studio Code - Development', iconColor: '#007ACC' },
  'Photoshop': { category: 'Design', description: 'Adobe Photoshop', iconColor: '#31A8FF' },
  'IntelliJ': { category: 'Development', description: 'IntelliJ IDEA', iconColor: '#000000' },
  'Sublime': { category: 'Development', description: 'Sublime Text', iconColor: '#FF9800' },
  'RStudio': { category: 'Development', description: 'RStudio IDE', iconColor: '#75AADB' },
  'Vim': { category: 'Development', description: 'Vim Text Editor', iconColor: '#019733' }
};

async function main() {
  const csvDir = path.join(__dirname, '../../Shortcut_CSV');
  const csvFiles = fs.readdirSync(csvDir).filter(file => file.endsWith('.csv'));
  
  for (const csvFile of csvFiles) {
    const csvPath = path.join(csvDir, csvFile);
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV
    const lines = csvData.trim().split('\n');
    const shortcuts = lines.slice(1).map(line => {
      // Handle CSV with quoted values
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      return {
        shortcut: values[0] || '',
        description: (values[1] || '').replace(/"/g, ''),
        app: values[2] || '',
        platform: values[3] || 'cross-platform'
      };
    });

    // Filter out empty shortcuts
    const validShortcuts = shortcuts.filter(s => s.shortcut && s.description && s.app);
    if (validShortcuts.length === 0) continue;

    const appName = validShortcuts[0].app;
    const config = appConfigs[appName] || { category: 'Other', description: appName, iconColor: '#64748b' };

    // Create app if it doesn't exist
    const app = await prisma.app.upsert({
      where: { name: appName },
      update: {},
      create: {
        name: appName,
        category: config.category,
        description: config.description,
        iconColor: config.iconColor
      }
    });

    console.log(`Created/found app: ${app.name}`);

    // Create shortcuts (prevent duplicates)
    for (const shortcut of validShortcuts) {
      const existing = await prisma.shortcut.findFirst({
        where: {
          keys: shortcut.shortcut,
          appId: app.id,
          platform: shortcut.platform
        }
      });
      
      if (!existing) {
        await prisma.shortcut.create({
          data: {
            keys: shortcut.shortcut,
            description: shortcut.description,
            platform: shortcut.platform,
            appId: app.id
          }
        });
      }
    }

    console.log(`Created ${shortcuts.length} shortcuts for ${app.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });