import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../api/auth.api'
import { TrendingUp } from 'lucide-react'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await authApi.register(name, email, password)
      login(token, user)
      navigate('/dashboard')
    } catch {
      setError('Email already in use or invalid data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="text-white text-2xl font-bold">FinDash</span>
          </div>
          <h2 className="text-slate-400 text-sm">Create your account</h2>
        </div>

        <div className="bg-[#131929] rounded-2xl border border-white/10 p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Name', value: name, set: setName, type: 'text', placeholder: 'Your name' },
              { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', value: password, set: setPassword, type: 'password', placeholder: 'Min. 6 characters' },
            ].map(({ label, value, set, type, placeholder }) => (
              <div key={label}>
                <label className="block text-slate-400 text-sm mb-2">{label}</label>
                <input type={type} value={value} onChange={(e) => set(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder={placeholder} required minLength={type === 'password' ? 6 : undefined} />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}