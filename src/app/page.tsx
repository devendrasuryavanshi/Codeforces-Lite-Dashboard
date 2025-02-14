'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, AlertCircle, Check, X, Database, Timer, Bug, ExternalLink, Info, Code2 } from 'lucide-react'
import { Inter, Space_Grotesk } from 'next/font/google'
import { useRouter } from 'next/navigation'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs'

const inter = Inter({ subsets: ['latin'] })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })
interface CodeData {
    _id: string
    status?: string
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

export default function Dashboard() {
    const [submissions, setSubmissions] = useState<CodeData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCode, setSelectedCode] = useState({ code: '', language: '' })
    const [showCodeModal, setShowCodeModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedSubmission, setSelectedSubmission] = useState<CodeData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [codeLoading, setCodeLoading] = useState(false)
    const router = useRouter()

    const statusConfig = {
        'Compilation Error': {
            color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
            icon: <AlertCircle size={16} className="text-yellow-400" />
        },
        'Time Limit Exceeded': {
            color: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
            icon: <Timer size={16} className="text-orange-400" />
        },
        'Memory Limit Exceeded': {
            color: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
            icon: <Database size={16} className="text-blue-400" />
        },
        'Runtime Error': {
            color: 'bg-red-500/20 border-red-500/30 text-red-400',
            icon: <Bug size={16} className="text-red-400" />
        },
        'Wrong Answer': {
            color: 'bg-rose-500/20 border-rose-500/30 text-rose-400',
            icon: <X size={16} className="text-rose-400" />
        },
        'Accepted': {
            color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
            icon: <Check size={16} className="text-emerald-400" />
        }
    }

    useEffect(() => {
        fetchSubmissions()
    }, [])

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
            setSelectedCode({
                code: response.data.data.code,
                language: submissions.find(sub => sub._id === id)?.codeLanguage || ''
            })
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

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6"
                    >
                        {error}
                    </motion.div>
                )}

                <div className="space-y-4">
                    {submissions.map((submission) => (
                        <motion.div
                            key={submission._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-6 items-center bg-gray-900/50 rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/30 transition-all"
                        >
                            {/* Status Badge */}
                            <div className={`flex items-center gap-2 ${statusConfig[submission.status as keyof typeof statusConfig]?.color}`}>
                                {statusConfig[submission.status as keyof typeof statusConfig]?.icon}
                                <span className="text-sm font-medium">{submission.status}</span>
                            </div>

                            {/* Language */}
                            <span className="text-purple-400 text-sm px-3 py-1.5 rounded-md bg-purple-500/10">
                                {submission.codeLanguage}
                            </span>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-gray-400">
                                <MapPin size={14} className="text-purple-400" />
                                <span className="text-sm">{submission.userId.city}</span>
                            </div>

                            {/* Problem Link */}
                            <motion.a
                                whileHover={{ scale: 1.02 }}
                                href={submission.problemUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                            >
                                <ExternalLink size={14} />
                                <span className="text-sm">Problem</span>
                            </motion.a>

                            {/* View Code Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => fetchCode(submission._id)}
                                className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                            >
                                <Code2 size={14} />
                                <span className="text-sm">Code</span>
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {/* Details Modal */}
                <AnimatePresence>
                    {showDetailsModal && selectedSubmission && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl border border-purple-500/20"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl text-purple-400 font-semibold">Submission Details</h3>
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="text-gray-400 hover:text-white p-1"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailItem label="Status" value={selectedSubmission.status || 'N/A'} />
                                        <DetailItem label="Language" value={selectedSubmission.codeLanguage} />
                                        <DetailItem label="City" value={selectedSubmission.userId.city} />
                                        <DetailItem label="Region" value={selectedSubmission.userId.region} />
                                        <DetailItem label="Country" value={selectedSubmission.userId.country} />
                                        <DetailItem label="IP" value={selectedSubmission.userId.ip} />
                                        <DetailItem label="Browser" value={selectedSubmission.userId.browser} />
                                        <DetailItem label="Timezone" value={selectedSubmission.userId.timezone} />
                                    </div>

                                    <a
                                        href={selectedSubmission.problemUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mt-4"
                                    >
                                        <ExternalLink size={16} />
                                        Open Problem
                                    </a>
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
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto border border-purple-500/20"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl text-purple-400 font-semibold">
                                        Code ({selectedCode.language})
                                    </h3>
                                    <button
                                        onClick={() => setShowCodeModal(false)}
                                        className="text-gray-400 hover:text-white p-1"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                {codeLoading ? (
                                    <div className="flex justify-center p-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
                                    </div>
                                ) : (
                                    <SyntaxHighlighter
                                        language={selectedCode.language.toLowerCase()}
                                        style={dracula}
                                        className="rounded-md"
                                    >
                                        {selectedCode.code}
                                    </SyntaxHighlighter>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-gray-800/50 p-3 rounded-lg">
        <div className="text-sm text-gray-400 mb-1">{label}</div>
        <div className="text-white truncate">{value}</div>
    </div>
)