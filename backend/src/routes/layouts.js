const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT (simplified for now)
const auth = (req, res, next) => {
  // TODO: Add proper JWT verification
  req.userId = 'temp-user-id'; // Placeholder
  next();
};

// Get user's layouts
router.get('/my-layouts', auth, async (req, res) => {
  try {
    const layouts = await prisma.layout.findMany({
      where: { userId: req.userId },
      include: {
        shortcuts: {
          include: {
            shortcut: {
              include: {
                app: true
              }
            }
          }
        }
      }
    });
    res.json(layouts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new layout
router.post('/create', auth, async (req, res) => {
  try {
    const { name, size, shortcuts } = req.body;
    
    const layout = await prisma.layout.create({
      data: {
        name,
        size,
        userId: req.userId,
        shortcuts: {
          create: shortcuts.map((shortcut, index) => ({
            position: index,
            shortcutId: shortcut.id
          }))
        }
      }
    });
    
    res.status(201).json(layout);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;