import { useState, useEffect } from "react";
import { Check, ChevronRight, AlertCircle, FileText } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { PartAPrintLayout } from "./PartAPrintLayout.tsx";

const useAuth = () => ({ role: 'staff' });

const steps = [
  { id: "drafting", label: "Part A: Staff" },
  { id: "supervisor_assessment", label: "Part B: Supervisor" },
  { id: "staff_acknowledgment", label: "Part C: Staff Sign" },
  { id: "departmental_review", label: "Part D: Dept Review" },
  { id: "final_decision", label: "Part E: A&P Final" }
];

export default function EvaluationForm() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  let defaultState = "drafting";
  if (role === "supervisor") defaultState = "supervisor_assessment";
  else if (role === "dept_chairman") defaultState = "departmental_review";
  else if (role === "apc_chairman") defaultState = "final_decision";

  const initialUrlState = searchParams.get("state") || defaultState;
  const [urlState, setUrlState] = useState(initialUrlState);
  const staffId = searchParams.get("staffId");
  
  const absoluteCurrentIndex = steps.findIndex(s => s.id === urlState);
  
  // Filter visible steps based on role
  const visibleSteps = steps.filter(step => {
    if (role === 'staff') return step.id === 'drafting' || step.id === 'supervisor_assessment' || step.id === 'staff_acknowledgment';
    if (role === 'supervisor') return step.id === 'drafting' || step.id === 'supervisor_assessment';
    if (role === 'dept_chairman') return step.id === 'drafting' || step.id === 'supervisor_assessment' || step.id === 'departmental_review';
    if (role === 'apc_chairman') return true;
    return true; 
  });

  const maxVisibleIndex = Math.max(...visibleSteps.map(step => steps.findIndex(s => s.id === step.id)));
  const activeStepToJumpTo = absoluteCurrentIndex > maxVisibleIndex ? steps[maxVisibleIndex].id : urlState;

  const initialActiveId = visibleSteps.some(s => s.id === urlState) ? urlState : activeStepToJumpTo;
  const [activeTabId, setActiveTabId] = useState(initialActiveId);
  const [partAStage, setPartAStage] = useState(1);
  const partAStages = [{id:1, label:"Personal Details"}, {id:2, label:"Education"}, {id:3, label:"Employment History"}, {id:4, label:"Other Info"}];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const evaluationId = searchParams.get("id") || "1"; // Fallback to 1 for testing
  const [dbRanks, setDbRanks] = useState<{id: number, name: string}[]>([]);
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [availableStates, setAvailableStates] = useState<any[]>([]);
  const [supervisorQueue, setSupervisorQueue] = useState({ current: 0, total: 0, nextId: null as string | null });

  useEffect(() => {
    api('/api/staff/ranks').then(res => setDbRanks(res.data)).catch(err => console.error("Could not load ranks", err));
    
    fetch("https://countriesnow.space/api/v0.1/countries/states")
      .then(res => res.json())
      .then(data => {
         if (!data.error) setCountriesData(data.data);
      })
      .catch(err => console.error("Could not fetch countries", err));
  }, []);

  useEffect(() => {
    if (evaluationId) {
       // Mock for now
    }
  }, [evaluationId]);


  useEffect(() => {
    if (role === "supervisor" || role === "dept_chairman") {
       // Mock for now
    }
  }, [role, evaluationId]);

  // If the URL changes, update the tab
  useEffect(() => {
    if (visibleSteps.some(s => s.id === urlState)) {
      setActiveTabId(urlState);
    } else if (visibleSteps.length > 0) {
      setActiveTabId(visibleSteps[0].id);
    }
  }, [urlState, role]);

  const [formData, setFormData] = useState({
    partA: { 
      name: "Dr. John Doe", 
      date_of_birth: "1980-05-15",
      place_of_birth: "Lagos, Nigeria",
      nationality: "Nigeria",
      state_of_origin: "Lagos State",
      permanent_address: "123 Main Street, Victoria Island, Lagos",
      correspondence_address: "P.O. Box 456, Makurdi, Benue State",
      marital_status: "Married",
      phone: "+2348012345678",
      date_of_first_appointment: "2010-08-01",
      date_of_transfer: "2015-01-10",
      rank_on_first_appointment: "Assistant Lecturer",
      date_assumed_duty: "2010-08-15",
      date_confirmed: "2012-08-01",
      date_last_promoted: "2022-10-01",
      present_rank: "Senior Lecturer",
      present_level: "13",
      present_step: "1",
      previous_employment: [
        { text: "Tech Corp", subtype: "Developer", income: "5000000", reason: "Career Growth", start: "2015", end: "2018" }
      ],
      institutions: [
        { text: "University of Lagos", start: "2000", end: "2004" },
        { text: "University of Ibadan", start: "2006", end: "2008" }
      ],
      qualifications: [
        { text: "Computer Science", start: "", end: "2004", subtype: "B.Sc." },
        { text: "Computer Science", start: "", end: "2008", subtype: "M.Sc." }
      ], 
      training: [
        { text: "Advanced Data Science Workshop, Abuja", start: "2021", end: "" }
      ],
      professional_bodies: [
        { text: "Nigeria Computer Society (NCS)", start: "", end: "" },
        { text: "Computer Professionals of Nigeria (CPN)", start: "", end: "" }
      ],
      duties: [
        { text: "Teaching undergraduate courses, supervising final year projects, and conducting research.", start: "", end: "" }
      ],
      acting_appointments: [
        { text: "Head of Department", start: "2020", end: "2022" }
      ],
      examinations: [
        { text: "", start: "", end: "" }
      ],
      last_two_promotions: [
        { start: "", text: "", income: "" },
        { start: "", text: "", income: "" }
      ],
      declaration: false,
      declaration_name: "",
      declaration_date: ""
    },
    partB: { 
      basic_qualification: 0, additional_qualification: 0, work_experience: 0, admin_or_tech_experience: 0,
      relevant_training: 0, personality_team_spirit: 0, quality_of_work: 0, regularity: 0, punctuality: 0,
      care_of_property: 0, integrity: 0, initiative: 0, knowledge_regulations: 0, professional_membership: 0,
      absent_with: 0, absent_without: 0, warned: 0, suspended: 0, recommendation: "", comments: ""
    },
    partC: { agree: true, comments: "" },
    partD: { recommendation: "Select recommendation...", remarks: "" },
    partE: { decision: "Approve Promotion" }
  });

  useEffect(() => {
     if (formData.partA.nationality) {
        const country = countriesData.find(c => c.name === formData.partA.nationality);
        setAvailableStates(country?.states || []);
     } else {
        setAvailableStates([]);
     }
  }, [formData.partA.nationality, countriesData]);

  type ArrayItem = { text: string; start: string; end: string; subtype?: string; title?: string; name?: string; occupation?: string; email?: string; phone?: string; reason?: string; income?: string; };

  const handlePartBScoreChange = (field: keyof typeof formData.partB, value: string, maxScore: number) => {
    let numValue = Number(value);
    if (numValue < 0) numValue = 0;
    if (numValue > maxScore) numValue = maxScore;
    setFormData({ ...formData, partB: { ...formData.partB, [field]: numValue } });
  };

  const handleArrayChange = (field: keyof typeof formData.partA, index: number, key: keyof ArrayItem, value: string) => {
    const newArray = [...(formData.partA[field] as ArrayItem[])];
    newArray[index] = { ...newArray[index], [key]: value };
    setFormData({ ...formData, partA: { ...formData.partA, [field]: newArray } });
  };

  const handleAddField = (field: keyof typeof formData.partA) => {
    setFormData({ ...formData, partA: { ...formData.partA, [field]: [...(formData.partA[field] as ArrayItem[]), { text: "", start: "", end: "", subtype: "", title: "", name: "", occupation: "", email: "", phone: "" }] } });
  };

  const handleRemoveField = (field: keyof typeof formData.partA, index: number) => {
    const newArray = [...(formData.partA[field] as ArrayItem[])];
    newArray.splice(index, 1);
    setFormData({ ...formData, partA: { ...formData.partA, [field]: newArray } });
  };

  const isPartAValid = () => {
    const arrayFields = [
      'institutions', 'qualifications', 'previous_employment', 'training', 
      'duties', 'acting_appointments', 'examinations'
    ];
    
    for (const field of arrayFields) {
      const items = formData.partA[field as keyof typeof formData.partA] as ArrayItem[];
      if (items.some(item => !item.text.trim() || (field === 'qualifications' && !item.subtype?.trim()))) {
        return false;
      }
    }
    
    if (formData.partA.duties.length === 0) return false;
    if (!formData.partA.declaration || !formData.partA.declaration_name.trim() || !formData.partA.declaration_date) return false;

    return true;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1960 + 1 }, (_, i) => currentYear - i);

  const calculatePartBTotal = (b: typeof formData.partB) => {
    return Number(b.basic_qualification) + Number(b.additional_qualification) + Number(b.work_experience) + 
           Number(b.admin_or_tech_experience) + Number(b.relevant_training) + Number(b.personality_team_spirit) + 
           Number(b.quality_of_work) + Number(b.regularity) + Number(b.punctuality) + Number(b.care_of_property) + 
           Number(b.integrity) + Number(b.initiative) + Number(b.knowledge_regulations) + Number(b.professional_membership);
  };

  const handleAction = async (part: string, message: string) => {
    setIsSubmitting(true);
    try {
      // Mock submit
      await new Promise(res => setTimeout(res, 1000));

      let nextState = "";
      if (part === "A") nextState = "supervisor_assessment";
      else if (part === "B") nextState = "staff_acknowledgment";
      else if (part === "C") nextState = "departmental_review";
      else if (part === "D") nextState = "final_decision";

      alert(message);
      
      if (nextState) {
        setUrlState(nextState);
        setActiveTabId(nextState);
      } else {
        // navigate("/");
      }
    } catch (error) {
      alert("Failed to submit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-8 print:hidden">
      <div className="px-5 py-6 mb-4 rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-teal-900 opacity-20 rounded-full blur-xl"></div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm">Annual Performance Evaluation</h1>
          <p className="text-emerald-50 mt-2 text-xs md:text-base font-medium flex items-center gap-2">Status: <span className="font-bold text-white uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full shadow-inner">{urlState.replace('_', ' ')}</span></p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-0 ring-1 ring-slate-100 p-4 md:p-6 rounded-2xl shadow-md overflow-x-auto scrollbar-hide">
        <div className="flex items-center justify-between relative min-w-full md:min-w-[600px]">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full"></div>
          
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
            style={{ width: visibleSteps.length > 1 ? `${(visibleSteps.findIndex(s => s.id === urlState) / (visibleSteps.length - 1)) * 100}%` : '100%' }}
          ></div>
          
          {visibleSteps.map((step, index) => {
            const stepAbsoluteIndex = steps.findIndex(s => s.id === step.id);
            const isCompleted = stepAbsoluteIndex < absoluteCurrentIndex;
            const isCurrent = step.id === activeTabId;
            const isClickable = stepAbsoluteIndex <= absoluteCurrentIndex;
            
            return (
              <div 
                key={step.id} 
                className={`relative z-10 flex flex-col items-center gap-1 md:gap-2 bg-card px-1 md:px-2 cursor-pointer ${!isClickable ? 'opacity-50' : ''}`}
                onClick={() => isClickable && setActiveTabId(step.id)}
              >
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-colors border-2 ${
                  isCompleted ? 'bg-primary border-primary text-primary-foreground' :
                  isCurrent ? 'bg-background border-primary text-primary shadow-[0_0_0_4px_rgba(var(--primary),0.2)]' :
                  'bg-muted border-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : index + 1}
                </div>
                <div className="flex flex-col items-center mt-1">
                  <span className={`text-[10px] md:text-sm font-semibold whitespace-nowrap ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isCompleted ? 'text-emerald-500' : isCurrent ? 'text-primary/80' : 'text-muted-foreground/50'}`}>
                    {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* Form Content */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 md:p-6 min-h-[400px]">
        
        {/* PART A: STAFF DRAFTING */}
        {activeTabId === "drafting" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-border pb-3">
              <h3 className="text-lg md:text-xl font-semibold">Part A (Non-Teaching Staff)</h3>
              {role === 'staff' && urlState === 'drafting' && (
                <div className="flex flex-wrap gap-2">
                  <button 
                    type="button"
                    className="text-xs border border-primary/20 text-primary px-3 py-1.5 rounded font-medium hover:bg-primary/10 transition-colors flex items-center gap-1"
                    onClick={() => window.print()}
                  >
                    Preview
                  </button>
                  <button 
                    type="button"
                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded font-medium hover:bg-primary/20 transition-colors"
                    onClick={() => {
                      alert("Fetched latest CV from profile.");
                      // TODO: Actual API fetch here. For now, it just shows intent.
                    }}
                  >
                    ⟳ Populate from Profile CV
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex w-full bg-slate-50/80 p-1.5 rounded-xl border border-slate-200/60 mb-6 gap-1.5 shadow-inner">
              {partAStages.map(st => (
                <button 
                  type="button"
                  key={st.id}
                  className={`flex-1 px-1 md:px-4 py-2.5 font-bold text-[10px] sm:text-xs md:text-sm text-center leading-tight rounded-lg transition-all duration-300 ${partAStage === st.id ? 'bg-white shadow-md text-emerald-700 ring-1 ring-emerald-500/20 transform scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                  onClick={() => setPartAStage(st.id)}
                >
                  {st.label}
                </button>
              ))}
            </div>
            
            {partAStage === 1 && (
            <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
              <h4 className="font-bold text-sm mb-4 text-emerald-800 flex items-center gap-2 border-b border-slate-100 pb-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> 1. PERSONAL DATA</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-xs font-medium">Name</label><input type="text" className="w-full px-2 py-1.5 text-sm border rounded bg-background" value={formData.partA.name} onChange={e => setFormData({...formData, partA: {...formData.partA, name: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} /></div>
                <div className="space-y-1"><label className="text-xs font-medium">Date of Birth</label><input type="date" className="w-full px-2 py-1.5 text-sm border rounded bg-background" value={formData.partA.date_of_birth} onChange={e => setFormData({...formData, partA: {...formData.partA, date_of_birth: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} /></div>
                <div className="space-y-1"><label className="text-xs font-medium">Place of Birth</label><input type="text" className="w-full px-2 py-1.5 text-sm border rounded bg-background" value={formData.partA.place_of_birth} onChange={e => setFormData({...formData, partA: {...formData.partA, place_of_birth: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} /></div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nationality</label>
                  <select className="w-full px-2 py-1.5 text-sm border rounded bg-background" value={formData.partA.nationality} onChange={e => setFormData({...formData, partA: {...formData.partA, nationality: e.target.value, state_of_origin: ''}})} disabled={role !== 'staff' || urlState !== 'drafting'}>
                    <option value="">Select Country</option>
                    {countriesData.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">State of Origin</label>
                  <select className="w-full px-2 py-1.5 text-sm border rounded bg-background" value={formData.partA.state_of_origin} onChange={e => setFormData({...formData, partA: {...formData.partA, state_of_origin: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting' || availableStates.length === 0}>
                    <option value="">Select State</option>
                    {availableStates.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1"><label className="text-xs font-medium">Permanent Home Address</label><input type="text" className="w-full px-2 py-1.5 text-sm border rounded bg-background" value={formData.partA.permanent_address} onChange={e => setFormData({...formData, partA: {...formData.partA, permanent_address: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} /></div>
                <div className="space-y-1"><label className="text-xs font-medium">Correspondence Address</label><input type="text" className="w-full px-2 py-1.5 text-sm border rounded bg-background" value={formData.partA.correspondence_address} onChange={e => setFormData({...formData, partA: {...formData.partA, correspondence_address: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} /></div>
                <div className="space-y-1"><label className="text-xs font-medium">Marital Status</label>
                  <select className="w-full px-2 py-1.5 text-sm border rounded bg-background" value={formData.partA.marital_status} onChange={e => setFormData({...formData, partA: {...formData.partA, marital_status: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'}>
                    <option>Married</option><option>Single</option><option>Widowed</option><option>Divorced</option>
                  </select>
                </div>
                <div className="space-y-1"><label className="text-xs font-medium">Tel No(s)</label><input type="text" className="w-full px-2 py-1.5 text-sm border rounded bg-background" value={formData.partA.phone || ''} onChange={e => setFormData({...formData, partA: {...formData.partA, phone: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} placeholder="+234..." /></div>
                </div>
              </div>
            )}
            
            {(partAStage === 2 || partAStage === 3 || partAStage === 4) && (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'institutions', title: 'EDUCATIONAL INSTITUTIONS ATTENDED WITH DATES', btn: 'Institution', hasDates: true, stage: 2 },
                { id: 'qualifications', title: 'QUALIFICATIONS OBTAINED WITH DATES', btn: 'Qualification', hasDates: true, dropdownOptions: ["FSLC", "WAEC", "NECO", "NABTEB", "NBAIS", "NCE", "OND", "ND", "HND", "B.Sc.", "B.A.", "B.Eng.", "B.Ed.", "LL.B.", "MBBS", "PGD", "MBA", "M.Sc.", "M.A.", "M.Eng.", "M.Ed.", "M.Phil.", "Ph.D."], stage: 2 },
                { id: 'previous_employment', title: 'PREVIOUS EMPLOYMENT HISTORY', btn: 'Employment', hasDates: true, stage: 3 },
                { id: 'duties', title: '14. Present Schedule of Duty (to be stated clearly and fully)', btn: 'Duty', hasDates: false, stage: 4 },
                { id: 'acting_appointments', title: '15. Have you held any acting appointment(s) during the period under review; if yes, in what position and for how long in each case?', btn: 'Appointment', hasDates: true, stage: 4 },
                { id: 'examinations', title: '16. Examinations taken (with results) during the period under review (state date).', btn: 'Examination', hasDates: true, stage: 4 },
                { id: 'training', title: '17. Name any training course/workshop/seminar attended during the period under review (please attach appropriate evidence).', btn: 'Course/Workshop', hasDates: true, stage: 4 }
              ].filter((s: any) => s.stage === partAStage).map(section => (
                <div key={section.id} className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-sm text-emerald-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {section.title}</h4>
                    {role === 'staff' && urlState === 'drafting' && section.id !== 'previous_employment' && (
                      <button onClick={() => handleAddField(section.id as any)} className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 uppercase tracking-wider transition-colors">+ Add</button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {(formData.partA[section.id as keyof typeof formData.partA] as any[]).map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <span className="text-sm font-medium mt-1.5 w-4 text-right text-muted-foreground">{idx + 1}.</span>
                            <div className="flex-1 flex flex-col sm:flex-row gap-2 items-start w-full">
                              {(section as any).dropdownOptions && (
                                <select className="px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none w-full sm:w-[120px]" value={item.subtype || ""} onChange={(e) => handleArrayChange(section.id as any, idx, 'subtype', e.target.value)} disabled={role !== 'staff' || urlState !== 'drafting'}>
                                  <option value="">Select...</option>
                                  {(section as any).dropdownOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              )}
                              {section.id === 'previous_employment' ? (
                                <div className="w-full grid grid-cols-1 gap-2 mb-2">
                                  <input type="text" className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder="Employer" value={item.text || ""} onChange={(e) => handleArrayChange('previous_employment', idx, 'text', e.target.value)} disabled={role !== 'staff' || urlState !== 'drafting'} />
                                  <input type="text" className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder="Post Held" value={item.subtype || ""} onChange={(e) => handleArrayChange('previous_employment', idx, 'subtype', e.target.value)} disabled={role !== 'staff' || urlState !== 'drafting'} />
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <input type="text" className="flex-1 px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder="Last Income p.a." value={item.income || ""} onChange={(e) => handleArrayChange('previous_employment', idx, 'income', e.target.value)} disabled={role !== 'staff' || urlState !== 'drafting'} />
                                    <input type="text" className="flex-1 px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder="Reason for Leaving" value={item.reason || ""} onChange={(e) => handleArrayChange('previous_employment', idx, 'reason', e.target.value)} disabled={role !== 'staff' || urlState !== 'drafting'} />
                                  </div>
                                </div>
                              ) : (
                                <textarea rows={section.hasDates ? 3 : 2} className="w-full flex-1 px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-y" placeholder={(section as any).dropdownOptions ? `Enter course/details...` : `Enter ${section.btn.toLowerCase()} details...`} value={item.text} onChange={(e) => handleArrayChange(section.id as any, idx, 'text', e.target.value)} disabled={role !== 'staff' || urlState !== 'drafting'} />
                              )}
                              {section.hasDates && (
                                <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                                  <select className="flex-1 sm:flex-none px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none sm:w-[90px]" value={item.start} onChange={(e) => handleArrayChange(section.id as any, idx, 'start', e.target.value)} disabled={role !== 'staff' || urlState !== 'drafting'}>
                                    <option value="">Start</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                  </select>
                                  <select className="flex-1 sm:flex-none px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none sm:w-[90px]" value={item.end} onChange={(e) => handleArrayChange(section.id as any, idx, 'end', e.target.value)} disabled={role !== 'staff' || urlState !== 'drafting'}>
                                    <option value="">End</option>
                                    <option value="Present">Present</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                  </select>
                                </div>
                              )}
                            </div>
                            {role === 'staff' && urlState === 'drafting' && section.id !== 'previous_employment' && (
                              <button onClick={() => handleRemoveField(section.id as any, idx)} className="text-muted-foreground hover:text-destructive font-bold text-lg px-2 rounded hover:bg-destructive/10 transition-colors leading-none pb-1" title="Remove field">×</button>
                            )}
                      </div>
                    ))}
                    {(formData.partA[section.id as keyof typeof formData.partA] as any[]).length === 0 && (
                      <p className="text-xs text-muted-foreground italic py-2">No entries added.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
                 {partAStage === 3 && (
                  <div className="bg-muted/10 border border-border rounded-lg p-4 mt-6">
                    <h4 className="font-medium text-sm mb-3 text-primary uppercase">JOSTUM APPOINTMENT HISTORY</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1"><label className="text-xs font-medium">7(a) Date of First Appointment</label><input type="date" className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.partA.date_of_first_appointment} onChange={e => setFormData({...formData, partA: {...formData.partA, date_of_first_appointment: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} /></div>
                      <div className="space-y-1"><label className="text-xs font-medium">7(b) Date of Transfer of Service to JOSTUM</label><input type="date" className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.partA.date_of_transfer} onChange={e => setFormData({...formData, partA: {...formData.partA, date_of_transfer: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} /></div>
                      <div className="space-y-1"><label className="text-xs font-medium">7(c) Date of Assumption of Duty in JOSTUM</label><input type="date" className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.partA.date_assumed_duty} onChange={e => setFormData({...formData, partA: {...formData.partA, date_assumed_duty: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} /></div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">8. Rank on First Appointment in JOSTUM</label>
                        <select className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.partA.rank_on_first_appointment} onChange={e => setFormData({...formData, partA: {...formData.partA, rank_on_first_appointment: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'}>
                          <option value="">Select Rank</option>
                          {dbRanks.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                          {dbRanks.length === 0 && <option value="Assistant Lecturer">Assistant Lecturer</option>}
                        </select>
                      </div>
                      <div className="space-y-1"><label className="text-xs font-medium">9. Date of Confirmation of Appointment</label><input type="date" className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.partA.date_confirmed} onChange={e => setFormData({...formData, partA: {...formData.partA, date_confirmed: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} /></div>
                      <div className="space-y-1"><label className="text-xs font-medium">10. Date of Last Promotion/Regrading/Conversion</label><input type="date" className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.partA.date_last_promoted} onChange={e => setFormData({...formData, partA: {...formData.partA, date_last_promoted: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} /></div>
                      <div className="space-y-1 md:col-span-1">
                        <label className="text-xs font-medium">11. Present Rank</label>
                        <select className="w-full px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.partA.present_rank} onChange={e => setFormData({...formData, partA: {...formData.partA, present_rank: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'}>
                          <option value="">Select Rank</option>
                          {dbRanks.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                          {dbRanks.length === 0 && <option value="Senior Lecturer">Senior Lecturer</option>}
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-medium">12. Present Salary/CONTISS (Level & Step)</label>
                        <div className="flex gap-2 md:w-2/3">
                          <select className="w-1/2 px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.partA.present_level} onChange={e => setFormData({...formData, partA: {...formData.partA, present_level: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'}>
                            <option value="">CONTISS Level</option>
                            {Array.from({length: 18}, (_, i) => i + 1).map(l => <option key={l} value={l}>CONTISS {l}</option>)}
                          </select>
                          <select className="w-1/2 px-2 py-1.5 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.partA.present_step} onChange={e => setFormData({...formData, partA: {...formData.partA, present_step: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'}>
                            <option value="">Step</option>
                            {Array.from({length: 15}, (_, i) => i + 1).map(s => <option key={s} value={s}>Step {s}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-3 mt-2">
                        <label className="text-sm font-medium">13. Dates of Last two (2) Promotions:</label>
                        <div className="border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
                          {/* Desktop Header */}
                          <div className="hidden md:grid grid-cols-3 bg-muted/50 text-xs font-medium border-b border-border">
                            <div className="px-3 py-2.5">Date of Promotion</div>
                            <div className="px-3 py-2.5 border-l border-border">Position to which Promoted</div>
                            <div className="px-3 py-2.5 border-l border-border">Salary/Scale</div>
                          </div>
                          
                          {/* Promotion Rows */}
                          <div className="divide-y divide-border border-t border-border md:border-t-0">
                            {[0, 1].map((idx) => (
                              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 bg-background divide-y md:divide-y-0 md:divide-x divide-border">
                                <div className="relative p-0 flex flex-col justify-center">
                                  <label className="md:hidden text-[10px] font-bold text-muted-foreground uppercase px-3 pt-2 pb-0.5">Date of Promotion</label>
                                  <input type="date" className="w-full px-3 pb-2 md:py-2.5 bg-transparent outline-none focus:ring-inset focus:ring-1 focus:ring-primary focus:z-10" value={formData.partA.last_two_promotions[idx].start} onChange={e => handleArrayChange('last_two_promotions', idx, 'start', e.target.value)} disabled={role !== 'staff' || urlState !== 'drafting'} />
                                </div>
                                <div className="relative p-0 flex flex-col justify-center">
                                  <label className="md:hidden text-[10px] font-bold text-muted-foreground uppercase px-3 pt-2 pb-0.5">Position Promoted To</label>
                                  <input type="text" className="w-full px-3 pb-2 md:py-2.5 bg-transparent outline-none focus:ring-inset focus:ring-1 focus:ring-primary focus:z-10" value={formData.partA.last_two_promotions[idx].text} onChange={e => handleArrayChange('last_two_promotions', idx, 'text', e.target.value)} disabled={role !== 'staff' || urlState !== 'drafting'} />
                                </div>
                                <div className="relative p-0 flex flex-col justify-center">
                                  <label className="md:hidden text-[10px] font-bold text-muted-foreground uppercase px-3 pt-2 pb-0.5">Salary/Scale</label>
                                  <input type="text" className="w-full px-3 pb-2 md:py-2.5 bg-transparent outline-none focus:ring-inset focus:ring-1 focus:ring-primary focus:z-10" value={formData.partA.last_two_promotions[idx].income} onChange={e => handleArrayChange('last_two_promotions', idx, 'income', e.target.value)} disabled={role !== 'staff' || urlState !== 'drafting'} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                 )}
                 {partAStage === 4 && (
                   <div className="bg-muted/10 border border-border rounded-lg p-6 mt-6 shadow-sm">
                     <h4 className="font-bold text-base mb-4 text-primary border-b border-border pb-2">18. Certification by Staff:</h4>
                     <p className="text-sm font-medium mb-4 italic">I declare that the above information is true and correct.</p>
                     
                     <div className="flex flex-col gap-4 max-w-md">
                       <label className="flex items-center gap-3 cursor-pointer">
                         <input type="checkbox" className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer" checked={formData.partA.declaration} onChange={e => setFormData({...formData, partA: {...formData.partA, declaration: e.target.checked}})} disabled={role !== 'staff' || urlState !== 'drafting'} />
                         <span className="text-sm font-semibold select-none">I digitally sign this document.</span>
                       </label>

                       {formData.partA.declaration && (
                         <div className="space-y-3 mt-2 bg-background p-4 rounded border border-border/50">
                           <div className="space-y-1">
                             <label className="text-xs font-medium text-muted-foreground">Signature of Staff (Name)</label>
                             <input type="text" className="w-full px-3 py-2 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none font-semibold text-primary/80" value={formData.partA.declaration_name} onChange={e => setFormData({...formData, partA: {...formData.partA, declaration_name: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} placeholder="Type your full name..." />
                           </div>
                           <div className="space-y-1">
                             <label className="text-xs font-medium text-muted-foreground">Date</label>
                             <input type="date" className="w-full px-3 py-2 text-sm border border-border rounded bg-background focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.partA.declaration_date} onChange={e => setFormData({...formData, partA: {...formData.partA, declaration_date: e.target.value}})} disabled={role !== 'staff' || urlState !== 'drafting'} />
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                 )}
            </>
            )}
            
            <div className="pt-6 flex justify-between items-center border-t border-border mt-6">
              {partAStage > 1 ? (
                <button 
                  type="button"
                  onClick={() => setPartAStage(s => s - 1)}
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-md font-medium hover:bg-muted/80 transition-colors whitespace-nowrap"
                >
                  Back
                </button>
              ) : <div></div>}

              {partAStage < 4 ? (
                <button 
                  type="button"
                  onClick={() => setPartAStage(s => s + 1)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  Next
                </button>
              ) : (
                <div className="flex flex-col items-end gap-3">
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg p-3 text-sm flex items-center gap-2 max-w-sm">
                    <Check className="w-4 h-4 flex-none"/>
                  </div>
                  {role === 'staff' && urlState === 'drafting' ? (
                    <button 
                      onClick={() => handleAction("A", "Part A Submitted successfully!")}
                      disabled={isSubmitting || !isPartAValid()}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? "Submitting..." : <><Check className="w-4 h-4"/> Submit Part A</>}
                    </button>
                  ) : activeTabId !== activeStepToJumpTo ? (
                    <button 
                      onClick={() => setActiveTabId(activeStepToJumpTo)}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      Continue to Active Step
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PART B: SUPERVISOR ASSESSMENT */}
        {activeTabId === "supervisor_assessment" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {role === 'supervisor' && (
              <div className="bg-muted/30 p-4 rounded-lg border border-border mb-6">
                <h4 className="font-semibold text-sm mb-2 text-primary uppercase tracking-wider">Staff Submitted Data</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground block text-xs">Name</span>{formData.partA.name}</div>
                  <div><span className="text-muted-foreground block text-xs">Rank</span>{formData.partA.present_rank}</div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-xs">Schedule of Duties</span>
                    {formData.partA.duties.length > 0 ? (
                      <ul className="list-disc pl-4 mt-1">
                        {formData.partA.duties.map((duty, i) => (
                          <li key={i}>{duty.text}</li>
                        ))}
                      </ul>
                    ) : 'No duties reported.'}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg md:text-xl font-semibold">
                  Part B: Supervisor Assessment
                </h3>
                {role === "supervisor" && supervisorQueue.total > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      Candidate {supervisorQueue.current > 0 ? supervisorQueue.current : '?'} of {supervisorQueue.total}
                    </span>
                    {supervisorQueue.nextId ? (
                      <button 
                        type="button"
                        onClick={() => window.location.href = `/evaluation?id=${supervisorQueue.nextId}&state=supervisor_assessment`}
                        className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        Skip to Next Staff
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        End of Queue
                      </span>
                    )}
                  </div>
                )}
              </div>
              <span className="text-xs md:text-sm px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full font-medium flex items-center gap-2 w-fit">
                <AlertCircle className="w-4 h-4"/> Official 100 Points Matrix
              </span>
            </div>
            
            <div className="bg-muted/10 border border-border rounded-lg p-3 md:p-4 mb-6">
              <h4 className="font-medium text-xs md:text-sm mb-3">Attendance & Discipline History</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] md:text-xs font-medium text-muted-foreground">Absent w/ Permission</label>
                  <input type="number" min="0" className="w-full px-2 py-1 text-sm border rounded" value={formData.partB.absent_with} onChange={e => setFormData({...formData, partB: {...formData.partB, absent_with: Number(e.target.value)}})} disabled={role !== 'supervisor'} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-xs font-medium text-muted-foreground">Absent w/o Permission</label>
                  <input type="number" min="0" className="w-full px-2 py-1 text-sm border rounded text-destructive" value={formData.partB.absent_without} onChange={e => setFormData({...formData, partB: {...formData.partB, absent_without: Number(e.target.value)}})} disabled={role !== 'supervisor'} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-xs font-medium text-muted-foreground">Times Warned</label>
                  <input type="number" min="0" className="w-full px-2 py-1 text-sm border rounded text-destructive" value={formData.partB.warned} onChange={e => setFormData({...formData, partB: {...formData.partB, warned: Number(e.target.value)}})} disabled={role !== 'supervisor'} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-xs font-medium text-muted-foreground">Times Suspended</label>
                  <input type="number" min="0" className="w-full px-2 py-1 text-sm border rounded text-destructive" value={formData.partB.suspended} onChange={e => setFormData({...formData, partB: {...formData.partB, suspended: Number(e.target.value)}})} disabled={role !== 'supervisor'} />
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-x-auto mb-6 shadow-sm">
              <table className="w-full text-xs md:text-sm text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-1 md:px-4 py-3 font-semibold text-primary w-8 md:w-12 text-center">#</th>
                    <th className="px-1 md:px-4 py-3 font-semibold text-primary">4. Assessment and Weighting</th>
                    <th className="px-1 md:px-4 py-3 font-semibold text-primary w-12 md:w-24 text-center">Max Score</th>
                    <th className="px-1 md:px-4 py-3 font-semibold text-primary w-16 md:w-32 text-center">Score Awarded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/30">
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-medium">(a)</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 font-medium">Possession of basic qualification for the post</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-semibold">10</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="10" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.basic_qualification || ""} onChange={e => handlePartBScoreChange('basic_qualification', e.target.value, 10)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-medium">(b)</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 font-medium">Additional relevant qualification</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-semibold">5</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="5" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.additional_qualification || ""} onChange={e => handlePartBScoreChange('additional_qualification', e.target.value, 5)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-medium">(c)</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 font-medium">Relevant Work Experience <span className="text-muted-foreground text-xs block">(2 points per year, max 10 years)</span></td>
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-semibold">20</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="20" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.work_experience || ""} onChange={e => handlePartBScoreChange('work_experience', e.target.value, 20)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-medium">(d)</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 font-medium">Admin/Supervisory Experience OR Technical/Supervisory Experience</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-semibold">10</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="10" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.admin_or_tech_experience || ""} onChange={e => handlePartBScoreChange('admin_or_tech_experience', e.target.value, 10)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-medium">(e)</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 font-medium">Additional relevant training within the appraisal period</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-semibold">8</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="8" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.relevant_training || ""} onChange={e => handlePartBScoreChange('relevant_training', e.target.value, 8)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-medium">(f)</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 font-medium">Personality/Temperament/Comportment/Team Spirit</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-semibold">7</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="7" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.personality_team_spirit || ""} onChange={e => handlePartBScoreChange('personality_team_spirit', e.target.value, 7)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-medium">(g)</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 font-medium">Quality of work produced</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-semibold">5</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="5" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.quality_of_work || ""} onChange={e => handlePartBScoreChange('quality_of_work', e.target.value, 5)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="bg-muted/10">
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-medium">(h)</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 font-bold" colSpan={3}>General attitude to work (20 Points Total):</td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td></td>
                    <td className="px-1 md:px-4 py-1 md:py-2 pl-8 font-medium border-l-2 border-primary/20">i. Regularity</td>
                    <td className="px-1 md:px-4 py-1 md:py-2 text-center text-muted-foreground font-semibold">4</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="4" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.regularity || ""} onChange={e => handlePartBScoreChange('regularity', e.target.value, 4)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td></td>
                    <td className="px-1 md:px-4 py-1 md:py-2 pl-8 font-medium border-l-2 border-primary/20">ii. Punctuality</td>
                    <td className="px-1 md:px-4 py-1 md:py-2 text-center text-muted-foreground font-semibold">4</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="4" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.punctuality || ""} onChange={e => handlePartBScoreChange('punctuality', e.target.value, 4)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td></td>
                    <td className="px-1 md:px-4 py-1 md:py-2 pl-8 font-medium border-l-2 border-primary/20">iii. Care of University property</td>
                    <td className="px-1 md:px-4 py-1 md:py-2 text-center text-muted-foreground font-semibold">4</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="4" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.care_of_property || ""} onChange={e => handlePartBScoreChange('care_of_property', e.target.value, 4)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td></td>
                    <td className="px-1 md:px-4 py-1 md:py-2 pl-8 font-medium border-l-2 border-primary/20">iv. Integrity</td>
                    <td className="px-1 md:px-4 py-1 md:py-2 text-center text-muted-foreground font-semibold">4</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="4" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.integrity || ""} onChange={e => handlePartBScoreChange('integrity', e.target.value, 4)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td></td>
                    <td className="px-1 md:px-4 py-1 md:py-2 pl-8 font-medium border-l-2 border-primary/20">v. Initiative</td>
                    <td className="px-1 md:px-4 py-1 md:py-2 text-center text-muted-foreground font-semibold">4</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="4" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.initiative || ""} onChange={e => handlePartBScoreChange('initiative', e.target.value, 4)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-medium">(i)</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 font-medium">Knowledge of University Regulations/Office procedure Or Laboratory/Workshop practice.</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-semibold">10</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="10" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.knowledge_regulations || ""} onChange={e => handlePartBScoreChange('knowledge_regulations', e.target.value, 10)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-medium">(j)</td>
                    <td className="px-1 md:px-4 py-2 md:py-3 font-medium">Membership of professional bodies <span className="text-muted-foreground text-xs">(minimum of two)</span></td>
                    <td className="px-1 md:px-4 py-2 md:py-3 text-center text-muted-foreground font-semibold">5</td>
                    <td className="px-1 md:px-4 py-1 md:py-2"><input type="number" max="5" min="0" className="w-full px-3 py-1.5 border border-border rounded bg-background focus:ring-1 focus:ring-primary outline-none text-center font-bold" value={formData.partB.professional_membership || ""} onChange={e => handlePartBScoreChange('professional_membership', e.target.value, 5)} disabled={role !== 'supervisor'} /></td>
                  </tr>
                </tbody>
                <tfoot className="bg-primary/5 border-t-2 border-primary/20">
                  <tr>
                    <td colSpan={2} className="px-1 md:px-4 py-3 md:py-4 text-right font-bold text-primary uppercase tracking-wider text-xs md:text-sm">Total Score:</td>
                    <td className="px-1 md:px-4 py-3 md:py-4 text-center font-bold text-primary text-base md:text-lg">100</td>
                    <td className="px-1 md:px-4 py-3 md:py-4">
                      <div className={`text-center font-bold text-xl md:text-2xl px-1 md:px-3 py-1.5 rounded bg-background border ${calculatePartBTotal(formData.partB) >= 70 ? 'border-emerald-500 text-emerald-600' : calculatePartBTotal(formData.partB) >= 45 ? 'border-amber-500 text-amber-600' : 'border-destructive text-destructive'}`}>
                        {calculatePartBTotal(formData.partB)}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">5. Recommendation</label>
                <select className="w-full px-3 py-2.5 border border-border rounded-md bg-background focus:ring-1 focus:ring-primary outline-none font-medium" value={formData.partB.recommendation} onChange={e => setFormData({...formData, partB: {...formData.partB, recommendation: e.target.value}})} disabled={role !== 'supervisor'}>
                  <option value="">Select recommendation based on score...</option>
                  <option value="Warning/Not recommended for Annual Increment">Warning/Not recommended for Annual Increment (0%-34%)</option>
                  <option value="Recommended for normal Annual Increment">Recommended for normal Annual Increment (35%-44%)</option>
                  <option value="Recommended for Promotion">Recommended for Promotion (at least 45%-90%)</option>
                  <option value="Not due for promotion">Not due for promotion</option>
                </select>
                <p className="text-[11px] text-muted-foreground mt-1 px-1">Choose the appropriate recommendation corresponding to the staff's maturity and performance score.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold">6. General Comments</label>
                <textarea className="w-full px-3 py-2.5 border border-border rounded-md bg-background h-[85px] resize-y focus:ring-1 focus:ring-primary outline-none" placeholder="Enter general comments here..." value={formData.partB.comments} onChange={e => setFormData({...formData, partB: {...formData.partB, comments: e.target.value}})} disabled={role !== 'supervisor'}></textarea>
              </div>
            </div>
            
            {role === 'supervisor' && urlState === 'supervisor_assessment' ? (
              <div className="pt-4 flex justify-between items-center border-t border-border mt-6">
                <div className="text-sm font-bold flex items-center gap-2">
                  Calculated Score: 
                  <span className={`text-lg ${calculatePartBTotal(formData.partB) >= 70 ? 'text-emerald-500' : calculatePartBTotal(formData.partB) >= 45 ? 'text-amber-500' : 'text-destructive'}`}>
                    {calculatePartBTotal(formData.partB)}/100
                  </span>
                </div>
                <button 
                  onClick={() => handleAction("B", "Assessment submitted and staff notified via email!")}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Assessment & Notify Staff"}
                </button>
              </div>
            ) : activeTabId !== activeStepToJumpTo ? (
              <div className="pt-4 flex justify-end border-t border-border mt-6">
                <button 
                  onClick={() => setActiveTabId(activeStepToJumpTo)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  Continue to Active Step
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* PART C: STAFF ACKNOWLEDGMENT */}
        {activeTabId === "staff_acknowledgment" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-xl font-semibold border-b border-border pb-3">Part C: Staff Acknowledgment</h3>
            <div className="bg-muted/30 p-4 rounded-lg border border-border mb-6">
              <p className="text-sm text-muted-foreground">Please review the supervisor's assessment score. You must digitally sign your agreement or disagreement.</p>
              <div className="mt-4 flex items-center gap-6">
                <div className="text-2xl font-bold">Total Score: <span className="text-primary">{calculatePartBTotal(formData.partB)}/100</span></div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium block">Do you agree with this assessment?</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-md hover:bg-muted/50 transition-colors w-full">
                  <input type="radio" name="agreement" className="w-4 h-4 text-primary" 
                         checked={formData.partC.agree === true} onChange={() => setFormData({...formData, partC: {...formData.partC, agree: true}})}
                         disabled={role !== 'staff' || urlState !== 'staff_acknowledgment'} />
                  <span className="font-medium">I Agree</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-md hover:bg-muted/50 transition-colors w-full">
                  <input type="radio" name="agreement" className="w-4 h-4 text-destructive" 
                         checked={formData.partC.agree === false} onChange={() => setFormData({...formData, partC: {...formData.partC, agree: false}})}
                         disabled={role !== 'staff' || urlState !== 'staff_acknowledgment'} />
                  <span className="font-medium">I Disagree</span>
                </label>
              </div>
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium text-muted-foreground">Reasons/Comments (Optional if Agree, Required if Disagree)</label>
                <textarea className="w-full px-3 py-2 border border-border rounded-md bg-background h-24" 
                          placeholder="Enter your comments..." 
                          value={formData.partC.comments} onChange={e => setFormData({...formData, partC: {...formData.partC, comments: e.target.value}})}
                          disabled={role !== 'staff' || urlState !== 'staff_acknowledgment'}></textarea>
              </div>
            </div>
            
            {role === 'staff' && urlState === 'staff_acknowledgment' ? (
              <div className="pt-4 flex justify-end border-t border-border mt-6">
                <button 
                  onClick={() => handleAction("C", "Acknowledgment signed successfully.")}
                  disabled={isSubmitting || (!formData.partC.agree && !formData.partC.comments)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Signing..." : "Digitally Sign & Submit"}
                </button>
              </div>
            ) : (
              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-2 border border-primary text-primary rounded-md font-medium hover:bg-primary/5 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4"/> Print Appraisal (A-C)
                </button>
                {activeTabId !== activeStepToJumpTo && (
                  <button 
                    onClick={() => setActiveTabId(activeStepToJumpTo)}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    Continue to Active Step
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* PART D: DEPT REVIEW */}
        {activeTabId === "departmental_review" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1 border-b border-border pb-3 mb-3">
              <h3 className="text-xl font-semibold">Part D: Departmental Review</h3>
              {role === "dept_chairman" && supervisorQueue.total > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    Candidate {supervisorQueue.current > 0 ? supervisorQueue.current : '?'} of {supervisorQueue.total}
                  </span>
                  {supervisorQueue.nextId ? (
                    <button 
                      type="button"
                      onClick={() => window.location.href = `/evaluation?id=${supervisorQueue.nextId}&state=departmental_review`}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      Skip to Next Staff
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      End of Queue
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">The Departmental Appraisal Committee must verify the scores and provide a recommendation.</p>
            
            {role === 'dept_chairman' && (
              <div className="bg-muted/30 border border-border rounded-lg p-3 md:p-4 mb-6">
                <h4 className="font-medium text-sm mb-3">Staff Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground block text-xs">Name</span>{formData.partA.name}</div>
                  <div><span className="text-muted-foreground block text-xs">Rank</span>{formData.partA.present_rank}</div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-xs">Schedule of Duties</span>
                    {formData.partA.duties.length > 0 ? (
                      <ul className="list-disc pl-4 mt-1">
                        {formData.partA.duties.map((duty, i) => (
                          <li key={i}>{duty.text}</li>
                        ))}
                      </ul>
                    ) : 'No duties reported.'}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 mt-6">
              <label className="text-sm font-medium">Committee Recommendation</label>
              <select className="w-full px-3 py-2 border border-border rounded-md bg-background" 
                      value={formData.partD.recommendation} onChange={e => setFormData({...formData, partD: {...formData.partD, recommendation: e.target.value}})}
                      disabled={role !== 'dept_chairman' || urlState !== 'departmental_review'}>
                <option>Select recommendation...</option>
                <option>Recommend for Promotion</option>
                <option>Recommend for Annual Increment</option>
                <option>Warning / No Action</option>
              </select>
            </div>
            
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium text-muted-foreground">Committee Remarks</label>
              <textarea className="w-full px-3 py-2 border border-border rounded-md bg-background h-24" 
                        placeholder="Detailed remarks..." 
                        value={formData.partD.remarks} onChange={e => setFormData({...formData, partD: {...formData.partD, remarks: e.target.value}})}
                        disabled={role !== 'dept_chairman' || urlState !== 'departmental_review'}></textarea>
            </div>
            
            {role === 'dept_chairman' && urlState === 'departmental_review' && (
              <div className="pt-4 flex justify-end border-t border-border mt-6">
                <button 
                  onClick={() => handleAction("D", "Forwarded to A&P Committee")}
                  disabled={isSubmitting || formData.partD.recommendation === "Select recommendation..."}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Forwarding..." : "Forward to A&P Committee"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* PART E: A&P FINAL DECISION */}
        {activeTabId === "final_decision" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-xl font-semibold border-b border-border pb-3">Part E: Final Decision (A&P Committee)</h3>
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-6">
              <h4 className="font-semibold text-primary mb-2">Review Summary</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Department Recommended: <span className="font-medium text-foreground">{formData.partD.recommendation}</span></li>
                <li>• Supervisor Score: <span className="font-medium text-foreground">{calculatePartBTotal(formData.partB)}/100</span></li>
                <li>• Staff Acknowledgment: <span className="font-medium text-foreground">{formData.partC.agree ? "Agreed" : "Disagreed"}</span></li>
              </ul>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Final Enterprise Decision</label>
              <select className="w-full px-3 py-2 border border-border rounded-md bg-background focus:border-emerald-500 focus:ring-emerald-500" 
                      value={formData.partE.decision} onChange={e => setFormData({...formData, partE: {...formData.partE, decision: e.target.value}})}
                      disabled={role !== 'apc_chairman' || urlState !== 'final_decision'}>
                <option>Approve Promotion</option>
                <option>Approve Increment Only</option>
                <option>Reject Application</option>
              </select>
            </div>
            
            {role === 'apc_chairman' && urlState === 'final_decision' && (
              <div className="pt-4 flex justify-end border-t border-border mt-6">
                <button 
                  onClick={() => handleAction("E", "Final Decision recorded and saved.")}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Confirming..." : <><Check className="w-4 h-4"/> Confirm Final Decision</>}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
    <div className="hidden print:block">
      <PartAPrintLayout formData={formData} />
    </div>
    </>
  );
}
