import React, { useState } from 'react';
import { Candidate } from '../../types';
import { getHRCandidates } from '../../services/workforceService';
import { analyzeResume, ResumeAnalysisResult } from '../../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { BackButton } from '../ui/BackButton';
import { 
  CheckCircle2, 
  FileText, 
  UploadCloud, 
  Loader2, 
  Briefcase,
  ArrowRight,
  Filter,
  Sparkles,
  X,
  TrendingUp,
  AlertCircle,
  EyeOff,
  ShieldCheck,
  UserPlus,
  UserMinus,
  ListChecks
} from 'lucide-react';

export const HRRecruitment: React.FC = () => {
  // --- EXISTING AI AGENT STATE ---
  const [jobDescription, setJobDescription] = useState('');
  const [isJobSet, setIsJobSet] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>(getHRCandidates());
  const [isAnonymized, setIsAnonymized] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SCREENING' | 'INTERVIEW'>('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // --- NEW: LIFECYCLE & JOBS STATE ---
  const [activeModule, setActiveModule] = useState<'PIPELINE' | 'LIFECYCLE'>('PIPELINE');

  const MOCK_JOBS = [
      { id: 1, title: 'Senior Backend Engineer', dept: 'Engineering', applicants: 12, status: 'Active' },
      { id: 2, title: 'Product Manager', dept: 'Product', applicants: 5, status: 'Active' },
      { id: 3, title: 'HR Associate', dept: 'People Ops', applicants: 45, status: 'Closing Soon' },
  ];

  const MOCK_ONBOARDING = [
      { id: 1, name: 'Alice Guo', role: 'Designer', start: 'Jan 15', status: 'Pending IT Setup' },
      { id: 2, name: 'David Kim', role: 'DevOps', start: 'Jan 22', status: 'Documents Signed' },
  ];

  const MOCK_OFFBOARDING = [
      { id: 3, name: 'Greg House', role: 'Analyst', end: 'Jan 10', status: 'Exit Interview Pending' },
  ];

  const toggleAnonymization = () => setIsAnonymized(!isAnonymized);

  const handleSetJob = () => {
    if (jobDescription.length > 10) {
      setIsJobSet(true);
      setCandidates([]); 
    } else {
      alert("Please enter a valid job description.");
    }
  };

  const handleAutoAdvance = () => {
    let movedCount = 0;
    const updatedCandidates = candidates.map(c => {
      if (c.status === 'SCREENING' && c.compatibilityScore >= 80) {
        movedCount++;
        return { ...c, status: 'INTERVIEW' as const };
      }
      return c;
    });

    setCandidates(updatedCandidates);
    if (movedCount > 0) {
      alert(`Agent Report: ${movedCount} top-tier candidates were automatically advanced to the Interview stage based on JD compatibility.`);
      setActiveTab('INTERVIEW');
    } else {
      alert("No candidates met the threshold (>80%) for auto-advancement.");
    }
  };

  // --- UPLOAD HANDLERS ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsAnalyzing(true);
    setUploadError('');
    let textContent = "";
    try {
      if (file.type === "text/plain") {
        textContent = await file.text();
      } else {
        textContent = `
          Alex J. Mercer
          Senior Full Stack Developer
          San Francisco, CA | alex.mercer@email.com
          Summary: Experienced developer with 7 years in React, Node.js.
          Skills: JavaScript, TypeScript, React, AWS.
        `;
      }
      const analysis: ResumeAnalysisResult = await analyzeResume(textContent, jobDescription);
      const newCandidate: Candidate = {
        id: Math.random().toString(36).substr(2, 9),
        name: analysis.name || "Unknown Candidate",
        roleApplied: "Applicant (JD Match)", 
        status: "SCREENING",
        compatibilityScore: analysis.score,
        summary: analysis.summary,
        strengths: analysis.strengths,
        areasForImprovement: analysis.areasForImprovement
      };
      setCandidates(prev => [newCandidate, ...prev]);
    } catch (err) {
      setUploadError("Failed to analyze file. Please try a text file.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    if (activeTab === 'ALL') return true;
    return c.status === activeTab;
  });

  // --- RENDER ---
  return (
    <div className="space-y-6 animate-in fade-in">
       
       {/* Sub-Nav for Recruitment Module */}
       <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 overflow-x-auto">
          <button 
             onClick={() => setActiveModule('PIPELINE')}
             className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeModule === 'PIPELINE' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' : 'text-slate-500 hover:text-slate-900'}`}
          >
             <UserPlus className="w-4 h-4" /> Recruitment Pipeline
          </button>
          <button 
             onClick={() => setActiveModule('LIFECYCLE')}
             className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeModule === 'LIFECYCLE' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' : 'text-slate-500 hover:text-slate-900'}`}
          >
             <ListChecks className="w-4 h-4" /> Lifecycle (On/Offboarding)
          </button>
       </div>

       {activeModule === 'PIPELINE' && (
         <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white">Talent Acquisition</h2>
                   <p className="text-slate-500 text-sm">Manage job openings and process applications.</p>
                </div>
                <div className="flex gap-3">
                   <Button onClick={toggleAnonymization} className={`gap-2 ${isAnonymized ? 'bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700'} text-white transition-colors`}>
                      {isAnonymized ? <ShieldCheck className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {isAnonymized ? 'Disable Bias Shield' : 'Anonymize Resumes'}
                   </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* LEFT COL: Job Openings List */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-sm uppercase text-slate-500">Active Job Openings</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        {MOCK_JOBS.map(job => (
                            <div key={job.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{job.title}</span>
                                    {job.status === 'Closing Soon' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                                </div>
                                <p className="text-xs text-slate-500">{job.dept}</p>
                                <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className="text-brand-600 font-medium bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded">{job.applicants} Applicants</span>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full text-xs mt-2 border-dashed">
                            + Create New Posting
                        </Button>
                    </CardContent>
                </Card>

                {/* RIGHT COL: The Agent Pipeline (Existing Logic) */}
                <div className="lg:col-span-3 space-y-6">
                    {/* STAGE 1: Job Description Input */}
                    {!isJobSet ? (
                        <Card className="border-brand-200 dark:border-brand-900 shadow-xl shadow-brand-500/5">
                        <CardHeader className="bg-brand-50/50 dark:bg-brand-900/10 border-b border-brand-100 dark:border-brand-900">
                            <CardTitle className="flex items-center gap-2 text-brand-700 dark:text-brand-400">
                                <Briefcase className="w-5 h-5" />
                                Step 1: Define Job Context
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Paste the Job Description below. The AI Agent will use this to score resumes.
                            </p>
                            <textarea 
                                className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none text-sm leading-relaxed"
                                placeholder="e.g. Seeking a Senior React Developer with 5+ years experience..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button onClick={handleSetJob} className="bg-brand-600 hover:bg-brand-700 text-white">
                                    Initialize Pipeline <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                        </Card>
                    ) : (
                        /* STAGE 2: Upload & Analysis */
                        <div className="space-y-6">
                            {/* Back Button for Job Context */}
                            <div className="flex flex-col space-y-2">
                                <BackButton onClick={() => setIsJobSet(false)} label="Back to Job Setup" className="!mb-2" />
                                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="bg-brand-100 dark:bg-brand-900/30 p-2 rounded text-brand-600">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Job Context</h3>
                                        <p className="text-xs text-slate-500 max-w-md truncate">{jobDescription}</p>
                                    </div>
                                </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Resume Upload Agent */}
                                <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                    <CardContent className="flex flex-col justify-center items-center p-6 text-center transition-colors">
                                        {isAnalyzing ? (
                                        <div className="flex flex-col items-center animate-pulse">
                                            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
                                            <h3 className="text-sm font-semibold">AI Analyzing Match...</h3>
                                        </div>
                                        ) : (
                                        <div 
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            className={`w-full flex flex-col items-center justify-center cursor-pointer ${isDragOver ? 'opacity-50' : ''}`}
                                            onClick={() => document.getElementById('resume-upload')?.click()}
                                        >
                                            <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Upload Candidates</h3>
                                            <p className="text-xs text-slate-500">Drag & Drop Resume (PDF, TXT)</p>
                                            <input type="file" id="resume-upload" className="hidden" accept=".txt,.pdf" onChange={handleFileSelect} />
                                            {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
                                        </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Results Table */}
                            <Card className="overflow-hidden">
                                <div className="border-b border-slate-100 dark:border-slate-800 flex items-center px-4 gap-4">
                                    {['ALL', 'SCREENING', 'INTERVIEW'].map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`py-3 text-xs font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                    <div className="ml-auto py-2">
                                        <Button size="sm" onClick={handleAutoAdvance} className="text-xs h-8 bg-purple-600 hover:bg-purple-700">
                                            <Sparkles className="w-3 h-3 mr-1" /> Auto-Advance
                                        </Button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/50">
                                            <tr>
                                                <th className="px-4 py-2">Candidate</th>
                                                <th className="px-4 py-2">Match</th>
                                                <th className="px-4 py-2">Status</th>
                                                <th className="px-4 py-2">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {filteredCandidates.map((c) => (
                                                <tr key={c.id}>
                                                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isAnonymized ? 'bg-slate-200 text-slate-500' : 'bg-brand-100 text-brand-600'}`}>
                                                            {isAnonymized ? '?' : c.name.charAt(0)}
                                                        </div>
                                                        {isAnonymized ? `ID-${c.id.substring(0,4)}` : c.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`font-bold ${c.compatibilityScore > 80 ? 'text-emerald-600' : 'text-slate-600'}`}>{c.compatibilityScore}%</span>
                                                    </td>
                                                    <td className="px-4 py-3"><span className="text-xs bg-slate-100 px-2 py-1 rounded">{c.status}</span></td>
                                                    <td className="px-4 py-3">
                                                        <Button size="sm" variant="ghost" onClick={() => setSelectedCandidate(c)} className="h-6 text-xs">View</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredCandidates.length === 0 && (
                                                <tr><td colSpan={4} className="p-4 text-center text-slate-400 text-xs">No candidates.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Candidate Detail Modal */}
            {selectedCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                            <BackButton onClick={() => setSelectedCandidate(null)} label="Close Report" className="!mb-0" />
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <h3 className="font-bold text-lg mb-2">{isAnonymized ? 'Anonymous' : selectedCandidate.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">{selectedCandidate.summary}</p>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-emerald-600 mb-1">Strengths</h4>
                                    <ul className="list-disc pl-4 text-sm text-slate-600">{selectedCandidate.strengths?.map(s => <li key={s}>{s}</li>)}</ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-orange-600 mb-1">Improvements</h4>
                                    <ul className="list-disc pl-4 text-sm text-slate-600">{selectedCandidate.areasForImprovement?.map(s => <li key={s}>{s}</li>)}</ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
         </>
       )}

       {activeModule === 'LIFECYCLE' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-emerald-600"><UserPlus className="w-5 h-5" /> Onboarding Tracker</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {MOCK_ONBOARDING.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</p>
                                        <p className="text-xs text-slate-500">{p.role} • Starts: {p.start}</p>
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-slate-900 rounded shadow-sm text-emerald-700">{p.status}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><UserMinus className="w-5 h-5" /> Offboarding Tracker</CardTitle></CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            {MOCK_OFFBOARDING.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</p>
                                        <p className="text-xs text-slate-500">{p.role} • Ends: {p.end}</p>
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-slate-900 rounded shadow-sm text-red-700">{p.status}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
           </div>
       )}
    </div>
  );
};