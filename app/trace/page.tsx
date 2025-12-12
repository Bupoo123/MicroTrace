'use client'

import { useState } from 'react'
import Layout from '@/components/layout'

export default function TracePage() {
  const [traceType, setTraceType] = useState<'sample' | 'document'>('sample')
  const [sampleCode, setSampleCode] = useState('')
  const [docNo, setDocNo] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTrace = async () => {
    if (traceType === 'sample' && !sampleCode) {
      alert('请输入样本编码')
      return
    }
    if (traceType === 'document' && !docNo) {
      alert('请输入单据号')
      return
    }

    setLoading(true)
    try {
      const url =
        traceType === 'sample'
          ? `/api/trace/sample?sampleCode=${encodeURIComponent(sampleCode)}`
          : `/api/trace/document?docNo=${encodeURIComponent(docNo)}`
      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok) {
        alert(data.error || '查询失败')
        return
      }

      setResult(data)
    } catch (error) {
      alert('查询失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">溯源查询</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              查询类型
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="sample"
                  checked={traceType === 'sample'}
                  onChange={(e) => {
                    setTraceType('sample')
                    setResult(null)
                  }}
                  className="mr-2"
                />
                样本溯源
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="document"
                  checked={traceType === 'document'}
                  onChange={(e) => {
                    setTraceType('document')
                    setResult(null)
                  }}
                  className="mr-2"
                />
                单据溯源
              </label>
            </div>
          </div>

          {traceType === 'sample' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                样本编码
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sampleCode}
                  onChange={(e) => setSampleCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="请输入样本编码"
                />
                <button
                  onClick={handleTrace}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '查询中...' : '查询'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                单据号
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={docNo}
                  onChange={(e) => setDocNo(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="请输入单据号"
                />
                <button
                  onClick={handleTrace}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '查询中...' : '查询'}
                </button>
              </div>
            </div>
          )}
        </div>

        {result && traceType === 'sample' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold mb-4">样本信息</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">样本编码：</span>
                  <span className="font-medium">{result.sample.sampleCode}</span>
                </div>
                <div>
                  <span className="text-gray-600">名称：</span>
                  <span className="font-medium">{result.sample.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">当前库存：</span>
                  <span className="font-medium text-blue-600">{result.stock}</span>
                </div>
                <div>
                  <span className="text-gray-600">存储位置：</span>
                  <span className="font-medium">
                    {result.sample.location
                      ? `${result.sample.location.code} ${result.sample.location.name}`
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">生命周期轨迹</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        操作类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        单据号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        数量变化
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        操作人
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.transactions.map((t: any) => (
                      <tr key={t.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(t.createdAt).toLocaleString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {t.type === 'IN'
                            ? '入库'
                            : t.type === 'OUT'
                            ? '出库'
                            : t.type === 'RETURN'
                            ? '返库'
                            : '销毁'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {t.document.docNo}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            Number(t.quantityDelta) > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {Number(t.quantityDelta) > 0 ? '+' : ''}
                          {Number(t.quantityDelta)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {t.operator?.name || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {result && traceType === 'document' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold mb-4">单据信息</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">单据号：</span>
                  <span className="font-medium">{result.document.docNo}</span>
                </div>
                <div>
                  <span className="text-gray-600">类型：</span>
                  <span className="font-medium">
                    {result.document.type === 'IN'
                      ? '入库'
                      : result.document.type === 'OUT'
                      ? '出库'
                      : result.document.type === 'RETURN'
                      ? '返库'
                      : '销毁'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">状态：</span>
                  <span className="font-medium">
                    {result.document.status === 'DRAFT'
                      ? '草稿'
                      : result.document.status === 'SUBMIT'
                      ? '已提交'
                      : result.document.status === 'APPROVE'
                      ? '已审核'
                      : result.document.status === 'REJECT'
                      ? '已拒绝'
                      : '已作废'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">创建人：</span>
                  <span className="font-medium">{result.document.creator.name}</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">单据明细</h2>
              <div className="overflow-x-auto">
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.document.lines.map((line: any) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {result.transactions.length > 0 && (
              <div className="p-6 border-t">
                <h2 className="text-xl font-bold mb-4">库存流水</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          样本编码
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          数量变化
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          操作人
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.transactions.map((t: any) => (
                        <tr key={t.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(t.createdAt).toLocaleString('zh-CN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {t.sample.sampleCode}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              Number(t.quantityDelta) > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {Number(t.quantityDelta) > 0 ? '+' : ''}
                            {Number(t.quantityDelta)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {t.operator?.name || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

