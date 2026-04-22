#!/usr/bin/env node
/**
 * Database Loader for Shortcut Sticker
 * Loads extracted shortcuts from CSV files into PostgreSQL via Prisma
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Initialize Prisma client (uses existing backend configuration)
const prisma = new PrismaClient();

// App configurations with categories and colors
const appConfigs = {
  'vs_code': { 
    name: 'VS Code', 
    category: 'Development', 
    description: 'Visual Studio Code - Code Editor', 
    iconColor: '#007ACC' 
  },
  'intellij_idea': { 
    name: 'IntelliJ IDEA', 
    category: 'Development', 
    description: 'IntelliJ IDEA - Java IDE', 
    iconColor: '#000000' 
  },
  'sublime_text': { 
    name: 'Sublime Text', 
    category: 'Development', 
    description: 'Sublime Text - Text Editor', 
    iconColor: '#FF9800' 
  },
  'rstudio': { 
    name: 'RStudio', 
    category: 'Development', 
    description: 'RStudio - R IDE', 
    iconColor: '#75AADB' 
  },
  'vim': { 
    name: 'Vim', 
    category: 'Development', 
    description: 'Vim - Text Editor', 
    iconColor: '#019733' 
  },
  'docker': { 
    name: 'Docker', 
    category: 'DevOps', 
    description: 'Docker - Containerization', 
    iconColor: '#2496ED' 
  },
  'jupyterlab': { 
    name: 'JupyterLab', 
    category: 'Development', 
    description: 'JupyterLab - Data Science IDE', 
    iconColor: '#F37626' 
  },
  'kiro': { 
    name: 'Kiro', 
    category: 'Development', 
    description: 'Kiro - AI IDE', 
    iconColor: '#6366F1' 
  },
  'macos': { 
    name: 'macOS', 
    category: 'System', 
    description: 'macOS - System Shortcuts', 
    iconColor: '#000000' 
  }
};

// Platform mapping
const platformMapping = {
  'windows': 'windows',
  'macos': 'mac',
  'osa': 'both',
  'unknown': 'both'
};

class DatabaseLoader {
  constructor() {
    this.csvFolder = path.join(__dirname, '../../output', 'csv_exports', 'latest');
    this.stats = {
      appsCreated: 0,
      shortcutsCreated: 0,
      shortcutsSkipped: 0,
      errors: 0
    };
  }

  async loadShortcuts() {
    console.log('🚀 Starting Database Load');
    console.log('=' * 50);
    
    try {
      // Check if CSV folder exists
      if (!fs.existsSync(this.csvFolder)) {
        throw new Error(`CSV folder not found: ${this.csvFolder}`);
      }

      // Get all CSV files
      const csvFiles = fs.readdirSync(this.csvFolder)
        .filter(file => file.endsWith('_shortcuts_latest.csv'));

      if (csvFiles.length === 0) {
        throw new Error(`No CSV files found in ${this.csvFolder}`);
      }

      console.log(`📁 Found ${csvFiles.length} CSV files to process`);

      // Process each CSV file
      for (const csvFile of csvFiles) {
        await this.processCsvFile(csvFile);
      }

      // Print summary
      this.printSummary();

    } catch (error) {
      console.error('❌ Database loading failed:', error.message);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  async processCsvFile(csvFile) {
    const csvPath = path.join(this.csvFolder, csvFile);
    
    // Extract app name and platform from filename
    // Format: appname_platform_shortcuts_latest.csv
    const filenameParts = csvFile.replace('_shortcuts_latest.csv', '').split('_');
    const platform = filenameParts.pop(); // Last part is platform
    const appKey = filenameParts.join('_'); // Rest is app name
    
    console.log(`\n📄 Processing: ${csvFile}`);
    console.log(`   App: ${appKey}, Platform: ${platform}`);

    try {
      // Get or create app configuration
      const appConfig = appConfigs[appKey] || {
        name: this.formatAppName(appKey),
        category: 'Other',
        description: this.formatAppName(appKey),
        iconColor: '#64748b'
      };

      // Create or update app in database
      const app = await prisma.app.upsert({
        where: { name: appConfig.name },
        update: {
          category: appConfig.category,
          description: appConfig.description,
          iconColor: appConfig.iconColor
        },
        create: {
          name: appConfig.name,
          category: appConfig.category,
          description: appConfig.description,
          iconColor: appConfig.iconColor
        }
      });

      console.log(`   ✅ App: ${app.name} (${app.category})`);
      if (!await this.appExists(app.name)) {
        this.stats.appsCreated++;
      }

      // Read and process shortcuts from CSV
      const shortcuts = await this.readCsvFile(csvPath);
      
      let shortcutsCreated = 0;
      let shortcutsSkipped = 0;

      for (const shortcut of shortcuts) {
        try {
          // Map platform
          const mappedPlatform = platformMapping[platform] || 'both';
          
          // Check if shortcut already exists
          const existing = await prisma.shortcut.findFirst({
            where: {
              keys: shortcut.key_combination,
              appId: app.id,
              platform: mappedPlatform
            }
          });

          if (existing) {
            shortcutsSkipped++;
            continue;
          }

          // Create new shortcut
          await prisma.shortcut.create({
            data: {
              keys: shortcut.key_combination,
              description: shortcut.title,
              platform: mappedPlatform,
              appId: app.id
            }
          });

          shortcutsCreated++;
          this.stats.shortcutsCreated++;

        } catch (error) {
          console.error(`   ⚠️  Error creating shortcut: ${error.message}`);
          this.stats.errors++;
        }
      }

      console.log(`   📊 Created: ${shortcutsCreated}, Skipped: ${shortcutsSkipped} shortcuts`);
      this.stats.shortcutsSkipped += shortcutsSkipped;

    } catch (error) {
      console.error(`   ❌ Error processing ${csvFile}: ${error.message}`);
      this.stats.errors++;
    }
  }

  async readCsvFile(csvPath) {
    return new Promise((resolve, reject) => {
      const shortcuts = [];
      
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Validate required fields
          if (row.key_combination && row.title && row.application_name) {
            shortcuts.push({
              key_combination: row.key_combination.trim(),
              title: row.title.trim(),
              description: row.description ? row.description.trim() : row.title.trim(),
              application_name: row.application_name.trim(),
              platform: row.platform ? row.platform.trim() : 'both'
            });
          }
        })
        .on('end', () => {
          resolve(shortcuts);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async appExists(appName) {
    const existing = await prisma.app.findUnique({
      where: { name: appName }
    });
    return !!existing;
  }

  formatAppName(appKey) {
    // Convert app_key to "App Key" format
    return appKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 DATABASE LOADING SUMMARY');
    console.log('='.repeat(50));
    console.log(`📱 Apps created/updated: ${this.stats.appsCreated}`);
    console.log(`✅ Shortcuts created: ${this.stats.shortcutsCreated}`);
    console.log(`⏭️  Shortcuts skipped (duplicates): ${this.stats.shortcutsSkipped}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`🎯 Success rate: ${((this.stats.shortcutsCreated / (this.stats.shortcutsCreated + this.stats.errors)) * 100).toFixed(1)}%`);
  }

  async clearDatabase() {
    console.log('🧹 Clearing existing shortcuts and apps...');
    
    // Delete in correct order due to foreign key constraints
    await prisma.layoutShortcut.deleteMany();
    await prisma.shortcut.deleteMany();
    await prisma.app.deleteMany();
    
    console.log('   ✅ Database cleared');
  }

  async verifyDatabase() {
    console.log('\n🔍 Verifying database...');
    
    const appCount = await prisma.app.count();
    const shortcutCount = await prisma.shortcut.count();
    
    console.log(`   📱 Apps in database: ${appCount}`);
    console.log(`   ⌨️  Shortcuts in database: ${shortcutCount}`);
    
    // Show breakdown by app
    const apps = await prisma.app.findMany({
      include: {
        _count: {
          select: { shortcuts: true }
        }
      }
    });
    
    console.log('\n   📊 Shortcuts by app:');
    apps.forEach(app => {
      console.log(`      ${app.name}: ${app._count.shortcuts} shortcuts`);
    });
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'load';
  
  const loader = new DatabaseLoader();
  
  try {
    switch (command) {
      case 'load':
        await loader.loadShortcuts();
        await loader.verifyDatabase();
        break;
        
      case 'clear':
        await loader.clearDatabase();
        console.log('✅ Database cleared successfully');
        break;
        
      case 'reload':
        await loader.clearDatabase();
        await loader.loadShortcuts();
        await loader.verifyDatabase();
        break;
        
      case 'verify':
        await loader.verifyDatabase();
        break;
        
      default:
        console.log('Usage: node database_loader.js [load|clear|reload|verify]');
        console.log('  load   - Load CSV files into database (default)');
        console.log('  clear  - Clear all shortcuts and apps');
        console.log('  reload - Clear database and reload from CSV');
        console.log('  verify - Check database contents');
        process.exit(1);
    }
    
    console.log('\n🎉 Database operation completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Database operation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DatabaseLoader;