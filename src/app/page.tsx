'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, AlertCircle, Check, X, Database, Timer, Bug, ExternalLink, Info, Code2, Network, Badge, FileCode, Globe, Copy, Palette, Chrome, BarChart3, Code, Award, Users, Activity, Zap, Brain } from 'lucide-react'
import { Inter, Space_Grotesk } from 'next/font/google'
import { useRouter } from 'next/navigation'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { InfoCard } from './components/InfoCard'

const inter = Inter({ subsets: ['latin'] })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })
interface CodeData {
    _id: string
    status: string
    problemName: string;
    problemUrl: string
    codeLanguage: string
    createdAt: string
    userId: {
        _id: string
        ip: string
        city: string
        region: string
        country: string
        org: string
        postal: string
        timezone: string
        browser: string
        theme: string
        ui: string
    }
}

interface Statistics {
    totalSubmissions: number
    acceptedSubmissions: number
    uniqueProblems: number
    activeStreak: number
    languages: { [key: string]: number }
    successRate: number
}

export default function Dashboard() {
    const [submissions, setSubmissions] = useState<CodeData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCodeData, setSelectedCodeData] = useState({ code: '', problemName: '', problemUrl: '', codeLanguage: '' })
    const [showCodeModal, setShowCodeModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedSubmission, setSelectedSubmission] = useState<CodeData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [codeLoading, setCodeLoading] = useState(false)
    const router = useRouter()

    const [stats, setStats] = useState<Statistics>({
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        uniqueProblems: 0,
        activeStreak: 0,
        languages: {},
        successRate: 0
    })

    const statusConfig = {
        'Submitted': {
            shortName: 'SB',
            color: 'bg-gray-500/15 border-gray-500/30 text-gray-400',
            icon: <Clock size={16} className="text-gray-400" />,
        },
        'Compilation Error': {
            shortName: 'CE',
            color: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
            icon: <AlertCircle size={16} className="text-amber-400" />,
        },
        'Time Limit Exceeded': {
            shortName: 'TLE',
            color: 'bg-orange-600/15 border-orange-600/30 text-orange-400',
            icon: <Timer size={16} className="text-orange-400" />,
        },
        'Memory Limit Exceeded': {
            shortName: 'MLE',
            color: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
            icon: <Database size={16} className="text-cyan-400" />,
        },
        'Runtime Error': {
            shortName: 'RE',
            color: 'bg-red-500/15 border-red-500/30 text-red-400',
            icon: <Bug size={16} className="text-red-400" />,
        },
        'Wrong Answer': {
            shortName: 'WA',
            color: 'bg-rose-600/15 border-rose-600/30 text-rose-400',
            icon: <X size={16} className="text-rose-400" />,
        },
        'Accepted': {
            shortName: 'AC',
            color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
            icon: <Check size={16} className="text-emerald-400" />,
        }
    }

    // Update the calculateStreak function
    const calculateStreak = (submissions: CodeData[]): number => {
        if (submissions.length === 0) return 0;

        const sortedSubmissions = [...submissions].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        let currentDate = new Date(sortedSubmissions[0].createdAt);
        currentDate.setHours(0, 0, 0, 0);

        // Check if the last submission is within last 24 hours
        if ((today.getTime() - currentDate.getTime()) > (86400000 * 2)) {
            return 0;
        }

        const seenDates = new Set();

        for (const submission of sortedSubmissions) {
            const submissionDate = new Date(submission.createdAt);
            submissionDate.setHours(0, 0, 0, 0);
            const dateStr = submissionDate.toISOString().split('T')[0];

            if (!seenDates.has(dateStr)) {
                seenDates.add(dateStr);

                if (streak === 0 ||
                    (currentDate.getTime() - submissionDate.getTime()) === 86400000) {
                    streak++;
                    currentDate = submissionDate;
                } else {
                    break;
                }
            }
        }

        return streak;
    };

    const calculateStatistics = (submissions: CodeData[]): Statistics => {
        const totalSubmissions = submissions.length;
        const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted').length;

        const uniqueProblems = new Set(submissions.map(s => s.problemUrl)).size;

        const languages = submissions.reduce((acc: { [key: string]: number }, curr) => {
            const lang = curr.codeLanguage;
            acc[lang] = (acc[lang] || 0) + 1;
            return acc;
        }, {});

        const successRate = totalSubmissions > 0
            ? (acceptedSubmissions / totalSubmissions) * 100
            : 0;

        const streak = calculateStreak(submissions);

        return {
            totalSubmissions,
            acceptedSubmissions,
            uniqueProblems,
            activeStreak: streak,
            languages,
            successRate
        };
    };

    useEffect(() => {
        const fetchAndCalculateStats = async () => {
            await fetchSubmissions();
        };

        fetchAndCalculateStats();
    }, []);

    useEffect(() => {
        if (submissions.length > 0) {
            const calculatedStats = calculateStatistics(submissions);
            setStats(calculatedStats);
        }
    }, [submissions]);

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get('/api/usage')
            setSubmissions(response.data.data)
            console.log(response.data.data)
            setError(null)
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                router.push('/auth')
            } else {
                setError('Failed to fetch submissions')
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchCode = async (id: string) => {
        setCodeLoading(true)
        try {
            const response = await axios.get(`/api/code?id=${id}`)
            setSelectedCodeData({
                problemUrl: response.data.data.problemUrl,
                problemName: response.data.data.problemName,
                code: response.data.data.code,
                codeLanguage: response.data.data.codeLanguage
            })

            console.log(response.data);
            setShowCodeModal(true)
            setError(null)
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                router.push('/auth')
            } else {
                setError('Failed to fetch code')
            }
        } finally {
            setCodeLoading(false)
        }
    }
    const handleViewDetails = (submission: CodeData) => {
        setSelectedSubmission(submission)
        setShowDetailsModal(true)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="animate-pulse text-4xl font-bold text-purple-500">
                    Loading<span className="animate-blink">...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8"
                >
                    Codeforces Submissions
                </motion.h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-purple-900/40 to-black rounded-xl p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <Code size={20} className="text-purple-400" />
                            </div>
                            <h3 className="text-gray-400">Total Submissions</h3>
                        </div>
                        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            {stats.totalSubmissions}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-emerald-900/40 to-black rounded-xl p-4 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                                <Award size={20} className="text-emerald-400" />
                            </div>
                            <h3 className="text-gray-400">Success Rate</h3>
                        </div>
                        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">
                            {stats.successRate.toFixed(1)}%
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-pink-900/40 to-black rounded-xl p-4 border border-pink-500/30 hover:border-pink-500/50 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-pink-500/20">
                                <Brain size={20} className="text-pink-400" />
                            </div>
                            <h3 className="text-gray-400">Unique Problems</h3>
                        </div>
                        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-600">
                            {stats.uniqueProblems}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-blue-900/40 to-black rounded-xl p-4 border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Zap size={20} className="text-blue-400" />
                            </div>
                            <h3 className="text-gray-400">Active Streak</h3>
                        </div>
                        <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600">
                            {stats.activeStreak} days
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gradient-to-br from-gray-900/90 to-black rounded-xl p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <BarChart3 size={20} className="text-purple-400" />
                            </div>
                            <h3 className="text-gray-200">Languages Used</h3>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(stats.languages).map(([lang, count]) => (
                                <div key={lang} className="flex items-center gap-3">
                                    <div className="flex-1 bg-purple-500/10 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                            style={{ width: `${(count / stats.totalSubmissions) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-400 min-w-[100px]">
                                        {lang} ({count})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gradient-to-br from-gray-900/90 to-black rounded-xl p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <Activity size={20} className="text-purple-400" />
                            </div>
                            <h3 className="text-gray-200">Submission Status</h3>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(
                                submissions.reduce((acc, curr) => {
                                    acc[curr.status] = (acc[curr.status] || 0) + 1
                                    return acc
                                }, {} as { [key: string]: number })
                            ).map(([status, count]) => (
                                <div key={status} className="flex items-center gap-3">
                                    <div className="flex-1 bg-purple-500/10 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                            style={{ width: `${(count / stats.totalSubmissions) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-400 min-w-[150px]">
                                        {status} ({count})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6"
                    >
                        {error}
                    </motion.div>
                )}

                <div className="space-y-6">
                    {submissions.map((submission) => (
                        <motion.div
                            key={submission._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative overflow-hidden bg-gradient-to-r from-gray-900/90 to-black rounded-2xl p-4 md:p-5 border border-purple-500/20 hover:border-purple-500/40 shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 flex-1">
                                    <div className={`flex items-center justify-center w-auto sm:w-[70px] gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl backdrop-blur-sm ${statusConfig[submission.status as keyof typeof statusConfig]?.color}`}>
                                        <div className="rounded-lg">
                                            {statusConfig[submission.status as keyof typeof statusConfig].icon}
                                        </div>
                                        <span className={`text-sm font-bold tracking-wide ${spaceGrotesk.className}`}>
                                            {statusConfig[submission.status as keyof typeof statusConfig].shortName}
                                        </span>
                                    </div>

                                    <div className="space-y-2 flex-1 min-w-0">
                                        <a
                                            href={submission.problemUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-gray-200 hover:text-purple-400 transition-colors group"
                                        >
                                            <ExternalLink size={16} className="opacity-50 group-hover:opacity-100 flex-shrink-0" />
                                            <span className="text-sm font-medium truncate">
                                                {submission.problemName || submission.problemUrl}
                                            </span>
                                        </a>

                                        <div className="hidden md:flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <Globe size={14} className="text-purple-400" />
                                                <span>{submission.userId.city}, {submission.userId.country}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <Clock size={14} className="text-purple-400" />
                                                <span>
                                                    {new Date(submission.createdAt).toLocaleDateString('en-US', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Mobile timestamp only */}
                                        <div className="md:hidden flex items-center gap-2 text-sm text-gray-400">
                                            <Clock size={14} className="text-purple-400" />
                                            <span>
                                                {new Date(submission.createdAt).toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => fetchCode(submission._id)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 text-purple-400 hover:text-purple-300 transition-all duration-200 flex-1 sm:flex-initial"
                                    >
                                        <Code2 size={16} />
                                        <span className="font-medium">Code</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleViewDetails(submission)}
                                        className="p-2.5 rounded-xl bg-gray-800/50 hover:bg-gray-800/70 border border-purple-500/20 hover:border-purple-500/40 text-purple-400 hover:text-purple-300 transition-all duration-200"
                                    >
                                        <Info size={16} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Information Modal */}
                <AnimatePresence>
                    {showDetailsModal && selectedSubmission && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-8 w-full max-w-2xl border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.15)]"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                            <FileCode size={24} className="text-purple-400" />
                                        </div>
                                        <h3 className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-bold">
                                            Submission Details
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="p-2 rounded-lg hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 transition-all duration-200"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 flex items-center gap-3 p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
                                            <Badge size={18} className="text-purple-400" />
                                            <div>
                                                <div className="text-sm text-purple-300 mb-1">Status</div>
                                                <div className="text-lg font-semibold text-white">{selectedSubmission.status}</div>
                                            </div>
                                        </div>

                                        <InfoCard icon={Code2} label="Language" value={selectedSubmission.codeLanguage} />
                                        <InfoCard icon={MapPin} label="Location" value={`${selectedSubmission.userId.city}, ${selectedSubmission.userId.country}`} />
                                        <InfoCard icon={Globe} label="Region" value={selectedSubmission.userId.region} />
                                        <InfoCard icon={Network} label="IP Address" value={selectedSubmission.userId.ip} />
                                        <InfoCard icon={Palette} label="Theme" value={selectedSubmission.userId.theme} />
                                        <InfoCard icon={Chrome} label="Browser" value={selectedSubmission.userId.browser} />
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-purple-500/20">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-purple-400" />
                                            <span className="text-sm text-purple-300">{selectedSubmission.userId.timezone}</span>
                                        </div>
                                        <a
                                            href={selectedSubmission.problemUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 transition-all duration-200"
                                        >
                                            <ExternalLink size={16} />
                                            View Problem
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Code Modal */}
                <AnimatePresence>
                    {showCodeModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                            >
                                <div className="p-4 border-b border-purple-500/20 bg-black/40">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                                <FileCode size={20} className="text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                                                    <a
                                                        href={selectedCodeData.problemUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="transition-opacity flex items-center gap-2"
                                                    >
                                                        {selectedCodeData.problemName || selectedCodeData.problemUrl}
                                                        <ExternalLink size={16} className="opacity-50 group-hover:opacity-100" />
                                                    </a>
                                                </h3>
                                                <p className="text-sm text-gray-400">
                                                    Language: {selectedCodeData.codeLanguage}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => navigator.clipboard.writeText(selectedCodeData.code)}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 transition-all duration-200"
                                            >
                                                <Copy size={14} />
                                                <span className="text-sm">Copy</span>
                                            </motion.button>
                                            <button
                                                onClick={() => setShowCodeModal(false)}
                                                className="p-2 rounded-lg hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 transition-all duration-200"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto p-4">
                                    {codeLoading ? (
                                        <div className="flex justify-center items-center p-8">
                                            <div className="relative">
                                                <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500/20 border-t-purple-500" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Code2 size={16} className="text-purple-400" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-purple-500/20 bg-black/40">
                                            <SyntaxHighlighter
                                                language={selectedCodeData.codeLanguage.toLowerCase()}
                                                style={dracula}
                                                customStyle={{
                                                    background: 'transparent',
                                                    padding: '1.5rem',
                                                    margin: 0,
                                                    fontSize: '0.9rem',
                                                }}
                                                showLineNumbers={true}
                                                wrapLines={true}
                                            >
                                                {selectedCodeData.code}
                                            </SyntaxHighlighter>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}