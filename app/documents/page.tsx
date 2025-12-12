'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/layout'
import { useRouter } from 'next/navigation'

interface Document {
  id: string
  docNo: string
  type: string
  status: string
  description: string | null
  creator: { name: string }
  approver: { name: string } | null
  createdAt: string
  lines: Array<{ sample: { sampleCode: string; name: string } }>
}

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = sessionStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
    loadDocuments()
  }, [filterType, filterStatus])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType) params.append('type', filterType)
      if (filterStatus) params.append('status', filterStatus)
      const res = await fetch(`/api/documents?${params.toString()}`)
      const data = await res.json()
      setDocuments(data.data || [])
    } catch (error) {
      console.error('Load documents error:', error)
    } finally {
      setLoading(false)
    }
  }

  const canCreate = user && (user.role === 'INPUT' || user.role === 'ADMIN')
  const canApprove = user && (user.role === 'AUDIT' || user.role === 'ADMIN')

  const handleAction = async (docId: string, action: string) => {
    if (!confirm(`确定要${action === 'approve' ? '审核通过' : action === 'reject' ? '拒绝' : '作废'}这个单据吗？`)) {
      return
    }

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || '操作失败')
        return
      }

      loadDocuments()
    } catch (error) {
      alert('操作失败')
    }
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">单据管理</h1>
          {canCreate && (
            <button
              onClick={() => router.push('/documents/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              新建单据
            </button>
          )}
        </div>

        <div className="mb-4 flex gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">全部类型</option>
            <option value="IN">入库</option>
            <option value="OUT">出库</option>
            <option value="RETURN">返库</option>
            <option value="DISPOSE">销毁</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">全部状态</option>
            <option value="DRAFT">草稿</option>
            <option value="SUBMIT">已提交</option>
            <option value="APPROVE">已审核</option>
            <option value="REJECT">已拒绝</option>
            <option value="CANCEL">已作废</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    单据号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    创建人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    审核人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doc.docNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.type === 'IN' ? '入库' : doc.type === 'OUT' ? '出库' : doc.type === 'RETURN' ? '返库' : '销毁'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          doc.status === 'APPROVE'
                            ? 'bg-green-100 text-green-800'
                            : doc.status === 'SUBMIT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : doc.status === 'REJECT'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {doc.status === 'DRAFT' ? '草稿' : doc.status === 'SUBMIT' ? '已提交' : doc.status === 'APPROVE' ? '已审核' : doc.status === 'REJECT' ? '已拒绝' : '已作废'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.creator.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.approver?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/documents/${doc.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        详情
                      </button>
                      {doc.status === 'SUBMIT' && canApprove && (
                        <>
                          <button
                            onClick={() => handleAction(doc.id, 'approve')}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            审核
                          </button>
                          <button
                            onClick={() => handleAction(doc.id, 'reject')}
                            className="text-red-600 hover:text-red-900"
                          >
                            拒绝
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

