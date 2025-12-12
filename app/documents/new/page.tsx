'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout'

interface Sample {
  id: string
  sampleCode: string
  name: string
}

interface DocumentLine {
  sampleId: string
  quantity: string
  batchNo: string
  remark: string
}

export default function NewDocumentPage() {
  const router = useRouter()
  const [docType, setDocType] = useState<'IN' | 'OUT' | 'RETURN' | 'DISPOSE'>('IN')
  const [description, setDescription] = useState('')
  const [samples, setSamples] = useState<Sample[]>([])
  const [lines, setLines] = useState<DocumentLine[]>([
    { sampleId: '', quantity: '', batchNo: '', remark: '' },
  ])
  const [returnFromDocNo, setReturnFromDocNo] = useState('')
  const [returnFromDocs, setReturnFromDocs] = useState<any[]>([])
  const [disposeInfo, setDisposeInfo] = useState({
    reason: '',
    method: '',
    operator: '',
    supervisor: '',
    approver: '',
  })
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = sessionStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
    loadSamples()
    if (docType === 'RETURN') {
      loadReturnFromDocs()
    }
  }, [docType])

  const loadSamples = async () => {
    try {
      const res = await fetch('/api/samples?pageSize=1000')
      const data = await res.json()
      setSamples(data.data || [])
    } catch (error) {
      console.error('Load samples error:', error)
    }
  }

  const loadReturnFromDocs = async () => {
    try {
      const res = await fetch('/api/documents?type=OUT&status=APPROVE&pageSize=1000')
      const data = await res.json()
      setReturnFromDocs(data.data || [])
    } catch (error) {
      console.error('Load return from docs error:', error)
    }
  }

  const addLine = () => {
    setLines([...lines, { sampleId: '', quantity: '', batchNo: '', remark: '' }])
  }

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index))
  }

  const updateLine = (index: number, field: keyof DocumentLine, value: string) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setLines(newLines)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 验证
      if (lines.some((l) => !l.sampleId || !l.quantity)) {
        alert('请填写完整的样本和数量')
        return
      }

      if (docType === 'RETURN' && !returnFromDocNo) {
        alert('返库单必须选择原出库单')
        return
      }

      if (docType === 'DISPOSE') {
        if (!disposeInfo.reason || !disposeInfo.method) {
          alert('请填写销毁原因和处理方式')
          return
        }
      }

      const returnFromDoc = returnFromDocs.find((d) => d.docNo === returnFromDocNo)

      const payload: any = {
        type: docType,
        description,
        lines: lines.map((l) => ({
          sampleId: l.sampleId,
          quantity: parseFloat(l.quantity),
          batchNo: l.batchNo || null,
          remark: l.remark || null,
        })),
      }

      if (docType === 'RETURN' && returnFromDoc) {
        payload.returnFromDocId = returnFromDoc.id
      }

      if (docType === 'DISPOSE') {
        payload.disposeReason = disposeInfo.reason
        payload.disposeMethod = disposeInfo.method
        payload.disposeOperator = disposeInfo.operator
        payload.disposeSupervisor = disposeInfo.supervisor
        payload.disposeApprover = disposeInfo.approver
      }

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || '创建失败')
        return
      }

      const data = await res.json()
      router.push(`/documents/${data.id}`)
    } catch (error) {
      console.error('Create document error:', error)
      alert('创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">新建单据</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">基本信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  单据类型 *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="IN">入库</option>
                  <option value="OUT">出库</option>
                  <option value="RETURN">返库</option>
                  <option value="DISPOSE">销毁</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {docType === 'RETURN' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  原出库单 *
                </label>
                <select
                  value={returnFromDocNo}
                  onChange={(e) => setReturnFromDocNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">请选择原出库单</option>
                  {returnFromDocs.map((doc) => (
                    <option key={doc.id} value={doc.docNo}>
                      {doc.docNo} - {new Date(doc.createdAt).toLocaleDateString('zh-CN')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {docType === 'DISPOSE' && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    销毁原因 *
                  </label>
                  <input
                    type="text"
                    value={disposeInfo.reason}
                    onChange={(e) =>
                      setDisposeInfo({ ...disposeInfo, reason: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    处理方式 *
                  </label>
                  <input
                    type="text"
                    value={disposeInfo.method}
                    onChange={(e) =>
                      setDisposeInfo({ ...disposeInfo, method: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    操作人
                  </label>
                  <input
                    type="text"
                    value={disposeInfo.operator}
                    onChange={(e) =>
                      setDisposeInfo({ ...disposeInfo, operator: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    监督人
                  </label>
                  <input
                    type="text"
                    value={disposeInfo.supervisor}
                    onChange={(e) =>
                      setDisposeInfo({ ...disposeInfo, supervisor: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    批准人
                  </label>
                  <input
                    type="text"
                    value={disposeInfo.approver}
                    onChange={(e) =>
                      setDisposeInfo({ ...disposeInfo, approver: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">单据明细</h2>
              <button
                type="button"
                onClick={addLine}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                添加行
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    样本 *
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    数量 *
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    批号
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    备注
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lines.map((line, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4">
                      <select
                        value={line.sampleId}
                        onChange={(e) =>
                          updateLine(index, 'sampleId', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">请选择样本</option>
                        {samples.map((sample) => (
                          <option key={sample.id} value={sample.id}>
                            {sample.sampleCode} - {sample.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        step="0.01"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(index, 'quantity', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={line.batchNo}
                        onChange={(e) =>
                          updateLine(index, 'batchNo', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={line.remark}
                        onChange={(e) =>
                          updateLine(index, 'remark', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-4">
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

