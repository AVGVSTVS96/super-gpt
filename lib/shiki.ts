import { getHighlighter } from 'shiki'

// Preload only the languages you need
const languages = ['typescript', 'javascript', 'tsx', 'jsx', 'json', 'bash']

export const shikiHighlighter = getHighlighter({
  themes: ['github-dark'],
  langs: languages,
})

// Export a memoized highlighter function
export async function highlight(code: string, lang: string) {
  const highlighter = await shikiHighlighter
  return highlighter.codeToHtml(code, {
    lang,
    theme: 'github-dark',
  })
} 