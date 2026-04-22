const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('./auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all layouts for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const layouts = await prisma.layout.findMany({
      where: { userId: req.user.userId },
      orderBy: { updatedAt: 'desc' }
    });

    // Parse JSON data for each layout
    const layoutsWithData = layouts.map(layout => ({
      ...layout,
      data: JSON.parse(layout.data)
    }));

    res.json({ layouts: layoutsWithData });
  } catch (error) {
    console.error('Get layouts error:', error);
    res.status(500).json({ error: 'Failed to get layouts' });
  }
});

// Get single layout by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const layout = await prisma.layout.findUnique({
      where: { id: req.params.id }
    });

    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    // Check ownership
    if (layout.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      layout: {
        ...layout,
        data: JSON.parse(layout.data)
      }
    });
  } catch (error) {
    console.error('Get layout error:', error);
    res.status(500).json({ error: 'Failed to get layout' });
  }
});

// Create new layout
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, data } = req.body;

    if (!name || !data) {
      return res.status(400).json({ error: 'Name and data are required' });
    }

    // Validate data structure
    if (!data.layoutType || !data.imageSize || !data.textSize) {
      return res.status(400).json({ error: 'Invalid layout data structure' });
    }

    // Check layout limit (10 per user)
    const existingLayouts = await prisma.layout.count({
      where: { userId: req.user.userId }
    });

    if (existingLayouts >= 10) {
      return res.status(400).json({ error: 'Maximum 10 layouts allowed. Please delete an old layout first.' });
    }

    const layout = await prisma.layout.create({
      data: {
        name,
        data: JSON.stringify(data),
        userId: req.user.userId
      }
    });

    res.status(201).json({
      layout: {
        ...layout,
        data: JSON.parse(layout.data)
      }
    });
  } catch (error) {
    console.error('Create layout error:', error);
    res.status(500).json({ error: 'Failed to create layout' });
  }
});

// Update layout
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, data } = req.body;

    // Check if layout exists and user owns it
    const existingLayout = await prisma.layout.findUnique({
      where: { id: req.params.id }
    });

    if (!existingLayout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    if (existingLayout.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const layout = await prisma.layout.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(data && { data: JSON.stringify(data) })
      }
    });

    res.json({
      layout: {
        ...layout,
        data: JSON.parse(layout.data)
      }
    });
  } catch (error) {
    console.error('Update layout error:', error);
    res.status(500).json({ error: 'Failed to update layout' });
  }
});

// Delete layout
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if layout exists and user owns it
    const existingLayout = await prisma.layout.findUnique({
      where: { id: req.params.id }
    });

    if (!existingLayout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    if (existingLayout.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.layout.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Layout deleted successfully' });
  } catch (error) {
    console.error('Delete layout error:', error);
    res.status(500).json({ error: 'Failed to delete layout' });
  }
});

module.exports = router;
