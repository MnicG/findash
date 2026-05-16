import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../../hooks'
import Card from '../../components/ui/Card'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import type { Client } from '../../types'

type FormData = { name: string; email: string; phone: string; document: string }
const empty: FormData = { name: '', email: '', phone: '', document: '' }

export default function Clients() {
  const navigate = useNavigate()
  const { data: clients, isLoading } = useClients()
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState<FormData>(empty)

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true) }
  const openEdit = (c: Client) => {
    setEditing(c)
    setForm({ name: c.name, email: c.email, phone: c.phone ?? '', document: c.document ?? '' })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { name: form.name, email: form.email, phone: form.phone || undefined, document: form.document || undefined }
    if (editing) await updateClient.mutateAsync({ id: editing.id, data: payload })
    else await createClient.mutateAsync(payload)
    setShowModal(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clients</h1>
          <p className="text-slate-500 mt-1">{clients?.length ?? 0} registered clients</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Client
        </button>
      </div>

      <Card>
        {isLoading ? <p className="text-slate-400 text-sm">Loading...</p> :
          !clients?.length ? <p className="text-slate-400 text-sm">No clients yet.</p> : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Name', 'Email', 'Phone', 'Created', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 pb-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 text-sm font-medium text-slate-700 cursor-pointer hover:text-emerald-500"
                      onClick={() => navigate(`/clients/${c.id}`)}>
                      {c.name}
                    </td>
                    <td className="py-3 text-sm text-slate-500">{c.email}</td>
                    <td className="py-3 text-sm text-slate-500">{c.phone ?? '—'}</td>
                    <td className="py-3 text-sm text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={(e) => { e.stopPropagation(); openEdit(c) }} className="text-slate-400 hover:text-blue-500 transition-colors"><Pencil size={15} /></button>
                        <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) deleteClient.mutate(c.id) }}
                          className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">{editing ? 'Edit Client' : 'New Client'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Name', key: 'name', required: true },
                { label: 'Email', key: 'email', required: true },
                { label: 'Phone', key: 'phone', required: false },
                { label: 'Document', key: 'document', required: false },
              ].map(({ label, key, required }) => (
                <div key={key}>
                  <label className="block text-sm text-slate-600 mb-1">{label}</label>
                  <input value={form[key as keyof FormData]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={required}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-2 rounded-lg text-sm font-medium">
                  {editing ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}