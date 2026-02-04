import { useState } from 'react'
import './App.css'

const API_BASE = 'http://localhost:8001/api'

// Icon components for professional look
const Icons = {
  job: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>,
  users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  chat: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  brain: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 0-4 4c0 1.1.45 2.1 1.17 2.83L12 12l2.83-3.17A4 4 0 0 0 12 2z" /><path d="M12 12l-2.83 3.17A4 4 0 1 0 12 22a4 4 0 0 0 2.83-6.83L12 12z" /></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  bell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  upload: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  file: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>,
  star: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  starFilled: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  check: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>,
  x: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  copy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  chevronDown: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>,
  chevronUp: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>,
  arrowLeft: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  sparkle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" /></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  location: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  briefcase: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>,
  trophy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 22V8.5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2V22" /><path d="M18 4h-12a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V6a2 2 0 0 0-2-2z" /></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
}

function App() {
  // Navigation State
  const [activeView, setActiveView] = useState('create-job')
  const [currentStep, setCurrentStep] = useState(1)

  // Data States
  const [resumes, setResumes] = useState([])
  const [selectedResumes, setSelectedResumes] = useState(new Set())
  const [matchResults, setMatchResults] = useState(null)
  const [shortlisted, setShortlisted] = useState(new Set())
  const [expandedCandidate, setExpandedCandidate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [toast, setToast] = useState(null)
  const [scoreFilter, setScoreFilter] = useState(0)
  const [generatedJD, setGeneratedJD] = useState('')
  const [showJD, setShowJD] = useState(false)
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [expLevel, setExpLevel] = useState('3-5')

  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    description: '',
    summary: '',
    required_skills: '',
    preferred_skills: '',
    min_experience_years: ''
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Skills Management
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill))
  }

  // Resume handlers
  const toggleResumeSelection = (id) => {
    setSelectedResumes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllResumes = () => {
    if (selectedResumes.size === resumes.length) {
      setSelectedResumes(new Set())
    } else {
      setSelectedResumes(new Set(resumes.map(r => r.id)))
    }
  }

  const deleteResume = (id) => {
    setResumes(prev => prev.filter(r => r.id !== id))
    setSelectedResumes(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  // Upload handlers
  const handleJdUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    setLoadingText('Extracting job description...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/job/upload`, { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setJobData(prev => ({ ...prev, description: data.text }))
        setGeneratedJD(data.text)
        setShowJD(true)
        showToast('Job description extracted')
      }
    } catch (err) {
      showToast('Upload failed', 'error')
    }
    setLoading(false)
  }

  const handleResumeUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setLoading(true)
    setLoadingText(`Processing ${files.length} resume(s)...`)

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('job_id', 'default')

      try {
        const res = await fetch(`${API_BASE}/resume/upload`, { method: 'POST', body: formData })
        if (res.ok) {
          const data = await res.json()
          setResumes(prev => [...prev, { id: data.resume_id, name: file.name, ...data }])
        }
      } catch (err) {
        console.error(err)
      }
    }

    showToast(`${files.length} resume(s) uploaded`)
    setLoading(false)
  }

  // AI Generate JD
  const generateJD = () => {
    if (!jobData.title) {
      showToast('Please enter a job title first', 'error')
      return
    }
    setLoading(true)
    setLoadingText('AI is generating job description...')

    setTimeout(() => {
      // AI-generated skills based on job title
      const titleLower = jobData.title.toLowerCase()
      let aiSkills = []

      if (titleLower.includes('python') || titleLower.includes('backend') || titleLower.includes('data')) {
        aiSkills = ['Python', 'SQL', 'REST APIs', 'PostgreSQL', 'Docker']
      } else if (titleLower.includes('frontend') || titleLower.includes('react') || titleLower.includes('ui')) {
        aiSkills = ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML']
      } else if (titleLower.includes('fullstack') || titleLower.includes('full stack')) {
        aiSkills = ['React', 'Node.js', 'Python', 'PostgreSQL', 'Docker']
      } else if (titleLower.includes('devops') || titleLower.includes('sre') || titleLower.includes('cloud')) {
        aiSkills = ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD']
      } else if (titleLower.includes('ml') || titleLower.includes('machine learning') || titleLower.includes('ai')) {
        aiSkills = ['Python', 'TensorFlow', 'PyTorch', 'ML/AI', 'Data Analysis']
      } else if (titleLower.includes('java') || titleLower.includes('spring')) {
        aiSkills = ['Java', 'Spring Boot', 'Microservices', 'SQL', 'REST APIs']
      } else if (titleLower.includes('mobile') || titleLower.includes('ios') || titleLower.includes('android')) {
        aiSkills = ['React Native', 'Swift', 'Kotlin', 'Mobile Development', 'REST APIs']
      } else {
        aiSkills = ['Problem Solving', 'Communication', 'Team Collaboration', 'Analytical Skills']
      }

      // Add summary-based skills if available
      if (jobData.summary) {
        const summaryLower = jobData.summary.toLowerCase()
        if (summaryLower.includes('ai') || summaryLower.includes('ml')) aiSkills.push('ML/AI')
        if (summaryLower.includes('api')) aiSkills.push('API Development')
        if (summaryLower.includes('cloud')) aiSkills.push('Cloud Services')
        if (summaryLower.includes('database')) aiSkills.push('Database Management')
      }

      // Remove duplicates and set skills
      const uniqueSkills = [...new Set(aiSkills)]
      setSkills(uniqueSkills)

      const generated = `We are looking for a ${jobData.title} to join our team${jobData.company ? ` at ${jobData.company}` : ''}.

${jobData.summary || 'This role involves working on cutting-edge projects and collaborating with cross-functional teams.'}

Key Responsibilities:
• Design, develop, and maintain high-quality software solutions
• Collaborate with product managers and designers to deliver features
• Write clean, maintainable, and well-tested code
• Participate in code reviews and technical discussions
• Mentor junior team members

Requirements:
${uniqueSkills.map(s => `• Proficiency in ${s}`).join('\n')}
• ${expLevel} years of relevant experience
• Excellent communication skills
• Ability to work in a fast-paced environment

What We Offer:
• Competitive compensation package
• Remote-friendly work environment
• Learning and development opportunities
• Health and wellness benefits`

      setGeneratedJD(generated)
      setJobData(prev => ({ ...prev, description: generated }))
      setShowJD(true)
      setLoading(false)
      showToast('JD and skills generated by AI')
    }, 1500)
  }

  // Match handler
  const handleMatch = async () => {
    const resumeIds = selectedResumes.size > 0
      ? Array.from(selectedResumes)
      : resumes.map(r => r.id)

    if (!resumeIds.length) {
      showToast('Please upload resumes first', 'error')
      return
    }
    if (!jobData.title) {
      showToast('Please fill job title', 'error')
      return
    }

    setLoading(true)
    setLoadingText('Creating job...')

    try {
      // Step 1: Create the job first
      const jobPayload = {
        title: jobData.title,
        company: jobData.company || 'Company',
        description: generatedJD || jobData.description || jobData.title,
        required_skills: skills.length > 0 ? skills : ['General'],
        preferred_skills: jobData.preferred_skills ? jobData.preferred_skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        min_experience_years: parseInt(expLevel.split('-')[0]) || 0,
        education_requirement: 'Bachelor'
      }

      const jobRes = await fetch(`${API_BASE}/job/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobPayload)
      })

      if (!jobRes.ok) {
        const err = await jobRes.json()
        throw new Error(err.detail || 'Failed to create job')
      }

      const createdJob = await jobRes.json()
      setLoadingText('AI is analyzing candidates...')

      // Step 2: Match resumes against the job
      const matchRes = await fetch(`${API_BASE}/match/${createdJob.id}?top_k=50`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (matchRes.ok) {
        const data = await matchRes.json()
        setMatchResults(data)
        setCurrentStep(3)
        setActiveView('candidates')
        showToast(`Matched ${data.results?.length || 0} candidates`)
      } else {
        const err = await matchRes.json()
        showToast(err.detail || 'Matching failed', 'error')
      }
    } catch (err) {
      showToast(err.message, 'error')
    }
    setLoading(false)
  }

  // Export handlers
  const exportToCSV = async () => {
    if (!matchResults) return
    setLoading(true)
    setLoadingText('Generating CSV...')

    try {
      const res = await fetch(`${API_BASE}/export/csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchResults)
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `candidates_${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        showToast('CSV downloaded')
      }
    } catch (err) {
      showToast('Export failed', 'error')
    }
    setLoading(false)
  }

  const copyToClipboard = async () => {
    if (!matchResults) return
    try {
      const res = await fetch(`${API_BASE}/export/clipboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchResults)
      })
      if (res.ok) {
        const data = await res.json()
        await navigator.clipboard.writeText(data.text)
        showToast('Copied to clipboard')
      }
    } catch (err) {
      showToast('Copy failed', 'error')
    }
  }

  // Shortlist handler
  const toggleShortlist = (id) => {
    setShortlisted(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Utility
  const getInitials = (name) => {
    if (!name) return 'UN'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const reset = () => {
    setActiveView('create-job')
    setCurrentStep(1)
    setMatchResults(null)
    setResumes([])
    setSelectedResumes(new Set())
    setShortlisted(new Set())
    setScoreFilter(0)
    setSkills([])
    setGeneratedJD('')
    setShowJD(false)
    setJobData({ title: '', company: '', description: '', summary: '', required_skills: '', preferred_skills: '', min_experience_years: '' })
  }

  // Filter results
  const filteredResults = matchResults?.results?.filter(r => r.score.final_score >= scoreFilter) || []
  const selectedCount = selectedResumes.size

  // Matching preview stats
  const matchingPreview = resumes.length > 0 ? {
    strong: Math.floor(resumes.length * 0.2),
    potential: Math.floor(resumes.length * 0.5),
    low: Math.ceil(resumes.length * 0.3)
  } : null

  // Stats
  const stats = matchResults ? {
    total: matchResults.results?.length || 0,
    topScore: Math.max(...(matchResults.results?.map(r => r.score.final_score) || [0])),
    avgScore: Math.round((matchResults.results?.reduce((a, r) => a + r.score.final_score, 0) || 0) / (matchResults.results?.length || 1)),
    shortlisted: shortlisted.size
  } : null

  const canProceed = jobData.title && (generatedJD || jobData.description) && resumes.length > 0

  return (
    <div className="app">
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p className="loading-text">{loadingText}</p>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo">M</div>
            <div className="brand-text">
              <span className="brand-name">MatchFlow</span>
              <span className="brand-tag">Hiring Intelligence</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Recruitment</div>
            <div
              className={`nav-item ${activeView === 'create-job' ? 'active' : ''}`}
              onClick={() => { setActiveView('create-job'); setCurrentStep(1); }}
            >
              <span className="nav-icon">{Icons.job}</span>
              <span>Create Job</span>
            </div>
            <div
              className={`nav-item ${activeView === 'candidates' ? 'active' : ''} ${!matchResults ? 'disabled' : ''}`}
              onClick={() => matchResults && setActiveView('candidates')}
            >
              <span className="nav-icon">{Icons.users}</span>
              <span>Candidates</span>
              {shortlisted.size > 0 && <span className="nav-badge primary">{shortlisted.size}</span>}
            </div>
            <div
              className={`nav-item ${activeView === 'interviews' ? 'active' : ''}`}
              onClick={() => setActiveView('interviews')}
            >
              <span className="nav-icon">{Icons.calendar}</span>
              <span>Interviews</span>
              <span className="nav-badge warning">3</span>
            </div>
            <div
              className={`nav-item ${activeView === 'screening' ? 'active' : ''}`}
              onClick={() => setActiveView('screening')}
            >
              <span className="nav-icon">{Icons.chat}</span>
              <span>Screening</span>
              <span className="nav-badge success">12</span>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Analytics</div>
            <div
              className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              <span className="nav-icon">{Icons.chart}</span>
              <span>Dashboard</span>
            </div>
            <div
              className={`nav-item ${activeView === 'activity-logs' ? 'active' : ''}`}
              onClick={() => setActiveView('activity-logs')}
            >
              <span className="nav-icon">{Icons.brain}</span>
              <span>Activity Logs</span>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Settings</div>
            <div className="nav-item">
              <span className="nav-icon">{Icons.settings}</span>
              <span>Configuration</span>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">HR</div>
            <div>
              <div className="user-name">HR Admin</div>
              <div className="user-role">Recruiter</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <header className="topbar">
          <div className="breadcrumb">
            <span className="breadcrumb-item">MatchFlow</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">
              {activeView === 'create-job' && 'Create Job'}
              {activeView === 'candidates' && 'Candidates'}
              {activeView === 'interviews' && 'Interviews'}
              {activeView === 'screening' && 'WhatsApp Screening'}
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'activity-logs' && 'Activity Logs'}
            </span>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn">{Icons.bell}<span className="notification-dot"></span></button>
            <button className="topbar-btn">{Icons.settings}</button>
          </div>
        </header>

        <div className="page-content">
          {/* CREATE JOB VIEW */}
          {activeView === 'create-job' && (
            <>
              <div className="page-header">
                <h1 className="page-title">Create a job. We'll handle the hiring.</h1>
                <p className="page-subtitle">AI will generate JDs, screeners, and matching logic</p>
              </div>

              {/* Stepper */}
              <div className="stepper">
                <div className={`stepper-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                  <div className="stepper-number">{currentStep > 1 ? Icons.check : '1'}</div>
                  <span className="stepper-label">Role Intent</span>
                </div>
                <div className={`stepper-line ${currentStep > 1 ? 'active' : ''}`}></div>
                <div className={`stepper-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                  <div className="stepper-number">{currentStep > 2 ? Icons.check : '2'}</div>
                  <span className="stepper-label">AI Review</span>
                </div>
                <div className={`stepper-line ${currentStep > 2 ? 'active' : ''}`}></div>
                <div className={`stepper-step ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="stepper-number">3</div>
                  <span className="stepper-label">Activate</span>
                </div>
              </div>

              <div className="layout-grid">
                {/* LEFT: Role Intent Panel */}
                <div>
                  <div className="card">
                    <div className="card-header">
                      <h2 className="card-title">Define the role</h2>
                      <span className="ai-badge">{Icons.sparkle} AI-Powered</span>
                    </div>
                    <div className="card-body">
                      {/* Job Title + Company */}
                      <div className="card-section">
                        <div className="input-inline">
                          <input
                            type="text"
                            className="form-input form-input-large"
                            value={jobData.title}
                            onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                            placeholder="Senior Backend Engineer"
                            style={{ flex: 2 }}
                          />
                          <span className="input-separator">@</span>
                          <input
                            type="text"
                            className="form-input"
                            value={jobData.company}
                            onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                            placeholder="TechCorp"
                            style={{ flex: 1 }}
                          />
                        </div>
                        <p className="form-hint">Used to generate JD, screeners, and candidate scoring</p>
                      </div>

                      {/* Role Summary */}
                      <div className="card-section">
                        <div className="section-header">
                          <span className="section-title">Describe the role in one line</span>
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          value={jobData.summary}
                          onChange={(e) => setJobData({ ...jobData, summary: e.target.value })}
                          placeholder="Build scalable APIs for fintech payments"
                        />
                        <div className="btn-group" style={{ marginTop: '12px' }}>
                          <button className="btn btn-accent" onClick={generateJD}>
                            {Icons.sparkle} Generate JD with AI
                          </button>
                          <label className="btn btn-secondary">
                            <input type="file" accept=".pdf" onChange={handleJdUpload} className="hidden" />
                            {Icons.file} Upload Existing JD
                          </label>
                        </div>
                      </div>

                      {/* AI-Generated JD */}
                      {showJD && (
                        <div className="card-section">
                          <div className="expandable">
                            <div className="expandable-header" onClick={() => setShowJD(!showJD)}>
                              <span className="expandable-title">
                                {Icons.file} AI-Generated Job Description
                              </span>
                              <span className="expandable-toggle">{Icons.chevronDown}</span>
                            </div>
                            <div className="expandable-body">
                              <textarea
                                className="form-textarea"
                                value={generatedJD}
                                onChange={(e) => { setGeneratedJD(e.target.value); setJobData({ ...jobData, description: e.target.value }); }}
                                rows={10}
                              />
                              <div className="ai-notice">
                                {Icons.brain}
                                <span>Generated by MatchFlow AI — Your edits improve future hiring decisions</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      <div className="card-section">
                        <div className="section-header">
                          <span className="section-title">Required Skills</span>
                        </div>
                        <div className="skills-container">
                          {skills.map((skill, i) => (
                            <span key={i} className="skill-chip active">
                              {skill}
                              <span className="skill-remove" onClick={() => removeSkill(skill)}>{Icons.x}</span>
                            </span>
                          ))}
                          <input
                            type="text"
                            className="add-skill-btn"
                            placeholder="+ Add Skill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            onBlur={addSkill}
                            style={{ width: '100px' }}
                          />
                        </div>
                      </div>

                      {/* Experience Level */}
                      <div className="card-section">
                        <div className="section-header">
                          <span className="section-title">Experience Level</span>
                        </div>
                        <div className="experience-selector">
                          {['1-3', '3-5', '5-8', '8+'].map(level => (
                            <button
                              key={level}
                              className={`exp-option ${expLevel === level ? 'active' : ''}`}
                              onClick={() => setExpLevel(level)}
                            >
                              {level} years
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Candidate Intake Panel */}
                <div>
                  <div className="card">
                    <div className="card-header">
                      <h2 className="card-title">Candidate Intake</h2>
                    </div>
                    <div className="card-body">
                      <label className="upload-zone">
                        <input type="file" accept=".pdf" multiple onChange={handleResumeUpload} className="hidden" />
                        <div className="upload-icon">{Icons.upload}</div>
                        <div className="upload-title">Drag & drop resumes here</div>
                        <div className="upload-hint">or <strong>click to browse</strong></div>
                        <div className="upload-features">
                          <span className="upload-feature">{Icons.check} PDF only</span>
                          <span className="upload-feature">{Icons.check} Up to 500</span>
                          <span className="upload-feature">{Icons.check} AI matching</span>
                        </div>
                      </label>

                      {resumes.length > 0 && (
                        <>
                          <div className="file-list">
                            {resumes.slice(0, 5).map(resume => (
                              <div key={resume.id} className="file-item">
                                <div className="file-icon">{getInitials(resume.candidate_name)}</div>
                                <span className="file-name">{resume.candidate_name || resume.name}</span>
                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteResume(resume.id)}>{Icons.x}</button>
                              </div>
                            ))}
                            {resumes.length > 5 && (
                              <div className="file-item" style={{ justifyContent: 'center', color: 'var(--gray-500)' }}>
                                +{resumes.length - 5} more candidates
                              </div>
                            )}
                          </div>

                          {/* AI Matching Preview */}
                          {matchingPreview && (
                            <div className="matching-preview">
                              <div className="matching-header">
                                {Icons.search}
                                <span>AI Matching Preview</span>
                              </div>
                              <div className="matching-stats">
                                <div className="matching-stat">
                                  <span className="matching-dot green"></span>
                                  <span className="matching-label">Strong Fit</span>
                                  <span className="matching-value">{matchingPreview.strong}</span>
                                </div>
                                <div className="matching-stat">
                                  <span className="matching-dot yellow"></span>
                                  <span className="matching-label">Potential Match</span>
                                  <span className="matching-value">{matchingPreview.potential}</span>
                                </div>
                                <div className="matching-stat">
                                  <span className="matching-dot red"></span>
                                  <span className="matching-label">Low Match</span>
                                  <span className="matching-value">{matchingPreview.low}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Action Bar */}
              <div className="sticky-bar">
                <button className="btn btn-ghost" onClick={reset}>{Icons.arrowLeft} Back</button>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleMatch}
                  disabled={!canProceed}
                >
                  Create Job & Start Screening
                </button>
              </div>
            </>
          )}

          {/* CANDIDATES VIEW */}
          {activeView === 'candidates' && !matchResults && (
            <>
              <div className="page-header">
                <h1 className="page-title">Candidates</h1>
                <p className="page-subtitle">View and manage your candidate pipeline</p>
              </div>
              <div className="empty-state">
                <div className="empty-icon">{Icons.users}</div>
                <h3 className="empty-title">No candidates yet</h3>
                <p className="empty-text">Create a job and upload resumes to start matching candidates</p>
                <button className="btn btn-primary" onClick={() => setActiveView('create-job')}>Create Job</button>
              </div>
            </>
          )}

          {activeView === 'candidates' && matchResults && (
            <>
              <div className="page-header">
                <div className="page-header-row">
                  <div>
                    <h1 className="page-title">{jobData.title || 'Candidates'}</h1>
                    <p className="page-subtitle">
                      {matchResults.results?.length} candidates matched • {shortlisted.size} shortlisted
                    </p>
                  </div>
                  <div className="btn-group">
                    <button className="btn btn-secondary" onClick={copyToClipboard}>{Icons.copy} Copy</button>
                    <button className="btn btn-secondary" onClick={exportToCSV}>{Icons.download} Export</button>
                    <button className="btn btn-primary" onClick={() => { setActiveView('create-job'); setCurrentStep(1); }}>{Icons.plus} New Job</button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {stats && (
                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon primary">{Icons.users}</div>
                      <span className="stat-trend up">New</span>
                    </div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Candidates</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon success">{Icons.trophy}</div>
                    </div>
                    <div className="stat-value">{stats.topScore}%</div>
                    <div className="stat-label">Top Score</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon info">{Icons.chart}</div>
                    </div>
                    <div className="stat-value">{stats.avgScore}%</div>
                    <div className="stat-label">Average</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon warning">{Icons.star}</div>
                    </div>
                    <div className="stat-value">{stats.shortlisted}</div>
                    <div className="stat-label">Shortlisted</div>
                  </div>
                </div>
              )}

              <div className="filter-bar">
                <div className="filter-group">
                  <span className="filter-label">Min Score:</span>
                  <span className="filter-value">{scoreFilter}+</span>
                </div>
                <input type="range" className="filter-slider" min="0" max="100" value={scoreFilter} onChange={(e) => setScoreFilter(parseInt(e.target.value))} />
                <span className="filter-count">Showing {filteredResults.length} of {matchResults.results?.length}</span>
              </div>

              <div className="candidates-grid">
                {filteredResults.map(result => (
                  <CandidateCard
                    key={result.resume_id}
                    result={result}
                    isShortlisted={shortlisted.has(result.resume_id)}
                    isExpanded={expandedCandidate === result.resume_id}
                    onToggleShortlist={() => toggleShortlist(result.resume_id)}
                    onToggleExpand={() => setExpandedCandidate(expandedCandidate === result.resume_id ? null : result.resume_id)}
                    icons={Icons}
                  />
                ))}
              </div>
            </>
          )}

          {/* INTERVIEWS VIEW */}
          {activeView === 'interviews' && (
            <>
              <div className="page-header">
                <h1 className="page-title">Interview Schedule</h1>
                <p className="page-subtitle">Manage upcoming interviews and feedback collection</p>
              </div>
              <div className="empty-state">
                <div className="empty-icon">{Icons.calendar}</div>
                <h3 className="empty-title">No interviews scheduled</h3>
                <p className="empty-text">Once you shortlist candidates, you can schedule interviews here</p>
                <button className="btn btn-primary" onClick={() => setActiveView('candidates')}>View Candidates</button>
              </div>
            </>
          )}

          {/* SCREENING VIEW */}
          {activeView === 'screening' && (
            <>
              <div className="page-header">
                <h1 className="page-title">WhatsApp Screening</h1>
                <p className="page-subtitle">AI-powered conversational screening with candidates</p>
              </div>
              <div className="empty-state">
                <div className="empty-icon">{Icons.chat}</div>
                <h3 className="empty-title">WhatsApp screening ready</h3>
                <p className="empty-text">Candidates will be screened via WhatsApp automatically after job activation</p>
                <button className="btn btn-primary" onClick={() => setActiveView('create-job')}>Create Job</button>
              </div>
            </>
          )}

          {/* DASHBOARD VIEW */}
          {activeView === 'dashboard' && (
            <>
              <div className="page-header">
                <h1 className="page-title">Analytics Dashboard</h1>
                <p className="page-subtitle">other</p>
              </div>
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-header"><div className="stat-icon primary">{Icons.job}</div></div>
                  <div className="stat-value">12</div>
                  <div className="stat-label">Active Jobs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><div className="stat-icon success">{Icons.users}</div></div>
                  <div className="stat-value">248</div>
                  <div className="stat-label">Candidates</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><div className="stat-icon warning">{Icons.calendar}</div></div>
                  <div className="stat-value">18</div>
                  <div className="stat-label">Interviews</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><div className="stat-icon info">{Icons.clock}</div></div>
                  <div className="stat-value">4.2d</div>
                  <div className="stat-label">Avg Time to Hire</div>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Hiring Funnel</h2>
                </div>
                <div className="card-body">
                  <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '40px' }}>
                    Analytics charts will appear here once you have hiring data
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ACTIVITY LOGS VIEW */}
          {activeView === 'activity-logs' && (
            <>
              <div className="page-header">
                <h1 className="page-title">Activity Logs</h1>
                <p className="page-subtitle">AI learning feedback and improvement data</p>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Type</th>
                      <th>Change</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>2026-02-02 14:30</td>
                      <td><span className="badge badge-primary">JD Edit</span></td>
                      <td>Modified experience requirement</td>
                      <td>HR Admin</td>
                    </tr>
                    <tr>
                      <td>2026-02-02 14:28</td>
                      <td><span className="badge badge-warning">Score Override</span></td>
                      <td>Changed candidate #42 from 72 to 85</td>
                      <td>HR Admin</td>
                    </tr>
                    <tr>
                      <td>2026-02-02 14:25</td>
                      <td><span className="badge badge-success">Screener Edit</span></td>
                      <td>Added technical question</td>
                      <td>HR Admin</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// Candidate Card Component
function CandidateCard({ result, isShortlisted, isExpanded, onToggleShortlist, onToggleExpand, icons }) {
  const score = result.score.final_score
  const circumference = 2 * Math.PI * 18
  const offset = circumference - (score / 100) * circumference

  const getStatus = (score) => {
    if (score >= 75) return { text: 'Excellent', class: 'badge-success' }
    if (score >= 50) return { text: 'Good', class: 'badge-primary' }
    return { text: 'Potential', class: 'badge-warning' }
  }
  const status = getStatus(score)

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'UN'

  return (
    <div className={`candidate-card ${result.rank <= 1 ? 'top-match' : ''}`}>
      <div className="candidate-header">
        <div className="candidate-avatar">{getInitials(result.candidate_name)}</div>
        <div className="candidate-info">
          <div className="candidate-name">{result.candidate_name}</div>
          <div className="candidate-title">Rank #{result.rank}</div>
          <div className="candidate-meta">
            <span>{icons.location} Location</span>
            <span>{icons.briefcase} {result.experience_years || '?'}y</span>
          </div>
        </div>
        <div className="score-circle">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle className="score-circle-bg" cx="24" cy="24" r="18" />
            <circle className="score-circle-progress" cx="24" cy="24" r="18" strokeDasharray={circumference} strokeDashoffset={offset} />
          </svg>
          <span className="score-circle-value">{score.toFixed(0)}</span>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <span className={`badge ${status.class}`}>{status.text}</span>
      </div>

      <div className="candidate-skills">
        {result.skill_matches.filter(s => s.matched).slice(0, 3).map((s, i) => (
          <span key={i} className="skill-chip matched">{s.skill}</span>
        ))}
        {result.skill_matches.filter(s => !s.matched).length > 0 && (
          <span className="skill-chip missing">-{result.skill_matches.filter(s => !s.matched).length}</span>
        )}
      </div>

      {isExpanded && (
        <div className="analysis-panel">
          <div className="analysis-section">
            <div className="analysis-title">AI Analysis</div>
            <p className="analysis-text">{result.reasoning}</p>
          </div>
          <div className="analysis-section">
            <div className="analysis-title">Score Breakdown</div>
            <div className="score-breakdown">
              {[
                { label: 'Vector', value: result.score.vector_score },
                { label: 'LLM', value: result.score.llm_score },
                { label: 'Skills', value: result.score.skills_score },
                { label: 'Exp', value: result.score.experience_score }
              ].map((item, i) => (
                <div key={i} className="breakdown-item">
                  <div className="breakdown-label">{item.label}</div>
                  <div className="breakdown-value">{item.value.toFixed(0)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="candidate-actions">
        <button className={`btn btn-sm ${isShortlisted ? 'btn-success' : 'btn-secondary'}`} onClick={onToggleShortlist}>
          {isShortlisted ? icons.starFilled : icons.star} {isShortlisted ? 'Shortlisted' : 'Shortlist'}
        </button>
        <button className="btn btn-sm btn-ghost" onClick={onToggleExpand}>
          {isExpanded ? icons.chevronUp : icons.chevronDown} {isExpanded ? 'Less' : 'Details'}
        </button>
      </div>
    </div>
  )
}

export default App
