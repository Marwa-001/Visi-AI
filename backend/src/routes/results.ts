// const express = require('express');
// const Scan = require('../models/Scan');
// import type { Request, Response } from 'express';
// import Router = require('express');

// const router = express.Router();

// // GET all results
// router.get('/', async (req: Request, res: Response) => {
//   try {
//     const limit = parseInt(req.query.limit as string) || 20;
//     const page = parseInt(req.query.page as string) || 1;
//     const skip = (page - 1) * limit;

//     const scans = await Scan.find()
//       .sort({ timestamp: -1 })
//       .limit(limit)
//       .skip(skip)
//       .select('-screenshot'); // Exclude screenshot for performance

//     const total = await Scan.countDocuments();

//     res.json({
//       success: true,
//       data: scans,
//       pagination: {
//         total,
//         page,
//         limit,
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       error: 'Failed to fetch results',
//       message: error.message
//     });
//   }
// });

// // GET single result by ID
// router.get('/:id', async (req: Request, res: Response) => {
//   try {
//     const scan = await Scan.findById(req.params.id);

//     if (!scan) {
//       return res.status(404).json({ error: 'Scan not found' });
//     }

//     res.json({
//       success: true,
//       data: scan
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       error: 'Failed to fetch result',
//       message: error.message
//     });
//   }
// });

// // DELETE a result
// router.delete('/:id', async (req: Request, res: Response) => {
//   try {
//     const scan = await Scan.findByIdAndDelete(req.params.id);

//     if (!scan) {
//       return res.status(404).json({ error: 'Scan not found' });
//     }

//     res.json({
//       success: true,
//       message: 'Scan deleted successfully'
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       error: 'Failed to delete result',
//       message: error.message
//     });
//   }
// });

// module.exports = Router;
import express, { Router, Request, Response } from 'express';
import ScanModel from '../models/Scan.js';


const router: Router = express.Router();

// GET all results
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const scans = await ScanModel.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .select('-screenshot');

    const total = await ScanModel.countDocuments();

    res.json({
      success: true,
      data: scans,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch results',
      message: error.message,
    });
  }
});

// GET single result
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const scan = await ScanModel.findById(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });

    res.json({ success: true, data: scan });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch result',
      message: error.message,
    });
  }
});

// DELETE a result
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const scan = await ScanModel.findByIdAndDelete(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });

    res.json({ success: true, message: 'Scan deleted successfully' });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to delete result',
      message: error.message,
    });
  }
});

// ✅ Default export for ES Modules
export default router;
