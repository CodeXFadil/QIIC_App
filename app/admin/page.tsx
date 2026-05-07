'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

type Zone = { id: number; name: string; code: string; memberCount: number; latitude: number | null; longitude: number | null }
type User = { id: number; email: string; name: string | null; role: string; createdAt: string }
type Tab  = 'zones' | 'users'

/* ─── Zone modal ─── */
function ZoneModal({ zone, onClose, onSave }: {
  zone: Partial<Zone>
  onClose: () => void
  onSave: (d: { name: string; code: string; memberCount: number; latitude?: number | null; longitude?: number | null }) => Promise<void>
}) {
  const [name, setName]   = useState(zone.name ?? '')
  const [code, setCode]   = useState(zone.code ?? '')
  const [count, setCount] = useState(zone.memberCount?.toString() ?? '0')
  const [lat, setLat]     = useState(zone.latitude?.toString()  ?? '')
  const [lng, setLng]     = useState(zone.longitude?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await onSave({
      name, code, memberCount: parseInt(count) || 0,
      latitude:  lat ? parseFloat(lat)  : null,
      longitude: lng ? parseFloat(lng) : null,
    })
    setSaving(false); onClose()
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">{zone.id ? 'Edit Zone' : 'Add Zone'}</h3>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Zone Name" value={name} onChange={setName} placeholder="e.g. Doha" />
          <Field label="Code (3–4 letters)" value={code}
            onChange={(v) => setCode(v.toUpperCase())} placeholder="DOH" maxLength={4} mono />
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Member Count</label>
            <input type="number" min={0} value={count} onChange={(e) => setCount(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          {/* Map coordinates */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Map Location <span className="text-gray-400 font-normal">(optional — find on <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="underline">Google Maps</a>, right-click → copy coordinates)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Latitude</label>
                <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)}
                  placeholder="25.2854"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Longitude</label>
                <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)}
                  placeholder="51.5310"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
          </div>
          <ModalButtons saving={saving} onClose={onClose} />
        </form>
      </div>
    </div>
  )
}

/* ─── User modal ─── */
function UserModal({ user, onClose, onSave }: {
  user: Partial<User> | null
  onClose: () => void
  onSave: (d: { email?: string; name: string; role: string; password?: string }) => Promise<void>
}) {
  const isEdit = !!user?.id
  const [email, setEmail]       = useState(user?.email ?? '')
  const [name, setName]         = useState(user?.name ?? '')
  const [role, setRole]         = useState(user?.role ?? 'viewer')
  const [password, setPassword] = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      await onSave({ ...(isEdit ? {} : { email }), name, role, ...(password ? { password } : {}) })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally { setSaving(false) }
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">{isEdit ? 'Edit User' : 'Add User'}</h3>
        {error && <p className="text-red-600 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <form onSubmit={submit} className="space-y-3">
          {!isEdit && (
            <Field label="Email" value={email} onChange={setEmail} placeholder="user@example.com" type="email" required />
          )}
          <Field label="Full Name (optional)" value={name} onChange={setName} placeholder="e.g. Mohammed Ali" />
          <Field label={isEdit ? 'New Password (leave blank to keep)' : 'Password'} value={password}
            onChange={setPassword} type="password" required={!isEdit} placeholder="••••••••" />
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="viewer">Viewer — can view only</option>
              <option value="admin">Admin — full access</option>
            </select>
          </div>
          <ModalButtons saving={saving} onClose={onClose} />
        </form>
      </div>
    </div>
  )
}

/* ─── Shared helpers ─── */
function Field({ label, value, onChange, placeholder = '', type = 'text', maxLength, mono, required }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string;
    type?: string; maxLength?: number; mono?: boolean; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input required={required} type={type} value={value} placeholder={placeholder}
        maxLength={maxLength} onChange={(e) => onChange(e.target.value)}
        className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${mono ? 'font-mono' : ''}`} />
    </div>
  )
}

function ModalButtons({ saving, onClose }: { saving: boolean; onClose: () => void }) {
  return (
    <div className="flex gap-2 pt-2">
      <button type="button" onClick={onClose}
        className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
      <button type="submit" disabled={saving}
        className="flex-1 bg-brand-700 text-white rounded-lg py-2 text-sm font-semibold hover:bg-brand-800 disabled:opacity-60">
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}

/* ─── Main page ─── */
export default function AdminPage() {
  const [tab, setTab]         = useState<Tab>('zones')
  const [role, setRole]       = useState<string>('viewer')
  const [zones, setZones]     = useState<Zone[]>([])
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [zoneModal, setZoneModal] = useState<Partial<Zone> | null>(null)
  const [userModal, setUserModal] = useState<Partial<User> | null>(null)

  const isAdmin = role === 'admin'

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.role) setRole(d.role) }).catch(() => {})
    loadZones()
  }, [])

  useEffect(() => { if (isAdmin && tab === 'users') loadUsers() }, [tab, isAdmin])

  async function loadZones() {
    setLoading(true)
    const r = await fetch('/api/zones'); if (r.ok) setZones(await r.json()); setLoading(false)
  }
  async function loadUsers() {
    const r = await fetch('/api/users'); if (r.ok) setUsers(await r.json())
  }

  async function saveZone(data: { name: string; code: string; memberCount: number; latitude?: number | null; longitude?: number | null }) {
    await fetch(zoneModal?.id ? `/api/zones/${zoneModal.id}` : '/api/zones', {
      method: zoneModal?.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }); loadZones()
  }
  async function deleteZone(id: number) {
    if (!confirm('Delete this zone?')) return
    await fetch(`/api/zones/${id}`, { method: 'DELETE' }); loadZones()
  }

  async function saveUser(data: { email?: string; name: string; role: string; password?: string }) {
    const res = await fetch(userModal?.id ? `/api/users/${userModal.id}` : '/api/users', {
      method: userModal?.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed') }
    loadUsers()
  }
  async function deleteUser(id: number) {
    if (!confirm('Remove this user?')) return
    await fetch(`/api/users/${id}`, { method: 'DELETE' }); loadUsers()
  }

  const total = zones.reduce((s, z) => s + z.memberCount, 0)

  return (
    <div className="min-h-screen">
      <Navbar isAdmin />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {tab === 'zones' ? 'Manage Zones' : 'Manage Users'}
            </h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isAdmin ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700'
            }`}>{isAdmin ? 'Admin' : 'Viewer'}</span>
          </div>
          {isAdmin && tab === 'zones' && (
            <button onClick={() => setZoneModal({})}
              className="bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
              <span>+</span> Add Zone
            </button>
          )}
          {isAdmin && tab === 'users' && (
            <button onClick={() => setUserModal({})}
              className="bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
              <span>+</span> Add User
            </button>
          )}
        </div>

        {/* Tabs — users tab only visible to admins */}
        <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
          <button onClick={() => setTab('zones')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'zones' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            Zones
          </button>
          {isAdmin && (
            <button onClick={() => setTab('users')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === 'users' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              Users
            </button>
          )}
        </div>

        {!isAdmin && (
          <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
            <span>👁️</span>
            <span>You have <strong>view-only</strong> access. Contact the admin to make changes.</span>
          </div>
        )}

        {/* ── Zones table ── */}
        {tab === 'zones' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 text-xs text-gray-400">
              {zones.length} zones · {total.toLocaleString()} total members
            </div>
            {loading ? (
              <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Zone</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Members</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Share</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pin</th>
                    {isAdmin && <th className="px-5 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {zones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{zone.name}</td>
                      <td className="px-5 py-3.5">
                        <span className="bg-gray-100 text-gray-600 text-xs font-mono px-2 py-0.5 rounded">{zone.code}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-gray-900">{zone.memberCount.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right text-gray-500">
                        {total > 0 ? ((zone.memberCount / total) * 100).toFixed(1) : '0.0'}%
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {zone.latitude && zone.longitude
                          ? <span title={`${zone.latitude}, ${zone.longitude}`} className="text-brand-600 text-sm">📍</span>
                          : <span title="No coordinates set" className="text-gray-300 text-sm">—</span>}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setZoneModal(zone)}
                              className="text-brand-600 hover:text-brand-800 font-medium text-xs px-2 py-1 rounded hover:bg-brand-50">Edit</button>
                            <button onClick={() => deleteZone(zone.id)}
                              className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 rounded hover:bg-red-50">Delete</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Users table ── */}
        {tab === 'users' && isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 text-xs text-gray-400">
              {users.length} user{users.length !== 1 ? 's' : ''}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name / Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Added</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900">{u.name || '—'}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setUserModal(u)}
                          className="text-brand-600 hover:text-brand-800 font-medium text-xs px-2 py-1 rounded hover:bg-brand-50">Edit</button>
                        <button onClick={() => deleteUser(u.id)}
                          className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 rounded hover:bg-red-50">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {zoneModal !== null && isAdmin && (
        <ZoneModal zone={zoneModal} onClose={() => setZoneModal(null)} onSave={saveZone} />
      )}
      {userModal !== null && isAdmin && (
        <UserModal user={userModal} onClose={() => setUserModal(null)} onSave={saveUser} />
      )}
    </div>
  )
}
