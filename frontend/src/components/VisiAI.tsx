import { useState, useEffect } from 'react';
import { Eye, Activity, BarChart3, FileCheck, Globe, Zap, History, ExternalLink } from 'lucide-react';
import './visiai.css';

const API_BASE_URL = 'http://localhost:5000/api';

// Type definitions
interface Scan {
  _id?: string;
  id?: string;
  url: string;
  timestamp: string;
  screenshot?: string;
  scores: {
    overall: number;
    visualClarity?: number;
    accessibility?: number;
    readability?: number;
    reimagineUX?: number;
    focusAccuracy?: number;
  };
  recommendations?: string[];
  heatmapData?: {
    zones?: Array<{ x: number; y: number; intensity: number; area?: string }>;
  };
  aiAnalysis?: {
    visualIssues?: string[];
    layoutProblems?: string[];
    attentionZones?: Array<{ x: number; y: number; intensity: number; area?: string }>;
  };
  metrics?: {
    colorContrast?: {
      passAA: boolean;
      passAAA: boolean;
    };
    accessibility?: {
      missingAlt: number;
      ariaIssues: number;
      keyboardNav: boolean;
      issues?: string[];
    };
    textReadability?: {
      fleschScore: number;
      gradeLevel: string;
      issues?: string[];
    };
  };
}

export default function VisiAI() {
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'history'>('home');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const [scanHistory, setScanHistory] = useState<Scan[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentPage === 'history') fetchHistory();
  }, [currentPage]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/results`);
      const data = await res.json();
      if (data.success) setScanHistory(data.data);
    } catch {
      console.error('Failed to fetch history');
    }
  };

  const handleScan = async () => {
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentScan(data.data);
        setCurrentPage('dashboard');
      } else setError(data.error || 'Scan failed');
    } catch {
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const viewScan = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/results/${id}`);
    const data = await res.json();
    if (data.success) {
      setCurrentScan(data.data);
      setCurrentPage('dashboard');
    }
  };

  const deleteScan = async (id: string) => {
    await fetch(`${API_BASE_URL}/results/${id}`, { method: 'DELETE' });
    fetchHistory();
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav>
        <div className="nav-container">
          <div className="nav-title">
            <Eye size={28} />
            <span>VisiAI</span>
          </div>
          <div className="nav-buttons">
            <button
              className={currentPage === 'home' ? 'active' : ''}
              onClick={() => setCurrentPage('home')}
            >
              Home
            </button>
            <button
              className={currentPage === 'history' ? 'active' : ''}
              onClick={() => setCurrentPage('history')}
            >
              <History size={16} /> History
            </button>
          </div>
        </div>
      </nav>

      {/* Pages */}
      {currentPage === 'home' && (
        <div className="hero">
          <h1>
            The World's First <span>AI-Powered</span> <br /> Visual Clarity & Accessibility Platform
          </h1>
          <p>
            Analyze any website's visual clarity, readability, and accessibility using advanced AI vision models.
          </p>

          <div className="input-box">
            <h2>Enter Website URL</h2>
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            {error && <div className="error">{error}</div>}
            <button className="analyze-btn" onClick={handleScan} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Website'}
            </button>
          </div>

          <div className="features">
            <div className="feature-card">
              <Eye size={28} />
              <h3>AI Vision Analysis</h3>
              <p>Analyzes website clarity, layout, and design patterns.</p>
            </div>
            <div className="feature-card">
              <Activity size={28} />
              <h3>Accessibility Check</h3>
              <p>WCAG compliance testing for better accessibility.</p>
            </div>
            <div className="feature-card">
              <BarChart3 size={28} />
              <h3>Readability Score</h3>
              <p>Analyzes how easy your text is to read.</p>
            </div>
            <div className="feature-card">
              <FileCheck size={28} />
              <h3>Reimagine UX</h3>
              <p>Professional UX metrics for modern design.</p>
            </div>
            <div className="feature-card">
              <Globe size={28} />
              <h3>Cognitive Heatmap</h3>
              <p>Shows where users focus their attention.</p>
            </div>
            <div className="feature-card">
              <Zap size={28} />
              <h3>AI Recommendations</h3>
              <p>Actionable insights to boost your performance.</p>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'dashboard' && currentScan && (
        <div className="dashboard">
          <div className="card">
            <h2>Visual Health Report</h2>
            <a href={currentScan.url} target="_blank" rel="noreferrer">
              {currentScan.url} <ExternalLink size={14} />
            </a>
            <p>Analyzed: {new Date(currentScan.timestamp).toLocaleString()}</p>
            
            {/* ✅ Screenshot Display */}
            {currentScan.screenshot && (
              <div style={{ marginTop: '1rem', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <img 
                  src={currentScan.screenshot} 
                  alt="Website Screenshot" 
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                />
              </div>
            )}
            
            <h1 style={{ color: '#4f46e5' }}>{currentScan.scores.overall}</h1>
            <p>Overall Score</p>
          </div>

          <div className="score-grid">
            <div className="score-card">
              <h4>Visual Clarity</h4>
              <div className="value">{currentScan.scores.visualClarity}</div>
            </div>
            <div className="score-card">
              <h4>Accessibility</h4>
              <div className="value">{currentScan.scores.accessibility}</div>
            </div>
            <div className="score-card">
              <h4>Readability</h4>
              <div className="value">{currentScan.scores.readability}</div>
            </div>
            <div className="score-card">
              <h4>Reimagine UX</h4>
              <div className="value">{currentScan.scores.reimagineUX}</div>
            </div>
            <div className="score-card">
              <h4>Focus Accuracy</h4>
              <div className="value">{currentScan.scores.focusAccuracy}</div>
            </div>
          </div>

          {/* ✅ AI VISION ANALYSIS - NEW SECTION */}
          {currentScan.aiAnalysis && (
            <div className="card">
              <h3>🤖 AI Vision Analysis</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                
                {/* Visual Issues */}
                <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '8px', borderLeft: '4px solid #dc2626' }}>
                  <h4 style={{ marginTop: 0, color: '#991b1b' }}>👁️ Visual Issues Detected</h4>
                  {currentScan.aiAnalysis.visualIssues && currentScan.aiAnalysis.visualIssues.length > 0 ? (
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                      {currentScan.aiAnalysis.visualIssues.map((issue: string, i: number) => (
                        <li key={i} style={{ margin: '0.25rem 0', color: '#7f1d1d' }}>{issue}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#7f1d1d', margin: '0.5rem 0' }}>✅ No major visual issues detected</p>
                  )}
                </div>
                
                {/* Layout Problems */}
                <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                  <h4 style={{ marginTop: 0, color: '#92400e' }}>📐 Layout Problems</h4>
                  {currentScan.aiAnalysis.layoutProblems && currentScan.aiAnalysis.layoutProblems.length > 0 ? (
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                      {currentScan.aiAnalysis.layoutProblems.map((problem: string, i: number) => (
                        <li key={i} style={{ margin: '0.25rem 0', color: '#78350f' }}>{problem}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#78350f', margin: '0.5rem 0' }}>✅ Layout looks good</p>
                  )}
                </div>
                
              </div>
              
              {/* Attention Zones Summary */}
              {currentScan.aiAnalysis.attentionZones && currentScan.aiAnalysis.attentionZones.length > 0 && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#dbeafe', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <h4 style={{ marginTop: 0, color: '#1e40af' }}>🎯 Attention Zones Detected</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {currentScan.aiAnalysis.attentionZones.map((zone: any, i: number) => (
                      <div key={i} style={{ 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        padding: '0.75rem', 
                        borderRadius: '6px',
                        textAlign: 'center',
                        color: '#1e40af'
                      }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{zone.area || `Zone ${i + 1}`}</div>
                        <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          Intensity: {Math.round(zone.intensity * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentScan.recommendations && (
            <div className="card recommendations">
              <h3>AI Recommendations</h3>
              <ul>
                {currentScan.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ✅ Heatmap Visualization */}
          {currentScan.heatmapData && currentScan.heatmapData.zones && (
            <div className="card">
              <h3>Visual Attention Heatmap</h3>
              <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.95rem' }}>
                Shows where users typically focus their attention on this page
              </p>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '400px',
                background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                {currentScan.heatmapData.zones.map((zone: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${zone.x}%`,
                      top: `${zone.y}%`,
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle, rgba(255, 0, 0, ${zone.intensity * 0.7}) 0%, rgba(255, 0, 0, 0) 70%)`,
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      filter: 'blur(20px)'
                    }}
                  />
                ))}
                
                {/* Legend */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: '15px', 
                  right: '15px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Attention Level</div>
                  <div><span style={{ color: '#dc2626', fontSize: '1.2rem' }}>●</span> High</div>
                  <div><span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>●</span> Medium</div>
                  <div><span style={{ color: '#3b82f6', fontSize: '1.2rem' }}>●</span> Low</div>
                </div>
                
                {/* Zone labels */}
                {currentScan.heatmapData.zones.map((zone: any, i: number) => (
                  zone.area && (
                    <div
                      key={`label-${i}`}
                      style={{
                        position: 'absolute',
                        left: `${zone.x}%`,
                        top: `${zone.y}%`,
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        zIndex: 10
                      }}
                    >
                      {zone.area}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* ✅ Detailed Metrics Breakdown */}
          {currentScan.metrics && (
            <div className="card">
              <h3>Detailed Analysis</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                
                {/* Color Contrast */}
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <h4 style={{ marginTop: 0, color: '#4f46e5' }}>🎨 Color Contrast</h4>
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>WCAG AA:</strong> {currentScan.metrics.colorContrast?.passAA ? '✅ Pass' : '❌ Fail'}
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>WCAG AAA:</strong> {currentScan.metrics.colorContrast?.passAAA ? '✅ Pass' : '❌ Fail'}
                    </p>
                  </div>
                </div>
                
                {/* Accessibility Details */}
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <h4 style={{ marginTop: 0, color: '#4f46e5' }}>♿ Accessibility</h4>
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Missing Alt Text:</strong> {currentScan.metrics.accessibility?.missingAlt || 0} images
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>ARIA Issues:</strong> {currentScan.metrics.accessibility?.ariaIssues || 0}
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Keyboard Nav:</strong> {currentScan.metrics.accessibility?.keyboardNav ? '✅ Good' : '⚠️ Needs Improvement'}
                    </p>
                  </div>
                </div>
                
                {/* Readability Details */}
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <h4 style={{ marginTop: 0, color: '#4f46e5' }}>📖 Readability</h4>
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Flesch Score:</strong> {currentScan.metrics.textReadability?.fleschScore?.toFixed(1) || 'N/A'}
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Grade Level:</strong> {currentScan.metrics.textReadability?.gradeLevel || 'N/A'}
                    </p>
                  </div>
                </div>
                
              </div>
              
              {/* Accessibility Issues List */}
              {currentScan.metrics.accessibility?.issues && currentScan.metrics.accessibility.issues.length > 0 && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                  <h4 style={{ marginTop: 0, color: '#92400e' }}>⚠️ Accessibility Issues Found</h4>
                  <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                    {currentScan.metrics.accessibility.issues.map((issue: string, i: number) => (
                      <li key={i} style={{ margin: '0.25rem 0', color: '#78350f' }}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Readability Issues List */}
              {currentScan.metrics.textReadability?.issues && currentScan.metrics.textReadability.issues.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#dbeafe', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <h4 style={{ marginTop: 0, color: '#1e40af' }}>📝 Readability Issues Found</h4>
                  <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                    {currentScan.metrics.textReadability.issues.map((issue: string, i: number) => (
                      <li key={i} style={{ margin: '0.25rem 0', color: '#1e3a8a' }}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {currentPage === 'history' && (
        <div className="dashboard">
          {scanHistory.length === 0 ? (
            <p>No scans yet.</p>
          ) : (
            scanHistory.map((s) => (
              <div key={s._id} className="history-item">
                <span>{s.url}</span>
                <div>
                  <button className="view-btn" onClick={() => viewScan(s._id!)}>View</button>
                  <button className="delete-btn" onClick={() => deleteScan(s._id!)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}