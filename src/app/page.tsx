'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Code2, Globe, MapPin, User2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs'

interface CodeData {
    _id: string
    useType: string
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
    const [error, setError] = useState<string | null>(null)
    const [codeLoading, setCodeLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchSubmissions()
    }, [])

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get('/api/usage')
            setSubmissions(response.data.data)
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Codeforces Submissions</h1>

                {error && (
                    <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {submissions.map((submission) => (
                        <motion.div
                            key={submission._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`px-3 py-1 rounded-full text-sm ${submission.status === 'Accepted'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {submission.status}
                                </div>
                            </div>

                            <a
                                href={submission.problemUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4"
                            >
                                <Globe size={16} />
                                Problem Link
                            </a>

                            <div className="flex items-center gap-2 text-gray-300 mb-2">
                                <MapPin size={16} />
                                {submission.userId.city}, {submission.userId.region}
                            </div>

                            <div className="flex items-center gap-2 text-gray-300 mb-4">
                                <User2 size={16} />
                                {submission.userId.ip}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fetchCode(submission._id)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            >
                                <Code2 size={16} />
                                View Code
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {showCodeModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl text-white">Code ({selectedCode.language})</h3>
                                <button
                                    onClick={() => setShowCodeModal(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            {codeLoading ? (
                                <div className="flex justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
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
                    </div>
                )}
            </div>
        </div>
    )
}
