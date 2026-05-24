import * as XLSX from 'xlsx'
import { fetchEntriesForExport } from './api'

function previewMeaning(meaning) {
  return meaning?.split('\n')[0]?.split('；')[0]?.split(';')[0] || ''
}

function buildFilename() {
  const date = new Date().toISOString().slice(0, 10)
  return `我的单词_${date}.xlsx`
}

export async function exportAllWords(userId) {
  const entries = await fetchEntriesForExport(userId)
  if (!entries.length) {
    throw new Error('暂无单词可导出')
  }

  const rows = [
    ['单词本', '单词', '中文释义'],
    ...entries.map((entry) => [
      entry.bookName,
      entry.word,
      previewMeaning(entry.meaning),
    ]),
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  worksheet['!cols'] = [{ wch: 20 }, { wch: 24 }, { wch: 40 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '单词')
  XLSX.writeFile(workbook, buildFilename())
}
