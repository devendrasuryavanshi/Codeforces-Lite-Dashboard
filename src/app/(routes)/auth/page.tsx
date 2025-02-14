'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Lock, KeyRound, ShieldCheck, Fingerprint } from 'lucide-react'

export default function AuthPage() {
  const [authCode, setAuthCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post('/api/auth/login', null, {
        headers: { authCode }
      })
      router.push('/')
    } catch (error) {
      setError('Invalid authentication code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-8 shadow-2xl border border-purple-500/20">
          <motion.div
            className="flex justify-center mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <div className="bg-purple-500/10 p-4 rounded-full ring-2 ring-purple-500/50 shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              <Fingerprint className="w-10 h-10 text-purple-400" />
            </div>
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-center mb-2">
            Secure Access
          </h1>

          <p className="text-gray-400 text-center mb-8">
            Enter your authentication code to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
              <input
                type="password"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="Enter auth code"
                className="w-full pl-12 pr-4 py-4 bg-purple-950/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 border border-purple-500/20 placeholder-gray-500 transition-all"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center space-x-2 text-red-400 text-sm bg-red-950/30 py-2 rounded-lg"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(147,51,234,0.5)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-medium transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Authenticate</span>
                </div>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
