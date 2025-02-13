'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Code2, Globe, MapPin, User2 } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeData {
  _id: string
  status: string
  problemUrl: string
  codeLanguage: string
  browser: string
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
  }
}

export default function Dashboard() {
  const [submissions, setSubmissions] = useState<CodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCode, setSelectedCode] = useState({ code: '', language: '' })
  const [showCodeModal, setShowCodeModal] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get('https://codeforces-lite-dashboard.vercel.app/api/usage')
      setSubmissions(response.data.data)
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const authCode = prompt('Please enter your authentication code:') || '';
        if (authCode) {
          try {
            await axios.post('https://codeforces-lite-dashboard.vercel.app/api/auth/login', null, {
              headers: { authCode }
            });
             await fetchSubmissions();
          } catch (loginError) {
            console.error('Login failed:', loginError);
          }
        }
      }
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCode = async (id: string) => {
    try {
      const response = await axios.get(`https://codeforces-lite-dashboard.vercel.app/api/code?id=${id}`)
      setSelectedCode({
        code: response.data.data.code,
        language: submissions.find(sub => sub._id === id)?.codeLanguage || ''
      })
      setShowCodeModal(true)
    } catch (error) {
      console.error('Error fetching code:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Codeforces Submissions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {submissions.map((submission) => (
          <motion.div
            key={submission._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={`px-3 py-1 rounded-full text-sm ${submission.status === 'Accepted' ? 'bg-green-500/20 text-green-400' :
                'bg-red-500/20 text-red-400'
                }`}>
                {submission.status}
              </div>
            </div>

            <a href={submission.problemUrl} target="_blank" rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-white">Code ({selectedCode.language})</h3>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <SyntaxHighlighter
              language={selectedCode.language.toLowerCase()}
              style={vscDarkPlus}
              className="rounded-md"
            >
              {selectedCode.code}
            </SyntaxHighlighter>
          </motion.div>
        </div>
      )}
    </div>
  )
}
