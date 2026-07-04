(function () {
  'use strict';

  var CSS_ID = 'book-reader-styles'
  var SETTINGS_KEY = 'book-reader-settings'
  var DATA_KEY = 'reader-data-' + (window.location.pathname.split('/').filter(Boolean)[0] || 'home')

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

  var COLORS = ['yellow', 'green', 'blue', 'pink', 'orange', 'purple']
  var HIGHLIGHT_CLASSES = {
    yellow: 'hl-yellow',
    green: 'hl-green',
    blue: 'hl-blue',
    pink: 'hl-pink',
    orange: 'hl-orange',
    purple: 'hl-purple'
  }

  /* ============================================================
     STATE
     ============================================================ */
  var currentRange = null
  var currentText = ''
  var sidebarOpen = false

  /* ============================================================
     DATA PERSISTENCE
     ============================================================ */
  function loadData() {
    try {
      return JSON.parse(localStorage.getItem(DATA_KEY)) || { highlights: [] }
    } catch (e) {
      return { highlights: [] }
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data))
    } catch (e) {}
  }

  function genId() {
    return 'hl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
  }

  /* ============================================================
     PARAGRAPH ID ASSIGNMENT
     ============================================================ */
  function assignParagraphIds() {
    var selectors = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, figcaption'
    var els = document.querySelectorAll(selectors)
    var count = 0
    for (var i = 0; i < els.length; i++) {
      var el = els[i]
      if (el.closest('#book-reader-controls') || el.closest('.reader-sidebar') || el.closest('.selection-popup')) continue
      if (el.textContent.trim().length > 0) {
        el.dataset.pid = 'p-' + count
        count++
      }
    }
  }

  function findPidEl(node) {
    var el = node.nodeType === 3 ? node.parentElement : node
    while (el && !el.dataset.pid) { el = el.parentElement }
    return el
  }

  /* ============================================================
     RANGE UTILITIES
     ============================================================ */
  function wrapRange(range, wrapper) {
    var fragment = range.extractContents()
    wrapper.appendChild(fragment)
    range.insertNode(wrapper)
    return wrapper
  }

  function findTextInElement(root, text) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false)
    var nodes = []
    while (walker.nextNode()) nodes.push(walker.currentNode)

    var fullText = nodes.map(function (n) { return n.textContent }).join('')
    var idx = fullText.indexOf(text)
    if (idx === -1) return null

    var endIdx = idx + text.length
    var charCount = 0
    var startNode, startOff, endNode, endOff

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i]
      var len = node.textContent.length
      var nodeStart = charCount
      var nodeEnd = charCount + len

      if (!startNode && idx >= nodeStart && idx <= nodeEnd) {
        if (idx > nodeStart && idx < nodeEnd) {
          var right = node.splitText(idx - nodeStart)
          nodes.splice(i + 1, 0, right)
          startNode = right
          startOff = 0
          continue
        }
        startNode = node
        startOff = idx - nodeStart
      }

      if (!endNode && endIdx >= nodeStart && endIdx <= nodeEnd) {
        if (endIdx > nodeStart && endIdx < nodeEnd) {
          var right2 = node.splitText(endIdx - nodeStart)
          nodes.splice(i + 1, 0, right2)
          endNode = node
          endOff = node.textContent.length
          continue
        }
        endNode = node
        endOff = endIdx - nodeStart
      }

      charCount += len
      if (startNode && endNode) break
    }

    if (!startNode || !endNode) return null

    var range = document.createRange()
    range.setStart(startNode, startOff)
    range.setEnd(endNode, endOff)
    return range
  }

  /* ============================================================
     HIGHLIGHT MANAGER
     ============================================================ */
  function createHighlight(pid, text, color, note) {
    return {
      id: genId(),
      pid: pid,
      text: text,
      color: color,
      note: note || '',
      createdAt: Date.now()
    }
  }

  function saveHighlight(hl) {
    var data = loadData()
    data.highlights.push(hl)
    saveData(data)
  }

  function removeHighlight(id) {
    var data = loadData()
    data.highlights = data.highlights.filter(function (h) { return h.id !== id })
    saveData(data)
  }

  function updateHighlight(id, updates) {
    var data = loadData()
    for (var i = 0; i < data.highlights.length; i++) {
      if (data.highlights[i].id === id) {
        for (var k in updates) {
          if (updates.hasOwnProperty(k)) data.highlights[i][k] = updates[k]
        }
        break
      }
    }
    saveData(data)
  }

  function applyHighlightDom(hl) {
    var el = document.querySelector('[data-pid="' + hl.pid + '"]')
    if (!el) return false

    var range = findTextInElement(el, hl.text)
    if (!range) return false

    var span = document.createElement('span')
    span.className = hl.note ? 'hl-has-note' : (HIGHLIGHT_CLASSES[hl.color] || 'hl-yellow')
    span.dataset.hlId = hl.id

    wrapRange(range, span)

    if (hl.note) {
      addAnnotationRef(span, hl)
    }

    return true
  }

  function removeHighlightDom(id) {
    var span = document.querySelector('[data-hl-id="' + id + '"]')
    if (!span) return

    var parent = span.parentNode
    while (span.firstChild) {
      parent.insertBefore(span.firstChild, span)
    }
    parent.removeChild(span)

    var sup = document.querySelector('.annotation-ref[data-hl-id="' + id + '"]')
    if (sup) sup.parentNode.removeChild(sup)

    renumberAnnotations()
  }

  function removeHighlightById(id) {
    removeHighlight(id)
    removeHighlightDom(id)
    renderSidebar()
  }

  function removeAnnotation(hlId) {
    updateHighlight(hlId, { note: '' })

    var sup = document.querySelector('.annotation-ref[data-hl-id="' + hlId + '"]')
    if (sup) sup.parentNode.removeChild(sup)

    var span = document.querySelector('[data-hl-id="' + hlId + '"]')
    if (span) {
      var data = loadData()
      var hl = null
      for (var i = 0; i < data.highlights.length; i++) {
        if (data.highlights[i].id === hlId) { hl = data.highlights[i]; break }
      }
      if (hl) {
        span.className = HIGHLIGHT_CLASSES[hl.color] || 'hl-yellow'
      }
    }

    renumberAnnotations()
    renderSidebar()
  }

  function reapplyHighlights() {
    var data = loadData()
    data.highlights.sort(function (a, b) { return a.createdAt - b.createdAt })
    for (var i = 0; i < data.highlights.length; i++) {
      applyHighlightDom(data.highlights[i])
    }
  }

  /* ============================================================
     ANNOTATIONS
     ============================================================ */
  function addAnnotationRef(span, hl) {
    var sup = document.createElement('sup')
    sup.className = 'annotation-ref'
    sup.dataset.hlId = hl.id
    sup.dataset.note = hl.note

    if (span.nextSibling) {
      span.parentNode.insertBefore(sup, span.nextSibling)
    } else {
      span.parentNode.appendChild(sup)
    }

    renumberAnnotations()
  }

  function renumberAnnotations() {
    var data = loadData()
    var withNotes = data.highlights.filter(function (h) { return h.note })
    withNotes.sort(function (a, b) { return a.createdAt - b.createdAt })

    var sups = document.querySelectorAll('.annotation-ref')
    for (var i = 0; i < sups.length; i++) {
      var num = 1
      for (var j = 0; j < withNotes.length; j++) {
        if (withNotes[j].id === sups[i].dataset.hlId) {
          num = j + 1
          break
        }
      }
      sups[i].textContent = num === 1 ? '¹' : num === 2 ? '²' : num === 3 ? '³' : num
    }
  }

  function saveAnnotation(hlId, note) {
    updateHighlight(hlId, { note: note })

    var span = document.querySelector('[data-hl-id="' + hlId + '"]')
    if (span) {
      var data = loadData()
      var hl = null
      for (var i = 0; i < data.highlights.length; i++) {
        if (data.highlights[i].id === hlId) { hl = data.highlights[i]; break }
      }
      if (hl) addAnnotationRef(span, hl)
    }

    renderSidebar()
  }

  /* ============================================================
     SELECTION POPUP
     ============================================================ */
  var popupEl = null
  var popupVisible = false

  function createPopup() {
    if (popupEl) return
    popupEl = document.createElement('div')
    popupEl.className = 'selection-popup'

    for (var i = 0; i < COLORS.length; i++) {
      var c = COLORS[i]
      var btn = document.createElement('button')
      btn.className = 'sp-color-btn sp-' + c
      btn.title = 'Subrayar en ' + c
      btn.dataset.color = c
      btn.addEventListener('click', function (e) {
        var color = e.currentTarget.dataset.color
        onColorSelect(color)
      })
      popupEl.appendChild(btn)
    }

    var div = document.createElement('span')
    div.className = 'sp-divider'
    popupEl.appendChild(div)

    var annotateBtn = document.createElement('button')
    annotateBtn.className = 'sp-annotate-btn'
    annotateBtn.textContent = 'Anotar'
    annotateBtn.title = 'Subrayar y añadir una nota'
    annotateBtn.addEventListener('click', function () {
      showNoteForm()
    })
    popupEl.appendChild(annotateBtn)

    document.body.appendChild(popupEl)
  }

  function showPopup(range, text) {
    if (!popupEl) createPopup()

    currentRange = range
    currentText = text

    var rect = range.getBoundingClientRect()
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      var sel = window.getSelection()
      if (sel.rangeCount > 0) rect = sel.getRangeAt(0).getBoundingClientRect()
    }

    popupEl.classList.remove('note-mode')
    var noteForm = popupEl.querySelector('.sp-note-form')
    if (noteForm) popupEl.removeChild(noteForm)

    var cx = rect.left + rect.width / 2
    var cy = rect.top

    popupEl.style.left = '0px'
    popupEl.style.top = '0px'
    popupEl.classList.add('visible')
    popupVisible = true

    var pw = popupEl.offsetWidth
    var ph = popupEl.offsetHeight

    var left = Math.max(8, Math.min(cx - pw / 2, window.innerWidth - pw - 8))
    var top = cy - ph - 10

    if (top < 4) {
      top = rect.bottom + 10
    }

    popupEl.style.left = left + 'px'
    popupEl.style.top = top + 'px'
  }

  function hidePopup() {
    if (popupEl) {
      popupEl.classList.remove('visible')
      popupVisible = false
      popupEl.classList.remove('note-mode')
      var noteForm = popupEl.querySelector('.sp-note-form')
      if (noteForm) popupEl.removeChild(noteForm)
    }
    currentRange = null
    currentText = ''
  }

  function showNoteForm() {
    if (!popupEl) return

    var annotateBtn = popupEl.querySelector('.sp-annotate-btn')
    if (annotateBtn) annotateBtn.style.display = 'none'

    popupEl.classList.add('note-mode')

    var form = document.createElement('div')
    form.className = 'sp-note-form'

    var input = document.createElement('input')
    input.className = 'sp-note-input'
    input.type = 'text'
    input.placeholder = 'Escribe tu nota...'

    var saveBtn = document.createElement('button')
    saveBtn.className = 'sp-note-save'
    saveBtn.textContent = 'Guardar'

    var cancelBtn = document.createElement('button')
    cancelBtn.className = 'sp-note-cancel'
    cancelBtn.textContent = 'Cancelar'

    form.appendChild(input)
    form.appendChild(saveBtn)
    form.appendChild(cancelBtn)
    popupEl.appendChild(form)

    saveBtn.addEventListener('click', function () {
      var note = input.value.trim()
      if (note) {
        onColorSelect(null, note)
      } else {
        onColorSelect(null)
      }
    })

    cancelBtn.addEventListener('click', function () {
      hidePopup()
    })

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') saveBtn.click()
      if (e.key === 'Escape') hidePopup()
    })

    setTimeout(function () { input.focus() }, 50)
  }

  function onColorSelect(color, note) {
    if (!currentRange) return

    var range = currentRange
    var text = currentText

    if (!color) {
      color = 'yellow'
    }

    var pidEl = findPidEl(range.startContainer)
    if (!pidEl) {
      hidePopup()
      return
    }

    var pid = pidEl.dataset.pid

    var hl = createHighlight(pid, text, color, note || '')

    var span = document.createElement('span')
    span.className = note ? 'hl-has-note' : (HIGHLIGHT_CLASSES[color])
    span.dataset.hlId = hl.id

    wrapRange(range, span)

    saveHighlight(hl)

    if (hl.note) {
      addAnnotationRef(span, hl)
    }

    hidePopup()
    renderSidebar()
  }

  /* ============================================================
     SIDEBAR
     ============================================================ */
  var sidebarEl = null
  var overlayEl = null
  var toggleBtn = null

  function createSidebar() {
    if (sidebarEl) return

    toggleBtn = document.createElement('button')
    toggleBtn.className = 'sidebar-toggle'
    toggleBtn.innerHTML = '&#9776;'
    toggleBtn.title = 'Mis notas'
    toggleBtn.addEventListener('click', toggleSidebar)
    document.body.appendChild(toggleBtn)

    overlayEl = document.createElement('div')
    overlayEl.className = 'sidebar-overlay'
    overlayEl.addEventListener('click', closeSidebar)
    document.body.appendChild(overlayEl)

    sidebarEl = document.createElement('aside')
    sidebarEl.className = 'reader-sidebar'

    var header = document.createElement('div')
    header.className = 'sidebar-header'
    var title = document.createElement('h3')
    title.textContent = 'Notas'
    var closeBtn = document.createElement('button')
    closeBtn.className = 'sidebar-close'
    closeBtn.innerHTML = '&#10005;'
    closeBtn.title = 'Cerrar'
    closeBtn.addEventListener('click', closeSidebar)
    header.appendChild(title)
    header.appendChild(closeBtn)
    sidebarEl.appendChild(header)

    var body = document.createElement('div')
    body.className = 'sidebar-body'
    body.id = 'sidebar-body'
    sidebarEl.appendChild(body)

    var footer = document.createElement('div')
    footer.className = 'sidebar-footer'
    var exportBtn = document.createElement('button')
    exportBtn.className = 'sidebar-export-btn'
    exportBtn.innerHTML = '&#8595; Exportar a .md'
    exportBtn.addEventListener('click', exportMarkdown)
    footer.appendChild(exportBtn)
    sidebarEl.appendChild(footer)

    document.body.appendChild(sidebarEl)
  }

  function toggleSidebar() {
    if (sidebarOpen) closeSidebar()
    else openSidebar()
  }

  function openSidebar() {
    sidebarOpen = true
    sidebarEl.classList.add('open')
    overlayEl.classList.add('visible')
    renderSidebar()
  }

  function closeSidebar() {
    sidebarOpen = false
    sidebarEl.classList.remove('open')
    overlayEl.classList.remove('visible')
  }

  function renderSidebar() {
    if (!sidebarEl) return

    var data = loadData()
    var body = document.getElementById('sidebar-body')
    if (!body) return

    body.innerHTML = ''

    var withNotes = data.highlights.filter(function (h) { return h.note })
    withNotes.sort(function (a, b) { return a.createdAt - b.createdAt })
    var plainHls = data.highlights.filter(function (h) { return !h.note })
    plainHls.sort(function (a, b) { return a.createdAt - b.createdAt })

    if (data.highlights.length === 0) {
      var empty = document.createElement('div')
      empty.className = 'sidebar-empty'
      empty.textContent = 'Selecciona texto para subrayar'
      body.appendChild(empty)
      return
    }

    /* Annotations section */
    if (withNotes.length > 0) {
      var annSection = document.createElement('div')
      annSection.className = 'sidebar-section'
      var annTitle = document.createElement('div')
      annTitle.className = 'sidebar-section-title'
      annTitle.textContent = 'Anotaciones (' + withNotes.length + ')'
      annSection.appendChild(annTitle)

      for (var i = 0; i < withNotes.length; i++) {
        var hl = withNotes[i]
        var item = document.createElement('div')
        item.className = 'sidebar-item'
        item.style.borderLeftColor = getColorHex(hl.color)

        var delBtn = document.createElement('button')
        delBtn.className = 'sidebar-delete-btn'
        delBtn.innerHTML = '&#10005;'
        delBtn.title = 'Eliminar nota'
        delBtn.addEventListener('click', function (e, id) {
          return function (ev) { ev.stopPropagation(); removeAnnotation(id) }
        }(hl.id))
        item.appendChild(delBtn)

        var clickArea = document.createElement('div')
        clickArea.style.cssText = 'flex:1;cursor:pointer'
        clickArea.addEventListener('click', function (id) {
          return function () { scrollToHighlight(id) }
        }(hl.id))
        item.appendChild(clickArea)

        var ref = document.createElement('span')
        ref.className = 'sidebar-ref-badge'
        ref.textContent = (i + 1) + '.'
        clickArea.appendChild(ref)

        var textEl = document.createElement('div')
        textEl.className = 'sidebar-highlight-text'
        textEl.textContent = hl.text
        clickArea.appendChild(textEl)

        var noteEl = document.createElement('div')
        noteEl.className = 'sidebar-note-preview'
        noteEl.textContent = hl.note
        clickArea.appendChild(noteEl)

        annSection.appendChild(item)
      }
      body.appendChild(annSection)
    }

    /* Highlights section */
    if (plainHls.length > 0) {
      var hlSection = document.createElement('div')
      hlSection.className = 'sidebar-section'
      var hlTitle = document.createElement('div')
      hlTitle.className = 'sidebar-section-title'
      hlTitle.textContent = 'Subrayados (' + plainHls.length + ')'
      hlSection.appendChild(hlTitle)

      for (var j = 0; j < plainHls.length; j++) {
        var hl2 = plainHls[j]
        var item2 = document.createElement('div')
        item2.className = 'sidebar-item'
        item2.style.borderLeftColor = getColorHex(hl2.color)

        var delBtn2 = document.createElement('button')
        delBtn2.className = 'sidebar-delete-btn'
        delBtn2.innerHTML = '&#10005;'
        delBtn2.title = 'Eliminar subrayado'
        delBtn2.addEventListener('click', function (e, id) {
          return function (ev) { ev.stopPropagation(); removeHighlightById(id) }
        }(hl2.id))
        item2.appendChild(delBtn2)

        var clickArea2 = document.createElement('div')
        clickArea2.style.cssText = 'flex:1;cursor:pointer'
        clickArea2.addEventListener('click', function (id) {
          return function () { scrollToHighlight(id) }
        }(hl2.id))
        item2.appendChild(clickArea2)

        var textEl2 = document.createElement('div')
        textEl2.className = 'sidebar-highlight-text'
        textEl2.textContent = hl2.text
        clickArea2.appendChild(textEl2)

        hlSection.appendChild(item2)
      }
      body.appendChild(hlSection)
    }

    /* Group by color for visual grouping */
    var colorGroups = {}
    for (var k = 0; k < data.highlights.length; k++) {
      var h = data.highlights[k]
      if (!colorGroups[h.color]) colorGroups[h.color] = []
      colorGroups[h.color].push(h)
    }

    var colorOrder = ['yellow', 'green', 'blue', 'pink', 'orange', 'purple']
    for (var ci = 0; ci < colorOrder.length; ci++) {
      var grp = colorGroups[colorOrder[ci]]
      if (!grp || grp.length === 0) continue
    }
  }

  function scrollToHighlight(id) {
    var el = document.querySelector('[data-hl-id="' + id + '"]')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.style.transition = 'outline 0.3s ease'
      el.style.outline = '2px solid rgba(255,255,255,0.4)'
      el.style.outlineOffset = '2px'
      setTimeout(function () {
        el.style.outline = 'none'
      }, 2000)
    }
    closeSidebar()
  }

  function getColorHex(color) {
    var map = {
      yellow: '#ffd500',
      green: '#4caf50',
      blue: '#2196f3',
      pink: '#e91e63',
      orange: '#ff9800',
      purple: '#9c27b0'
    }
    return map[color] || '#ffd500'
  }

  /* ============================================================
     EXPORT TO MARKDOWN
     ============================================================ */
  function exportMarkdown() {
    var data = loadData()
    if (data.highlights.length === 0) return

    var bookTitle = ''
    var h1 = document.querySelector('h1')
    if (h1) bookTitle = h1.textContent.trim()

    var lines = []
    if (bookTitle) lines.push('# ' + bookTitle)
    else lines.push('# Notas de lectura')
    lines.push('')

    var withNotes = data.highlights.filter(function (h) { return h.note })
    withNotes.sort(function (a, b) { return a.createdAt - b.createdAt })
    var plainHls = data.highlights.filter(function (h) { return !h.note })

    if (withNotes.length > 0) {
      lines.push('## Anotaciones')
      lines.push('')
      for (var i = 0; i < withNotes.length; i++) {
        var h = withNotes[i]
        lines.push((i + 1) + '. **' + h.text + '**')
        lines.push('   > *' + h.note + '*')
        lines.push('')
      }
    }

    if (plainHls.length > 0) {
      lines.push('## Subrayados')
      lines.push('')
      for (var j = 0; j < plainHls.length; j++) {
        var h2 = plainHls[j]
        lines.push('- ' + h2.text)
        lines.push('')
      }
    }

    var md = lines.join('\n')
    var blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a')
    a.href = url
    a.download = (bookTitle ? bookTitle.replace(/[^a-zA-Z0-9\u00C0-\u024f\s]/g, '').trim() : 'notas') + '.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /* ============================================================
     EVENT LISTENERS
     ============================================================ */
  function onMouseUp(e) {
    if (e.target.closest('.selection-popup') ||
        e.target.closest('.reader-sidebar') ||
        e.target.closest('.sidebar-overlay') ||
        e.target.closest('.sidebar-toggle')) return

    setTimeout(function () {
      var sel = window.getSelection()
      var text = sel.toString().trim()
      if (!text || text.length > 500) {
        hidePopup()
        return
      }

      if (sel.rangeCount === 0) {
        hidePopup()
        return
      }

      var range = sel.getRangeAt(0)
      var startPid = findPidEl(range.startContainer)
      var endPid = findPidEl(range.endContainer)

      if (!startPid || startPid !== endPid) {
        hidePopup()
        return
      }

      showPopup(range, text)
    }, 10)
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      if (popupVisible) hidePopup()
      if (sidebarOpen) closeSidebar()
    }
  }

  function onClickOutside(e) {
    if (popupVisible && popupEl && !popupEl.contains(e.target)) {
      var sel = window.getSelection()
      if (!sel.toString().trim()) {
        hidePopup()
      }
    }
  }

  /* ============================================================
     EXISTING FUNCTIONALITY (theme, font size, controls)
     ============================================================ */
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
    ps.zIndex = '9996'
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
      return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { theme: 'sepia', fontSize: 18 }
    } catch (e) {
      return { theme: 'sepia', fontSize: 18 }
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
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

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    injectCSS()
    applySettings()
    createControls()
    assignParagraphIds()
    reapplyHighlights()
    createSidebar()

    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onClickOutside)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
