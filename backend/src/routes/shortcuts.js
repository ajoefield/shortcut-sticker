const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

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

// Search shortcuts
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    const shortcuts = await prisma.shortcut.findMany({
      where: {
        OR: [
          { description: { contains: q, mode: 'insensitive' } },
          { keys: { contains: q, mode: 'insensitive' } },
          { app: { name: { contains: q, mode: 'insensitive' } } }
        ]
      },
      include: {
        app: true
      }
    });
    
    res.json(shortcuts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;