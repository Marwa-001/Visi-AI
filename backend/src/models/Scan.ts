// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// /**
//  * @typedef {import('mongoose').Document} Document
//  */

// /**
//  * @typedef IScan
//  * @property {string} url
//  * @property {Date} timestamp
//  * @property {string} screenshot
//  * @property {object} scores
//  * @property {object} metrics
//  * @property {object} aiAnalysis
//  * @property {string[]} recommendations
//  * @property {any} heatmapData
//  */

// const ScanSchema = new Schema({
//   url: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now },
//   screenshot: { type: String },
//   scores: {
//     visualClarity: { type: Number, default: 0 },
//     accessibility: { type: Number, default: 0 },
//     readability: { type: Number, default: 0 },
//     reimagineUX: { type: Number, default: 0 },
//     focusAccuracy: { type: Number, default: 0 },
//     overall: { type: Number, default: 0 }
//   },
//   metrics: {
//     colorContrast: {
//       passAA: { type: Boolean, default: false },
//       passAAA: { type: Boolean, default: false },
//       issues: [String]
//     },
//     textReadability: {
//       fleschScore: { type: Number },
//       gradeLevel: { type: String },
//       issues: [String]
//     },
//     accessibility: {
//       missingAlt: { type: Number, default: 0 },
//       ariaIssues: { type: Number, default: 0 },
//       keyboardNav: { type: Boolean, default: false },
//       issues: [String]
//     },
//     reimagineWeb: { type: Schema.Types.Mixed }
//   },
//   aiAnalysis: {
//     visualIssues: [String],
//     layoutProblems: [String],
//     attentionZones: [Schema.Types.Mixed]
//   },
//   recommendations: [String],
//   heatmapData: { type: Schema.Types.Mixed }
// });

// module.exports = mongoose.model('Scan', ScanSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for TypeScript type safety
export interface IScan extends Document {
  url: string;
  timestamp: Date;
  screenshot?: string;
  scores?: {
    visualClarity?: number;
    accessibility?: number;
    readability?: number;
    reimagineUX?: number;
    focusAccuracy?: number;
    overall?: number;
  };
  metrics?: {
    colorContrast?: {
      passAA?: boolean;
      passAAA?: boolean;
      issues?: string[];
    };
    textReadability?: {
      fleschScore?: number;
      gradeLevel?: string;
      issues?: string[];
    };
    accessibility?: {
      missingAlt?: number;
      ariaIssues?: number;
      keyboardNav?: boolean;
      issues?: string[];
    };
    reimagineWeb?: any;
  };
  aiAnalysis?: {
    visualIssues?: string[];
    layoutProblems?: string[];
    attentionZones?: any[];
  };
  recommendations?: string[];
  heatmapData?: any;
}

const ScanSchema = new Schema<IScan>({
  url: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  screenshot: { type: String },
  scores: {
    visualClarity: { type: Number, default: 0 },
    accessibility: { type: Number, default: 0 },
    readability: { type: Number, default: 0 },
    reimagineUX: { type: Number, default: 0 },
    focusAccuracy: { type: Number, default: 0 },
    overall: { type: Number, default: 0 },
  },
  metrics: {
    colorContrast: {
      passAA: { type: Boolean, default: false },
      passAAA: { type: Boolean, default: false },
      issues: [String],
    },
    textReadability: {
      fleschScore: { type: Number },
      gradeLevel: { type: String },
      issues: [String],
    },
    accessibility: {
      missingAlt: { type: Number, default: 0 },
      ariaIssues: { type: Number, default: 0 },
      keyboardNav: { type: Boolean, default: false },
      issues: [String],
    },
    reimagineWeb: { type: Schema.Types.Mixed },
  },
  aiAnalysis: {
    visualIssues: [String],
    layoutProblems: [String],
    attentionZones: [Schema.Types.Mixed],
  },
  recommendations: [String],
  heatmapData: { type: Schema.Types.Mixed },
});

// ✅ Default export for ES Modules
const ScanModel: Model<IScan> = mongoose.model<IScan>('Scan', ScanSchema);
export default ScanModel;
