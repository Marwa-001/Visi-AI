


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
  scores: {
    overall: number;
    visualClarity?: number;
    accessibility?: number;
    readability?: number;
    reimagineUX?: number;
    focusAccuracy?: number;
  };
  recommendations?: string[];
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
            The World’s First <span>AI-Powered</span> <br /> Visual Clarity & Accessibility Platform
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

// import { useState, useEffect, useRef } from 'react';
// import { Eye, Activity, BarChart3, FileCheck, Globe, Zap, History, ExternalLink } from 'lucide-react';
// import h337 from 'heatmap.js'; // ✅ import
// import './visiai.css';

// const API_BASE_URL = 'http://localhost:5000/api';

// // Type definitions
// interface Scan {
//   _id?: string;
//   id?: string;
//   url: string;
//   timestamp: string;
//   scores: {
//     overall: number;
//     visualClarity?: number;
//     accessibility?: number;
//     readability?: number;
//     reimagineUX?: number;
//     focusAccuracy?: number;
//   };
//   recommendations?: string[];
//   heatmapData?: {
//     zones?: Array<{ x: number; y: number; intensity: number }>;
//   };
// }


// export default function VisiAI() {
//   const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'history'>('home');
//   const [url, setUrl] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [currentScan, setCurrentScan] = useState<Scan | null>(null);
//   const [scanHistory, setScanHistory] = useState<Scan[]>([]);
//   const [error, setError] = useState('');
// const [scans, setScans] = useState<Scan[]>([]);
//   const heatmapContainerRef = useRef<HTMLDivElement | null>(null);
//   const heatmapInstanceRef = useRef<any | null>(null);

//   // Fetch history when on History page
//   useEffect(() => {
//     if (currentPage === 'history') fetchHistory();
//   }, [currentPage]);

//   const fetchHistory = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/results`);
//       const data = await res.json();
//       if (data.success) setScanHistory(data.data);
//     } catch {
//       console.error('Failed to fetch history');
//     }
//   };

//   const handleScan = async () => {
//     if (!url) {
//       setError('Please enter a valid URL');
//       return;
//     }
//     setLoading(true);
//     setError('');
//     try {
//       const res = await fetch(`${API_BASE_URL}/scan`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ url }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         // ✅ Temporary: mock heatmap if backend doesn’t send it
//         if (!data.data.heatmapData) {
//           data.data.heatmapData = {
//             zones: [
//               { x: 150, y: 100, intensity: 0.9 },
//               { x: 300, y: 200, intensity: 0.6 },
//               { x: 500, y: 250, intensity: 0.4 },
//             ],
//           };
//         }

//         setCurrentScan(data.data);
//         setCurrentPage('dashboard');
//       } else setError(data.error || 'Scan failed');
//     } catch {
//       setError('Failed to connect to server.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const viewScan = async (id: string) => {
//     const res = await fetch(`${API_BASE_URL}/results/${id}`);
//     const data = await res.json();
//     if (data.success) {
//       setCurrentScan(data.data);
//       setCurrentPage('dashboard');
//     }
//   };

//   const deleteScan = async (id: string) => {
//     await fetch(`${API_BASE_URL}/results/${id}`, { method: 'DELETE' });
//     fetchHistory();
//   };

// useEffect(() => {
//     fetch("http://localhost:5000/api/scans")
//       .then(res => res.json())
//       .then(data => setScans(data))
//       .catch(err => console.error(err));
//   }, []);



//   // ✅ Create heatmap only after Dashboard is loaded
//   useEffect(() => {
//     if (!heatmapContainerRef.current || currentPage !== 'dashboard') return;

//     // Remove old instance
//     if (heatmapInstanceRef.current) {
//       try {
//         heatmapInstanceRef.current.remove();
//       } catch {}
//       heatmapInstanceRef.current = null;
//     }

//     // Create new instance
//     const instance = h337.create({
//       container: heatmapContainerRef.current,
//       radius: 50,
//       maxOpacity: 0.7,
//       minOpacity: 0.05,
//       blur: 0.85,
//       gradient: {
//         0.1: 'blue',
//         0.3: 'cyan',
//         0.5: 'lime',
//         0.7: 'yellow',
//         1.0: 'red',
//       },
//     });
//     heatmapInstanceRef.current = instance;
//   }, [currentPage]);

//   // ✅ Update heatmap when scan changes
//   useEffect(() => {
//     const instance = heatmapInstanceRef.current;
//     if (!instance || !currentScan?.heatmapData?.zones) return;

//     const zones = currentScan.heatmapData.zones;
//     if (!zones?.length) return;

//     const points = zones.map((z) => ({
//       x: Math.round(z.x),
//       y: Math.round(z.y),
//       value: Math.max(1, Math.round(z.intensity * 100)),
//     }));

//     instance.setData({ max: 100, data: points });
//   }, [currentScan]);

//   return (
//     <div className="min-h-screen">
//       {/* Navbar */}
//       <nav>
//         <div className="nav-container">
//           <div className="nav-title">
//             <Eye size={28} />
//             <span>VisiAI</span>
//           </div>
//           <div className="nav-buttons">
//             <button className={currentPage === 'home' ? 'active' : ''} onClick={() => setCurrentPage('home')}>
//               Home
//             </button>
//             <button className={currentPage === 'history' ? 'active' : ''} onClick={() => setCurrentPage('history')}>
//               <History size={16} /> History
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Home Page */}
//       {currentPage === 'home' && (
//         <div className="hero">
//           <h1>
//             The World’s First <span>AI-Powered</span> <br /> Visual Clarity & Accessibility Platform
//           </h1>
//           <p>
//             Analyze any website's visual clarity, readability, and accessibility using advanced AI vision models.
//           </p>

//           <div className="input-box">
//             <h2>Enter Website URL</h2>
//             <input
//               type="url"
//               placeholder="https://example.com"
//               value={url}
//               onChange={(e) => setUrl(e.target.value)}
//               disabled={loading}
//             />
//             {error && <div className="error">{error}</div>}
//             <button className="analyze-btn" onClick={handleScan} disabled={loading}>
//               {loading ? 'Analyzing...' : 'Analyze Website'}
//             </button>
//           </div>

//           <div className="features">
//             <div className="feature-card">
//               <Eye size={28} />
//               <h3>AI Vision Analysis</h3>
//               <p>Analyzes website clarity, layout, and design patterns.</p>
//             </div>
//             <div className="feature-card">
//               <Activity size={28} />
//               <h3>Accessibility Check</h3>
//               <p>WCAG compliance testing for better accessibility.</p>
//             </div>
//             <div className="feature-card">
//               <BarChart3 size={28} />
//               <h3>Readability Score</h3>
//               <p>Analyzes how easy your text is to read.</p>
//             </div>
//             <div className="feature-card">
//               <FileCheck size={28} />
//               <h3>Reimagine UX</h3>
//               <p>Professional UX metrics for modern design.</p>
//             </div>
//             <div className="feature-card">
//               <Globe size={28} />
//               <h3>Cognitive Heatmap</h3>
//               <p>Shows where users focus their attention.</p>
//             </div>
//             <div className="feature-card">
//               <Zap size={28} />
//               <h3>AI Recommendations</h3>
//               <p>Actionable insights to boost your performance.</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Dashboard */}
//       {currentPage === 'dashboard' && currentScan && (
//         <div className="dashboard">
//           <div className="card">
//             <h2>Visual Health Report</h2>
//             <a href={currentScan.url} target="_blank" rel="noreferrer">
//               {currentScan.url} <ExternalLink size={14} />
//             </a>
//             <p>Analyzed: {new Date(currentScan.timestamp).toLocaleString()}</p>
//             <h1 style={{ color: '#4f46e5' }}>{currentScan.scores.overall}</h1>
//             <p>Overall Score</p>
//           </div>

//           <div className="score-grid">
//             <div className="score-card"><h4>Visual Clarity</h4><div className="value">{currentScan.scores.visualClarity}</div></div>
//             <div className="score-card"><h4>Accessibility</h4><div className="value">{currentScan.scores.accessibility}</div></div>
//             <div className="score-card"><h4>Readability</h4><div className="value">{currentScan.scores.readability}</div></div>
//             <div className="score-card"><h4>Reimagine UX</h4><div className="value">{currentScan.scores.reimagineUX}</div></div>
//             <div className="score-card"><h4>Focus Accuracy</h4><div className="value">{currentScan.scores.focusAccuracy}</div></div>
//           </div>
//  <div>
//       {scans.length === 0 ? (
//         <p>No scans yet</p>
//       ) : (
//         scans.map((scan: Scan) => (
//           <div key={scan.id}>
//             {scan.url} - {scan.timestamp}
//           </div>
//         ))
//       )}
//     </div>
//           {/* ✅ Heatmap section */}
//           <div className="card">
//             <h3>Visual Attention Heatmap</h3>
//             <div
//               ref={heatmapContainerRef}
//               id="heatmapContainer"
//               style={{
//                 width: '100%',
//                 height: '400px',
//                 position: 'relative',
//                 borderRadius: '8px',
//                 overflow: 'hidden',
//                 backgroundColor: '#f9fafb',
//               }}
//             ></div>
//           </div>

//           {currentScan.recommendations && (
//             <div className="card recommendations">
//               <h3>AI Recommendations</h3>
//               <ul>{currentScan.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul>
//             </div>
//           )}
//         </div>
//       )}

//       {/* History */}
//       {currentPage === 'history' && (
//         <div className="dashboard">
//           {scanHistory.length === 0 ? (
//             <p>No scans yet.</p>
//           ) : (
//             scanHistory.map((s) => (
//               <div key={s._id} className="history-item">
//                 <span>{s.url}</span>
//                 <div>
//                   <button className="view-btn" onClick={() => viewScan(s._id!)}>View</button>
//                   <button className="delete-btn" onClick={() => deleteScan(s._id!)}>Delete</button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   );


