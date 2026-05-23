const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

const LOOKUP_PROMPT = (word) => `You are an expert English-Chinese dictionary assistant. For the English word "${word}", return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "meaning": "中文释义，列出所有主要义项，用分号分隔",
  "insight": "专业洞察（包含词根词源、近义词辨析、语境等），150-300字",
  "examples": [
    { "en": "英文例句1", "zh": "中文翻译1" },
    { "en": "英文例句2", "zh": "中文翻译2" }
  ]
}`

/**
 * @param {string} apiKey
 * @param {string} word
 * @returns {Promise<{ meaning: string, insight: string, examples: Array<{en: string, zh: string}> }>}
 */
export async function lookupWord(apiKey, word) {
  if (!apiKey?.trim()) {
    throw new Error('请先在设置页配置 DeepSeek API Key')
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: LOOKUP_PROMPT(word.trim()) }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `DeepSeek API 错误: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('API 返回内容为空')

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('无法解析 API 返回的 JSON')
    parsed = JSON.parse(match[0])
  }

  if (!parsed.meaning) throw new Error('返回数据格式不正确')
  return {
    meaning: parsed.meaning,
    insight: parsed.insight || '',
    examples: Array.isArray(parsed.examples) ? parsed.examples : [],
  }
}

export function getYoudaoTtsUrl(word) {
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`
}
