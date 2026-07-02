(function () {
  'use strict';

  var CSS_ID = 'book-reader-styles'
  var STORAGE_KEY = 'book-reader-settings'

  var CSS_CONTENT = [
    ':root {',
    '  --bg: #f4ecd8;',
    '  --text: #3b3a36;',
    '  --text-muted: #6b6a66;',
    '  --link: #8b4513;',
    '  --link-hover: #a0522d;',
    '  --border: #d4c9a8;',
    '  --heading: #2c2b27;',
    '  --accent: #c4a97d;',
    '}',
    '',
    '.theme-white {',
    '  --bg: #ffffff;',
    '  --text: #333333;',
    '  --text-muted: #666666;',
    '  --link: #1a6dd4;',
    '  --link-hover: #1558b0;',
    '  --border: #dddddd;',
    '  --heading: #222222;',
    '  --accent: #999999;',
    '}',
    '',
    '.theme-dark {',
    '  --bg: #1a1a1a;',
    '  --text: #d1d1d1;',
    '  --text-muted: #999999;',
    '  --link: #6ba3e0;',
    '  --link-hover: #8bb9f0;',
    '  --border: #333333;',
    '  --heading: #e8e8e8;',
    '  --accent: #555555;',
    '}',
    '',
    '* {',
    '  margin: 0;',
    '  padding: 0;',
    '  box-sizing: border-box;',
    '}',
    '',
    'body {',
    '  font-family: Georgia, "Times New Roman", Times, serif;',
    '  font-size: 18px;',
    '  line-height: 1.8;',
    '  color: var(--text);',
    '  background-color: var(--bg);',
    '  max-width: 720px;',
    '  margin: 0 auto;',
    '  padding: 40px 30px 80px;',
    '  transition: background-color 0.3s ease, color 0.3s ease;',
    '}',
    '',
    'h1, h2, h3 {',
    '  color: var(--heading);',
    '  font-weight: 600;',
    '  line-height: 1.3;',
    '  margin-top: 2em;',
    '  margin-bottom: 0.75em;',
    '}',
    '',
    'h1 {',
    '  font-size: 2em;',
    '  text-align: center;',
    '  margin-top: 1.5em;',
    '  font-weight: 700;',
    '  letter-spacing: -0.01em;',
    '}',
    '',
    'h2 {',
    '  font-size: 1.5em;',
    '  border-bottom: 1px solid var(--border);',
    '  padding-bottom: 0.3em;',
    '}',
    '',
    'h3 {',
    '  font-size: 1.2em;',
    '  font-weight: 600;',
    '}',
    '',
    'p {',
    '  margin-bottom: 0.5em;',
    '  text-align: justify;',
    '  text-indent: 1.5em;',
    '  orphans: 3;',
    '  widows: 3;',
    '}',
    '',
    'h1 + p, h2 + p, h3 + p {',
    '  text-indent: 0;',
    '}',
    '',
    'img {',
    '  max-width: 100%;',
    '  height: auto;',
    '  display: block;',
    '  margin: 1.5em auto;',
    '  border-radius: 2px;',
    '}',
    '',
    'div.img-description,',
    'div.img-alt,',
    '.img-description,',
    '.img-alt {',
    '  display: none !important;',
    '}',
    '',
    'a {',
    '  color: var(--link);',
    '  text-decoration: none;',
    '  border-bottom: 1px solid transparent;',
    '  transition: border-color 0.2s;',
    '}',
    '',
    'a:hover {',
    '  border-bottom-color: var(--link);',
    '  color: var(--link-hover);',
    '}',
    '',
    'ul, ol {',
    '  margin: 1em 0 1em 2em;',
    '}',
    '',
    'li {',
    '  margin-bottom: 0.3em;',
    '}',
    '',
    'table {',
    '  width: 100%;',
    '  border-collapse: collapse;',
    '  margin: 1.5em 0;',
    '  font-size: 0.95em;',
    '}',
    '',
    'th, td {',
    '  padding: 0.5em 0.8em;',
    '  text-align: left;',
    '  border-bottom: 1px solid var(--border);',
    '}',
    '',
    'tr:last-child td {',
    '  border-bottom: none;',
    '}',
    '',
    'b, strong {',
    '  font-weight: 600;',
    '  color: var(--heading);',
    '}',
    '',
    'i, em {',
    '  font-style: italic;',
    '}',
    '',
    'pre {',
    '  font-family: Consolas, Monaco, "Courier New", monospace;',
    '  font-size: 0.85em;',
    '  background: rgba(0,0,0,0.05);',
    '  padding: 1em;',
    '  border-radius: 4px;',
    '  overflow-x: auto;',
    '  margin: 1em 0;',
    '  line-height: 1.5;',
    '}',
    '',
    'sup {',
    '  font-size: 0.75em;',
    '  vertical-align: super;',
    '  line-height: 0;',
    '}',
    '',
    '@media print {',
    '  body {',
    '    font-size: 12pt;',
    '    max-width: none;',
    '    padding: 0;',
    '    color: #000;',
    '    background: #fff;',
    '  }',
    '  #book-reader-controls {',
    '    display: none !important;',
    '  }',
    '}'
  ].join('\n')

  function injectCSS() {
    if (document.getElementById(CSS_ID)) return
    var style = document.createElement('style')
    style.id = CSS_ID
    style.textContent = CSS_CONTENT
    document.head.appendChild(style)
  }

  function createControls() {
    var settings = loadSettings()
    var panel = document.createElement('div')
    panel.id = 'book-reader-controls'

    var ps = panel.style
    ps.position = 'fixed'
    ps.top = '12px'
    ps.right = '12px'
    ps.zIndex = '9999'
    ps.display = 'flex'
    ps.gap = '6px'
    ps.alignItems = 'center'
    ps.padding = '8px 12px'
    ps.borderRadius = '8px'
    ps.background = 'rgba(0,0,0,0.75)'
    ps.backdropFilter = 'blur(8px)'
    ps.WebkitBackdropFilter = 'blur(8px)'
    ps.color = '#fff'
    ps.fontFamily = '-apple-system, BlinkMacSystemFont, sans-serif'
    ps.fontSize = '13px'
    ps.opacity = '0.25'
    ps.transition = 'opacity 0.3s ease'
    ps.userSelect = 'none'

    panel.addEventListener('mouseenter', function () { ps.opacity = '1' })
    panel.addEventListener('mouseleave', function () { ps.opacity = '0.25' })

    var themes = [
      { id: 'sepia', label: 'S', title: 'Sepia' },
      { id: 'white', label: 'W', title: 'Blanco' },
      { id: 'dark', label: 'D', title: 'Oscuro' }
    ]

    themes.forEach(function (t) {
      var btn = document.createElement('button')
      btn.textContent = t.label
      btn.title = t.title
      btn.dataset.theme = t.id

      var bs = btn.style
      bs.width = '28px'
      bs.height = '28px'
      bs.border = '1px solid rgba(255,255,255,0.3)'
      bs.borderRadius = '50%'
      bs.cursor = 'pointer'
      bs.fontSize = '11px'
      bs.fontWeight = '600'
      bs.display = 'flex'
      bs.alignItems = 'center'
      bs.justifyContent = 'center'
      bs.transition = 'all 0.2s'
      bs.padding = '0'
      bs.lineHeight = '1'
      bs.background = 'none'
      bs.color = '#fff'

      if (t.id === 'sepia') {
        bs.background = '#f4ecd8'
        bs.color = '#3b3a36'
      } else if (t.id === 'white') {
        bs.background = '#ffffff'
        bs.color = '#333'
      } else if (t.id === 'dark') {
        bs.background = '#1a1a1a'
        bs.color = '#d1d1d1'
      }

      if (settings.theme === t.id) {
        bs.borderColor = '#fff'
        bs.transform = 'scale(1.15)'
      }

      btn.addEventListener('click', function () { setTheme(t.id) })
      panel.appendChild(btn)
    })

    var sep = document.createElement('span')
    sep.textContent = '|'
    sep.style.opacity = '0.3'
    sep.style.margin = '0 2px'
    panel.appendChild(sep)

    ;[
      { label: 'A\u2212', title: 'Reducir fuente', delta: -1 },
      { label: 'A+', title: 'Aumentar fuente', delta: 1 }
    ].forEach(function (s) {
      var btn = document.createElement('button')
      btn.textContent = s.label
      btn.title = s.title
      var bs = btn.style
      bs.border = 'none'
      bs.background = 'none'
      bs.color = '#fff'
      bs.cursor = 'pointer'
      bs.fontSize = '14px'
      bs.fontWeight = '600'
      bs.padding = '2px 4px'
      bs.opacity = '0.8'
      bs.transition = 'opacity 0.2s'
      bs.lineHeight = '1'
      btn.addEventListener('mouseenter', function () { bs.opacity = '1' })
      btn.addEventListener('mouseleave', function () { bs.opacity = '0.8' })
      btn.addEventListener('click', function () { adjustFontSize(s.delta) })
      panel.appendChild(btn)
    })

    document.body.appendChild(panel)
  }

  function setTheme(theme) {
    var body = document.body
    body.classList.remove('theme-white', 'theme-dark')
    if (theme === 'white') body.classList.add('theme-white')
    else if (theme === 'dark') body.classList.add('theme-dark')

    var settings = loadSettings()
    settings.theme = theme
    saveSettings(settings)

    var buttons = document.querySelectorAll('#book-reader-controls button[data-theme]')
    buttons.forEach(function (btn) {
      btn.style.transform = btn.dataset.theme === theme ? 'scale(1.15)' : 'scale(1)'
      btn.style.borderColor = btn.dataset.theme === theme ? '#fff' : 'rgba(255,255,255,0.3)'
    })
  }

  function adjustFontSize(delta) {
    var body = document.body
    var current = parseFloat(getComputedStyle(body).fontSize)
    var newSize = Math.min(Math.max(current + delta, 12), 28)
    body.style.fontSize = newSize + 'px'

    var settings = loadSettings()
    settings.fontSize = newSize
    saveSettings(settings)
  }

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { theme: 'sepia', fontSize: 18 }
    } catch (e) {
      return { theme: 'sepia', fontSize: 18 }
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (e) {}
  }

  function applySettings() {
    var settings = loadSettings()
    if (settings.theme && settings.theme !== 'sepia') {
      document.body.classList.add('theme-' + settings.theme)
    }
    if (settings.fontSize && settings.fontSize !== 18) {
      document.body.style.fontSize = settings.fontSize + 'px'
    }
  }

  function init() {
    injectCSS()
    applySettings()
    createControls()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
