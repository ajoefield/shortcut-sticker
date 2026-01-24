const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get shortcuts with search functionality
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let shortcuts;
    
    if (search) {
      // Get all shortcuts with app info
      const allShortcuts = await prisma.shortcut.findMany({
        include: {
          app: true
        }
      });
      
      // Filter in JavaScript for more flexible search
      const searchLower = search.toLowerCase();
      shortcuts = allShortcuts.filter(shortcut => {
        const appName = shortcut.app?.name?.toLowerCase() || '';
        const description = shortcut.description?.toLowerCase() || '';
        const keys = shortcut.keys?.toLowerCase() || '';
        
        return appName.includes(searchLower) || 
               description.includes(searchLower) || 
               keys.includes(searchLower);
      });
    } else {
      shortcuts = await prisma.shortcut.findMany({
        include: {
          app: true
        }
      });
    }
    
    // Format for frontend
    const formattedShortcuts = shortcuts.map(shortcut => ({
      app: shortcut.app.name,
      command: shortcut.description,
      key: shortcut.keys,
      platform: shortcut.platform
    }));
    
    res.json(formattedShortcuts);
  } catch (error) {
    console.error('Error fetching shortcuts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all apps with shortcuts
router.get('/apps', async (req, res) => {
  try {
    const apps = await prisma.app.findMany({
      include: {
        shortcuts: true
      }
    });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;