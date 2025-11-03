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
      // Smart search with word boundaries and relevance
      const searchWords = search.toLowerCase().split(' ').filter(word => word.length > 0);
      
      shortcuts = await prisma.shortcut.findMany({
        where: {
          OR: [
            // Exact word matches in description
            ...searchWords.map(word => ({
              description: {
                contains: ` ${word} `,
                mode: 'insensitive'
              }
            })),
            // Word at start of description
            ...searchWords.map(word => ({
              description: {
                startsWith: word,
                mode: 'insensitive'
              }
            })),
            // Exact key matches
            { keys: { equals: search, mode: 'insensitive' } },
            // App name matches
            { app: { name: { contains: search, mode: 'insensitive' } } }
          ]
        },
        include: {
          app: true
        }
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