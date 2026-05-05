'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

type Zone = { id: number; name: string; code: string; memberCount: number }

function Modal({
  zone,
  onClose,
  onSave,
}: {
  zone: Partial<Zone> | null
  onClose: () => void
  onSave: (data: { name: string; code: string; memberCount: number }) => Promise<void>
}) {
  const [name, setName] = useState(zone?.name ?? '')
  const [code, setCode] = useState(zone?.code ?? '')
  const [count, setCount] = useState(zone?.memberCount?.toString() ?? '0')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave({ name, code, memberCount: parseInt(count) || 0 })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          {zone?.id ? 'Edit Zone' : 'Add Zone'}
        </h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Zone Name</label>
            <input
              required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. Doha"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Code (3–4 letters)</label>
            <input
              required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="DOH"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Member Count</label>
            <input
              type="number" min={0} value={count} onChange={(e) => setCount(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-brand-700 text-white rounded-lg py-2 text-sm font-semibold hover:bg-brand-800 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [editing, setEditing] = useState<Partial<Zone> | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/zones')
    if (res.ok) setZones(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave(data: { name: string; code: string; memberCount: number }) {
    if (editing?.id) {
      await fetch(`/api/zones/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/zones', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    load()
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this zone?')) return
    await fetch(`/api/zones/${id}`, { method: 'DELETE' })
    load()
  }

  const total = zones.reduce((s, z) => s + z.memberCount, 0)

  return (
    <div className="min-h-screen">
      <Navbar isAdmin />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Zones</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {zones.length} zones · {total.toLocaleString()} total members
            </p>
          </div>
          <button
            onClick={() => setEditing({})}
            className="bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <span>+</span> Add Zone
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
          ) : zones.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No zones yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Zone</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Members</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Share</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{zone.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-gray-100 text-gray-600 text-xs font-mono px-2 py-0.5 rounded">
                        {zone.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-900">
                      {zone.memberCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-500">
                      {total > 0 ? ((zone.memberCount / total) * 100).toFixed(1) : '0.0'}%
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditing(zone)}
                          className="text-brand-600 hover:text-brand-800 font-medium text-xs px-2 py-1 rounded hover:bg-brand-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(zone.id)}
                          className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {editing !== null && (
        <Modal
          zone={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
