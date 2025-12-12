'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/layout'

interface Sample {
  id: string
  sampleCode: string
  name: string
  type: string | null
  spec: string | null
  unit: string | null
  source: string | null
  storageCondition: string | null
  expiryMonths: number | null
  location: { code: string; name: string } | null
  patientAge: number | null
  patientSex: string | null
  diagnosis: string | null
  detectedPathogen: string | null
  samplingDate: string | null
  volumeMl: number | null
}

export default function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [user, setUser] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingSample, setEditingSample] = useState<Sample | null>(null)

  useEffect(() => {
    const userStr = sessionStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
    loadSamples()
  }, [])

  const loadSamples = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/samples?search=${encodeURIComponent(search)}`)
      const data = await res.json()
      setSamples(data.data || [])
    } catch (error) {
      console.error('Load samples error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSamples()
  }, [search])

  const canViewSensitive = user && (user.role === 'ADMIN' || user.role === 'AUDIT')

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">样本管理</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="搜索样本编码或名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={() => {
                setEditingSample(null)
                setShowModal(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              新增样本
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    样本编码
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    规格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    单位
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    来源
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    存储位置
                  </th>
                  {canViewSensitive && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        患者年龄
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        性别
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        诊断
                      </th>
                    </>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {samples.map((sample) => (
                  <tr key={sample.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sample.sampleCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sample.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sample.type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sample.spec || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sample.unit || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sample.source || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sample.location ? `${sample.location.code} ${sample.location.name}` : '-'}
                    </td>
                    {canViewSensitive && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sample.patientAge ?? '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sample.patientSex || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sample.diagnosis ? (sample.diagnosis.length > 20 ? sample.diagnosis.substring(0, 20) + '...' : sample.diagnosis) : '-'}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingSample(sample)
                          setShowModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        编辑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <SampleModal
            sample={editingSample}
            onClose={() => {
              setShowModal(false)
              setEditingSample(null)
            }}
            onSave={() => {
              setShowModal(false)
              setEditingSample(null)
              loadSamples()
            }}
            canViewSensitive={canViewSensitive}
          />
        )}
      </div>
    </Layout>
  )
}

function SampleModal({
  sample,
  onClose,
  onSave,
  canViewSensitive,
}: {
  sample: Sample | null
  onClose: () => void
  onSave: () => void
  canViewSensitive: boolean
}) {
  const [formData, setFormData] = useState({
    sampleCode: sample?.sampleCode || '',
    name: sample?.name || '',
    type: sample?.type || '',
    spec: sample?.spec || '',
    unit: sample?.unit || '',
    source: sample?.source || '',
    storageCondition: sample?.storageCondition || '',
    expiryMonths: sample?.expiryMonths || '',
    locationId: '',
    patientAge: sample?.patientAge || '',
    patientSex: sample?.patientSex || '',
    diagnosis: sample?.diagnosis || '',
    detectedPathogen: sample?.detectedPathogen || '',
    samplingDate: sample?.samplingDate ? sample.samplingDate.split('T')[0] : '',
    volumeMl: sample?.volumeMl || '',
  })
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => setLocations(data.data || []))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userStr = sessionStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null

      const url = sample ? `/api/samples/${sample.id}` : '/api/samples'
      const method = sample ? 'PUT' : 'POST'

      const payload: any = { ...formData }
      if (payload.expiryMonths) payload.expiryMonths = parseInt(payload.expiryMonths)
      if (payload.patientAge) payload.patientAge = parseInt(payload.patientAge)
      if (payload.volumeMl) payload.volumeMl = parseFloat(payload.volumeMl)
      if (!payload.locationId) payload.locationId = null

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || '保存失败')
        return
      }

      onSave()
    } catch (error) {
      console.error('Save sample error:', error)
      alert('保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {sample ? '编辑样本' : '新增样本'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  样本编码 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sampleCode}
                  onChange={(e) =>
                    setFormData({ ...formData, sampleCode: e.target.value })
                  }
                  disabled={!!sample}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  名称 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  类型
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  规格
                </label>
                <input
                  type="text"
                  value={formData.spec}
                  onChange={(e) =>
                    setFormData({ ...formData, spec: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  单位
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  来源
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  存储条件
                </label>
                <input
                  type="text"
                  value={formData.storageCondition}
                  onChange={(e) =>
                    setFormData({ ...formData, storageCondition: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  有效期（月）
                </label>
                <input
                  type="number"
                  value={formData.expiryMonths}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryMonths: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  存储位置
                </label>
                <select
                  value={formData.locationId}
                  onChange={(e) =>
                    setFormData({ ...formData, locationId: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">请选择</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.code} - {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {canViewSensitive && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">临床敏感信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      患者年龄
                    </label>
                    <input
                      type="number"
                      value={formData.patientAge}
                      onChange={(e) =>
                        setFormData({ ...formData, patientAge: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      性别
                    </label>
                    <select
                      value={formData.patientSex}
                      onChange={(e) =>
                        setFormData({ ...formData, patientSex: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">请选择</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      诊断
                    </label>
                    <input
                      type="text"
                      value={formData.diagnosis}
                      onChange={(e) =>
                        setFormData({ ...formData, diagnosis: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      检测病原体
                    </label>
                    <input
                      type="text"
                      value={formData.detectedPathogen}
                      onChange={(e) =>
                        setFormData({ ...formData, detectedPathogen: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      采样日期
                    </label>
                    <input
                      type="date"
                      value={formData.samplingDate}
                      onChange={(e) =>
                        setFormData({ ...formData, samplingDate: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      体积(ml)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.volumeMl}
                      onChange={(e) =>
                        setFormData({ ...formData, volumeMl: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

