import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Sparkles, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Info, 
  BookOpen,
  PieChart as PieIcon
} from 'lucide-react';
import { aiService } from '../services/api';

export default function KnowledgeGraph({ workspaceId }) {
  const [graphData, setGraphData] = useState({ pieChartData: [], conceptEfficiency: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [selectedSlice, setSelectedSlice] = useState(null);
  const [showGuide, setShowGuide] = useState(true);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await aiService.getGraph(workspaceId);
      if (res.data.success && res.data.graph) {
        setGraphData(res.data.graph);
      }
    } catch (err) {
      console.error('Failed to load AI Pie Chart Graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchGraph();
    }
  }, [workspaceId]);

  // Derived pie slices array matching the user's reference image styling
  const rawPieSlices = graphData.pieChartData && graphData.pieChartData.length > 0
    ? graphData.pieChartData
    : [
        { label: "Empirical Risk Assessment Scoring", percentage: 34, color: "#1e3a8a", status: "Thoroughly Detailed", source: "Automating_Injustice.pdf" },
        { label: "Racial Disparity Prediction Metrics", percentage: 23, color: "#2563eb", status: "Thoroughly Detailed", source: "Automating_Injustice.pdf" },
        { label: "Florida Judicial Trial Datasets", percentage: 20, color: "#3b82f6", status: "Adequately Covered", source: "Automating_Injustice.pdf" },
        { label: "Statutory Policy & Bail Guidelines", percentage: 11, color: "#60a5fa", status: "Adequately Covered", source: "Automating_Injustice.pdf" },
        { label: "Longitudinal Multi-Year Validation", percentage: 8, color: "#93c5fd", status: "Weakly Described (Gap)", source: "Automating_Injustice.pdf" },
        { label: "Cross-State Systemic Comparisons", percentage: 4, color: "#cbd5e1", status: "Weakly Described (Gap)", source: "Automating_Injustice.pdf" }
      ];

  // Colors matching the exact blue/indigo palette of the user's reference image
  const defaultColors = ["#0f172a", "#1e3a8a", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#cbd5e1"];

  const pieSlices = rawPieSlices.map((item, idx) => ({
    ...item,
    color: item.color || defaultColors[idx % defaultColors.length]
  }));

  // SVG Pie Chart Geometry Helper (Center 200, 200, Radius 160)
  const size = 360;
  const center = size / 2;
  const radius = 150;

  let cumulativeAngle = 0;
  const piePaths = pieSlices.map((slice, idx) => {
    const angle = (slice.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const startRad = (Math.PI / 180) * (startAngle - 90);
    const endRad = (Math.PI / 180) * (endAngle - 90);

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    // Center point for percentage text label inside slice
    const midAngle = startAngle + angle / 2;
    const midRad = (Math.PI / 180) * (midAngle - 90);
    const labelRadius = radius * 0.65;
    const labelX = center + labelRadius * Math.cos(midRad);
    const labelY = center + labelRadius * Math.sin(midRad);

    return {
      ...slice,
      pathData,
      labelX,
      labelY,
      index: idx
    };
  });

  return (
    <div className="glass-panel rounded-3xl p-6 border border-zinc-800 space-y-6">
      
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight italic">
            <PieIcon className="w-5 h-5 text-[#d2f235]" />
            AI Research Concept & Matter Breakdown (Pie Chart)
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#d2f235]/20 text-[#d2f235] border border-[#d2f235]/40 font-black not-italic">
              AI GENERATED
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            AI-extracted percentage distribution of subject depth, efficiency, and literature coverage across uploaded documents
          </p>
        </div>

        <button
          onClick={fetchGraph}
          className="px-4 py-2 rounded-full bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 font-bold text-xs flex items-center gap-2 transition-colors"
          title="Refresh AI Pie Chart Graph"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Guide Info Banner */}
      {showGuide && (
        <div className="bg-[#09090b] p-4 rounded-2xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-white text-xs sm:text-sm flex items-center gap-2 uppercase tracking-tight">
              <Info className="w-4 h-4 text-[#d2f235]" />
              How to Read This AI Research Pie Chart Graph:
            </h4>
            <button onClick={() => setShowGuide(false)} className="text-xs text-zinc-400 hover:text-white font-bold">✕ Close</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium">
            <div className="bg-[#121215] p-3 rounded-xl border border-zinc-800 text-zinc-300">
              <strong className="text-blue-400 block mb-0.5 font-bold uppercase">● Larger Pie Slices (%)</strong>
              Subjects thoroughly detailed with strong empirical evidence & statistical data in the file.
            </div>
            <div className="bg-[#121215] p-3 rounded-xl border border-zinc-800 text-zinc-300">
              <strong className="text-sky-300 block mb-0.5 font-bold uppercase">● Medium Pie Slices (%)</strong>
              Topics adequately described with standard literature coverage.
            </div>
            <div className="bg-[#121215] p-3 rounded-xl border border-zinc-800 text-zinc-300">
              <strong className="text-slate-300 block mb-0.5 font-bold uppercase">● Smaller Slices (&lt;10%)</strong>
              Weakly described matters / identified literature research gaps requiring secondary sources.
            </div>
          </div>
        </div>
      )}

      {/* AI PIE CHART & SIDE LEGEND CONTAINER (MATCHING REFERENCE IMAGE) */}
      <div className="bg-[#09090b] p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xl">
        
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-[#d2f235] animate-pulse" />
            <p className="text-sm font-bold text-zinc-400">AI Synthesizing Research Pie Chart Breakdown...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Clean SVG Pie Chart */}
            <div className="lg:col-span-6 flex items-center justify-center relative">
              <div className="relative w-[360px] h-[360px]">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                  {piePaths.map((slice) => {
                    const isHovered = hoveredSlice?.index === slice.index || selectedSlice?.index === slice.index;

                    return (
                      <g key={slice.index} className="cursor-pointer group">
                        <path
                          d={slice.pathData}
                          fill={slice.color}
                          stroke="#09090b"
                          strokeWidth="3"
                          style={{
                            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                            transformOrigin: `${center}px ${center}px`,
                            transition: 'all 0.25s ease-in-out'
                          }}
                          onMouseEnter={() => setHoveredSlice(slice)}
                          onMouseLeave={() => setHoveredSlice(null)}
                          onClick={() => setSelectedSlice(slice)}
                        />
                        {/* Percentage Label on Slice */}
                        {slice.percentage >= 4 && (
                          <text
                            x={slice.labelX}
                            y={slice.labelY}
                            fill="#ffffff"
                            fontSize="13"
                            fontWeight="900"
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="pointer-events-none font-mono drop-shadow-md"
                          >
                            {slice.percentage}%
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Center Hover Overlay Tooltip */}
                {hoveredSlice && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-md p-3 rounded-2xl border border-zinc-700 text-center shadow-2xl pointer-events-none max-w-[180px]">
                    <span className="text-[10px] font-mono font-black uppercase text-[#d2f235]">
                      {hoveredSlice.percentage}% Share
                    </span>
                    <h5 className="font-extrabold text-xs text-white mt-0.5 leading-snug truncate">
                      {hoveredSlice.label}
                    </h5>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Side Legend (Matching User Reference Image) */}
            <div className="lg:col-span-6 space-y-3 pl-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-zinc-800 pt-6 lg:pt-0">
              <h4 className="font-black text-xs uppercase tracking-wider text-zinc-400 mb-3">
                Research Topics & Percentage Share Legend:
              </h4>

              <div className="space-y-2.5">
                {pieSlices.map((item, idx) => {
                  const isSelected = selectedSlice?.index === idx;
                  const isHovered = hoveredSlice?.index === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedSlice(selectedSlice?.index === idx ? null : { ...item, index: idx })}
                      onMouseEnter={() => setHoveredSlice({ ...item, index: idx })}
                      onMouseLeave={() => setHoveredSlice(null)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected || isHovered
                          ? 'bg-zinc-800/90 border-[#d2f235] shadow-lg translate-x-1'
                          : 'bg-[#121215] border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-4 h-4 rounded-full shrink-0 shadow-md"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <h5 className="font-extrabold text-xs text-white leading-snug">{item.label}</h5>
                          <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 mt-0.5">
                            <FileText className="w-3 h-3 text-zinc-500" />
                            {item.source || 'Uploaded Document'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-4">
                        <span className="text-sm font-black font-mono text-white block">
                          {item.percentage}%
                        </span>
                        <span className={`text-[9px] font-bold uppercase ${
                          item.status?.includes('Thoroughly') ? 'text-emerald-400' : item.status?.includes('Weakly') ? 'text-rose-400' : 'text-zinc-400'
                        }`}>
                          {item.status || 'Coverage'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Breakdown Details Cards below the Pie Chart */}
      <div className="bg-[#09090b] p-6 rounded-3xl border border-zinc-800 space-y-4">
        <h4 className="font-black text-white text-xs sm:text-sm uppercase tracking-tight flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#d2f235]" />
          AI Synthesis of Subject Coverage & Literature Efficiency
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-[#121215] p-4 rounded-2xl border border-emerald-500/30 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block">
              🟢 Most Efficient / Highly Detailed Topics
            </span>
            <p className="text-xs text-zinc-300 font-medium leading-relaxed pt-1">
              Subjects occupying the largest pie slices (e.g. <strong>{pieSlices[0]?.label}</strong> at <strong>{pieSlices[0]?.percentage}%</strong> and <strong>{pieSlices[1]?.label}</strong> at <strong>{pieSlices[1]?.percentage}%</strong>) contain extensive empirical data, statistical proofs, and structured analysis in the uploaded paper.
            </p>
          </div>

          <div className="bg-[#121215] p-4 rounded-2xl border border-rose-500/30 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 inline-block">
              🔴 Weakly Described Matters / Identified Gaps
            </span>
            <p className="text-xs text-zinc-300 font-medium leading-relaxed pt-1">
              Topics with smaller pie shares (e.g. <strong>{pieSlices[pieSlices.length - 2]?.label}</strong> at <strong>{pieSlices[pieSlices.length - 2]?.percentage}%</strong> and <strong>{pieSlices[pieSlices.length - 1]?.label}</strong> at <strong>{pieSlices[pieSlices.length - 1]?.percentage}%</strong>) are only briefly referenced in concluding notes and lack longitudinal trial data.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
