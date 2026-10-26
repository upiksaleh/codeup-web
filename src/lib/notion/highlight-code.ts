import Prism from 'prismjs'
import 'prismjs/components/prism-bash.js'
import 'prismjs/components/prism-docker.js'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-markdown.js'
import 'prismjs/components/prism-typescript.js'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-tsx.js'
import 'prismjs/components/prism-yaml.js'

const languageAliases: Record<string, string> = {
  shell: 'bash',
  'shell script': 'bash',
  'plain text': 'plain',
  dockerfile: 'docker',
}

export function highlightCode(code: string, notionLanguage: string) {
  const name = notionLanguage.trim().toLowerCase()
  const alias = Object.hasOwn(languageAliases, name) ? languageAliases[name] : name
  const language =
    Object.hasOwn(Prism.languages, alias) && typeof Prism.languages[alias] === 'object'
      ? alias
      : 'plain'
  const grammar = Prism.languages[language]

  return { language, html: Prism.highlight(code, grammar, language) }
}
