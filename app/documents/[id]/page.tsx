'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Layout from '@/components/layout'

interface DocumentLine {
  id: string
  sample: { id: string; sampleCode: string; name: string }
  quantity: number
  batchNo: string | null
  remark: string | null
}

interface Document {
  id: string
  docNo: string
  type: string
  status: string
  description: string | null
  disposeReason: string | null
  disposeMethod: string | null
  disposeOperator: string | null
  disposeSupervisor: string | null
  disposeApprover: string | null
  returnFromDoc: { docNo: string } | null
  creator: { name: string }
  approver: { name: string } | null
  lines: DocumentLine[]
  createdAt: string
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = sessionStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
    loadDocument()
  }, [])

  const loadDocument = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${params.id}`)
      const data = await res.json()
      setDocument(data)
    } catch (error) {
      console.error('Load document error:', error)
    } finally {
      setLoading(false)
    }
  }

  const canEdit = document && document.status === 'DRAFT' && (user?.role === 'INPUT' || user?.role === 'ADMIN')
  const canApprove = document && document.status === 'SUBMIT' && (user?.role === 'AUDIT' || user?.role === 'ADMIN')

  const handleAction = async (action: string) => {
    if (!confirm(`确定要${action === 'approve' ? '审核通过' : action === 'reject' ? '拒绝' : '作废'}这个单据吗？`)) {
      return
    }

    try {
      const res = await fetch(`/api/documents/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || '操作失败')
        return
      }

      loadDocument()
    } catch (error: any) {
      alert(error.message || '操作失败')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">加载中...</div>
      </Layout>
    )
  }

  if (!document) {
    return (
      <Layout>
        <div className="text-center py-8">单据不存在</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">单据详情</h1>
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() => router.push(`/documents/${params.id}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                编辑
              </button>
            )}
            {canApprove && (
              <>
                <button
                  onClick={() => handleAction('approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  审核通过
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  拒绝
                </button>
              </>
            )}
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              返回
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">基本信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">单据号：</span>
              <span className="font-medium">{document.docNo}</span>
            </div>
            <div>
              <span className="text-gray-600">类型：</span>
              <span className="font-medium">
                {document.type === 'IN' ? '入库' : document.type === 'OUT' ? '出库' : document.type === 'RETURN' ? '返库' : '销毁'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">状态：</span>
              <span className={`font-medium ${
                document.status === 'APPROVE' ? 'text-green-600' :
                document.status === 'SUBMIT' ? 'text-yellow-600' :
                document.status === 'REJECT' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {document.status === 'DRAFT' ? '草稿' : document.status === 'SUBMIT' ? '已提交' : document.status === 'APPROVE' ? '已审核' : document.status === 'REJECT' ? '已拒绝' : '已作废'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">创建人：</span>
              <span className="font-medium">{document.creator.name}</span>
            </div>
            <div>
              <span className="text-gray-600">审核人：</span>
              <span className="font-medium">{document.approver?.name || '-'}</span>
            </div>
            <div>
              <span className="text-gray-600">创建时间：</span>
              <span className="font-medium">{new Date(document.createdAt).toLocaleString('zh-CN')}</span>
            </div>
            {document.returnFromDoc && (
              <div>
                <span className="text-gray-600">原出库单：</span>
                <span className="font-medium">{document.returnFromDoc.docNo}</span>
              </div>
            )}
            {document.description && (
              <div className="col-span-2">
                <span className="text-gray-600">描述：</span>
                <span className="font-medium">{document.description}</span>
              </div>
            )}
          </div>

          {document.type === 'DISPOSE' && (
            <div className="mt-6 border-t pt-6">
              <h3 className="font-bold mb-4">销毁信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">销毁原因：</span>
                  <span className="font-medium">{document.disposeReason || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">处理方式：</span>
                  <span className="font-medium">{document.disposeMethod || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">操作人：</span>
                  <span className="font-medium">{document.disposeOperator || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">监督人：</span>
                  <span className="font-medium">{document.disposeSupervisor || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">批准人：</span>
                  <span className="font-medium">{document.disposeApprover || '-'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">单据明细</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  样本编码
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  样本名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  数量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  批号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  备注
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {document.lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {line.sample.sampleCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {line.sample.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Number(line.quantity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {line.batchNo || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {line.remark || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

