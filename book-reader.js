/*!
 * book-reader.js — lector universal para HTML de libros (salida OCR de Datalab)
 *
 * Funciones: temas (sepia/blanco/oscuro), tamaño de fuente, subrayados de 6
 * colores (multi-párrafo, no destructivo), anotaciones con superíndice + tooltip,
 * sidebar con scroll-to/borrar/exportar a .md. Persistencia por libro en
 * localStorage. Cero dependencias, sin build.
 */
(function (root, factory) {
  'use strict'
  var api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict'

  /* ============================================================
     CONFIG & CONSTANTES
     ============================================================ */
  var SETTINGS_KEY = 'book-reader-settings'
  var LEGACY_DATA_KEY = 'reader-data-libros'
  var CONTENT_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, figcaption'
  var UI_SELECTOR = '#book-reader-controls, .reader-sidebar, .sidebar-overlay, .sidebar-toggle, .selection-popup'
  var COLORS = ['yellow', 'green', 'blue', 'pink', 'orange', 'purple']
  var DEFAULT_SETTINGS = { theme: 'sepia', fontSize: 18 }
  var FONT_MIN = 12
  var FONT_MAX = 28

  var hasDOM = (typeof document !== 'undefined')
  var hasStorage = (function () {
    try { return typeof localStorage !== 'undefined' && localStorage != null } catch (e) { return false }
  })()

  /* ============================================================
     UTILIDADES DOM
     ============================================================ */
  function qs(sel, root) { return hasDOM ? (root || document).querySelector(sel) : null }
  function qsa(sel, root) {
    if (!hasDOM) return []
    return Array.prototype.slice.call((root || document).querySelectorAll(sel))
  }
  function byCreatedAt(a, b) { return a.createdAt - b.createdAt }
  function clone(o) { return JSON.parse(JSON.stringify(o)) }
  function escapeAttr(v) {
    return String(v == null ? '' : v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  }
  function pidSelector(pid) { return '[data-pid="' + escapeAttr(pid) + '"]' }
  function hlSelector(id) { return '[data-hl-id="' + escapeAttr(id) + '"]' }
  function genId() {
    return 'hl_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
  }

  /* ============================================================
     DETECCIÓN DE PÁGINA  (slugFromPath es pura)
     ============================================================ */
  function slugFromPath(pathname) {
    var path = pathname || (typeof window !== 'undefined' && window.location ? window.location.pathname : '')
    if (!path) return 'home'
    var segs = path.split('/').filter(function (s) {
      return s && s.toLowerCase() !== 'index.html'
    })
    return segs.length ? segs[segs.length - 1] : 'home'
  }
  function isPortal() { return !!qs('#book-list') }
  function dataKey() { return 'reader-data-' + slugFromPath() }

  /* ============================================================
     ALMACENAMIENTO
     ============================================================ */
  function loadData() {
    if (!hasStorage) return { highlights: [] }
    try {
      var raw = localStorage.getItem(dataKey())
      var data = raw ? JSON.parse(raw) : null
      if (!data || !Array.isArray(data.highlights)) return { highlights: [] }
      return data
    } catch (e) { return { highlights: [] } }
  }
  function saveData(data) {
    if (!hasStorage) return
    try { localStorage.setItem(dataKey(), JSON.stringify(data)) } catch (e) {}
  }
  function loadSettings() {
    if (!hasStorage) return clone(DEFAULT_SETTINGS)
    try {
      var s = JSON.parse(localStorage.getItem(SETTINGS_KEY))
      return {
        theme: (s && s.theme) || DEFAULT_SETTINGS.theme,
        fontSize: (s && typeof s.fontSize === 'number') ? s.fontSize : DEFAULT_SETTINGS.fontSize
      }
    } catch (e) { return clone(DEFAULT_SETTINGS) }
  }
  function saveSettings(s) {
    if (!hasStorage) return
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) } catch (e) {}
  }

  /* Migración one-shot: los highlights legacy se guardaban bajo la clave
     'reader-data-libros' para TODOS los libros (bug del lector antiguo).
     En una página de libro, si la nueva clave está vacía y existe la legacy,
     se copia y se borra la legacy. */
  function migrateLegacy() {
    if (!hasStorage || isPortal()) return
    var data = loadData()
    if (data.highlights.length > 0) return
    var raw
    try { raw = localStorage.getItem(LEGACY_DATA_KEY) } catch (e) { return }
    if (!raw) return
    try {
      var legacy = JSON.parse(raw)
      if (legacy && Array.isArray(legacy.highlights) && legacy.highlights.length) {
        saveData({ highlights: legacy.highlights })
        try { localStorage.removeItem(LEGACY_DATA_KEY) } catch (e) {}
      }
    } catch (e) {}
  }

  /* ============================================================
     TEMA Y TAMAÑO DE FUENTE
     ============================================================ */
  function applyThemeClass(theme) {
    document.body.classList.remove('theme-white', 'theme-dark')
    if (theme === 'white') document.body.classList.add('theme-white')
    else if (theme === 'dark') document.body.classList.add('theme-dark')
  }
  function applySettings() {
    var s = loadSettings()
    applyThemeClass(s.theme)
    if (s.fontSize >= FONT_MIN && s.fontSize <= FONT_MAX) {
      document.body.style.fontSize = s.fontSize + 'px'
    }
  }
  function setTheme(theme) {
    applyThemeClass(theme)
    var s = loadSettings(); s.theme = theme; saveSettings(s)
    qsa('#book-reader-controls .br-theme').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-theme') === theme ? 'true' : 'false')
    })
  }
  function adjustFontSize(delta) {
    var s = loadSettings()
    var next = Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(s.fontSize) + delta))
    s.fontSize = next; saveSettings(s)
    document.body.style.fontSize = next + 'px'
  }

  /* ============================================================
     ADDRESSING DE CONTENIDO (pids estables)
     ============================================================ */
  function assignParagraphIds() {
    var els = qsa(CONTENT_SELECTOR)
    var count = 0
    for (var i = 0; i < els.length; i++) {
      var node = els[i]
      if (node.closest(UI_SELECTOR)) continue
      if (node.textContent.trim().length === 0) continue
      node.setAttribute('data-pid', 'p-' + count)
      count++
    }
  }
  function closestBlock(node) {
    var e = node && node.nodeType === 3 ? node.parentElement : node
    while (e && !e.getAttribute('data-pid')) e = e.parentElement
    return e
  }

  /* ============================================================
     HELPERS DE RANGO / OFFSET EN BLOQUE
     ============================================================ */
  function getTextNodes(root) {
    if (!hasDOM) return []
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false)
    var out = []
    while (walker.nextNode()) {
      var n = walker.currentNode
      if (n.textContent.length > 0) out.push(n)
    }
    return out
  }
  function offsetWithinBlock(block, textNode, localOffset) {
    var nodes = getTextNodes(block)
    var sum = 0
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] === textNode) return sum + Math.min(localOffset, nodes[i].textContent.length)
      sum += nodes[i].textContent.length
    }
    return sum
  }
  function findBlockPoint(block, charOffset) {
    var nodes = getTextNodes(block)
    var sum = 0
    for (var i = 0; i < nodes.length; i++) {
      var len = nodes[i].textContent.length
      if (charOffset <= sum + len) return { node: nodes[i], offset: Math.max(0, charOffset - sum) }
      sum += len
    }
    if (nodes.length) {
      var last = nodes[nodes.length - 1]
      return { node: last, offset: last.textContent.length }
    }
    return null
  }
  function blocksInRange(a, b) {
    var all = qsa('[data-pid]')
    var ia = all.indexOf(a), ib = all.indexOf(b)
    if (ia === -1 || ib === -1) return [a, b].filter(Boolean)
    var lo = Math.min(ia, ib), hi = Math.max(ia, ib)
    return all.slice(lo, hi + 1)
  }

  /* ============================================================
     MOTOR DE SUBRAYADO (no destructivo, multi-párrafo)
     ============================================================ */
  function wrapTextNodePortion(tn, start, end, hlId, color) {
    var node = tn
    if (start > 0) {
      try { node = node.splitText(start) } catch (e) { return null }
    }
    var remaining = node.textContent.length
    if (end - start < remaining) {
      try { node.splitText(end - start) } catch (e) { return null }
    }
    if (!node.textContent.length) return null
    var parent = node.parentElement
    if (!parent) return null
    if (parent.closest('[data-hl-id]')) return null   // ya subrayado: no solapar
    var span = document.createElement('span')
    span.className = 'hl'
    span.setAttribute('data-hl-id', hlId)
    span.setAttribute('data-color', color)
    parent.insertBefore(span, node)
    span.appendChild(node)
    return span
  }

  function wrapRangeWithHighlight(range, hlId, color) {
    var startBlock = closestBlock(range.startContainer)
    var endBlock = closestBlock(range.endContainer)
    if (!startBlock || !endBlock) return []
    var blocks = blocksInRange(startBlock, endBlock)
    var created = []
    for (var b = 0; b < blocks.length; b++) {
      var nodes = getTextNodes(blocks[b])
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        try { if (!range.intersectsNode(n)) continue } catch (e) { continue }
        var startOff = 0
        var endOff = n.textContent.length
        if (n === range.startContainer) startOff = range.startOffset
        if (n === range.endContainer) endOff = range.endOffset
        if (startOff >= endOff) continue
        var span = wrapTextNodePortion(n, startOff, endOff, hlId, color)
        if (span) created.push(span)
      }
    }
    return created
  }

  function buildRangeFromHighlight(hl) {
    var startBlock = qs(pidSelector(hl.startPid))
    var endBlock = qs(pidSelector(hl.endPid))
    if (!startBlock || !endBlock) return null
    var sp = findBlockPoint(startBlock, hl.startOffset)
    var ep = findBlockPoint(endBlock, hl.endOffset)
    if (!sp || !ep) return null
    try {
      var range = document.createRange()
      range.setStart(sp.node, sp.offset)
      range.setEnd(ep.node, ep.offset)
      return range
    } catch (e) { return null }
  }

  function createHighlightObject(range, text, color, note) {
    var startBlock = closestBlock(range.startContainer)
    var endBlock = closestBlock(range.endContainer)
    if (!startBlock || !endBlock) return null
    return {
      id: genId(),
      startPid: startBlock.getAttribute('data-pid'),
      startOffset: offsetWithinBlock(startBlock, range.startContainer, range.startOffset),
      endPid: endBlock.getAttribute('data-pid'),
      endOffset: offsetWithinBlock(endBlock, range.endContainer, range.endOffset),
      text: text,
      color: color,
      note: note || '',
      createdAt: Date.now()
    }
  }

  /* ============================================================
     GESTOR DE HIGHLIGHTS
     ============================================================ */
  function applyHighlightDom(hl) {
    var range = buildRangeFromHighlight(hl)
    if (!range) { hl.orphan = true; return false }
    var spans = wrapRangeWithHighlight(range, hl.id, hl.color)
    if (!spans.length) { hl.orphan = true; return false }
    if (hl.note) addAnnotationRef(hl)
    return true
  }

  function reapplyHighlights() {
    var data = loadData()
    data.highlights.sort(byCreatedAt)
    for (var i = 0; i < data.highlights.length; i++) {
      var hl = data.highlights[i]
      hl.orphan = false
      if (qs(hlSelector(hl.id))) continue          // idempotente
      applyHighlightDom(hl)
    }
  }

  function unwrapHighlight(id) {
    var spans = qsa(hlSelector(id))
    for (var i = 0; i < spans.length; i++) {
      var span = spans[i]
      var parent = span.parentNode
      while (span.firstChild) parent.insertBefore(span.firstChild, span)
      parent.removeChild(span)
      parent.normalize()
    }
    var ref = qs('.annotation-ref' + hlSelector(id))
    if (ref) ref.parentNode.removeChild(ref)
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
          if (Object.prototype.hasOwnProperty.call(updates, k)) data.highlights[i][k] = updates[k]
        }
        break
      }
    }
    saveData(data)
  }
  function removeHighlightById(id) {
    removeHighlight(id)
    unwrapHighlight(id)
    renumberAnnotations()
    renderSidebar()
  }

  /* ============================================================
     ANOTACIONES
     ============================================================ */
  function addAnnotationRef(hl) {
    var spans = qsa(hlSelector(hl.id))
    if (!spans.length) return
    var last = spans[spans.length - 1]
    var existing = qs('.annotation-ref' + hlSelector(hl.id))
    if (existing) existing.parentNode.removeChild(existing)
    var sup = document.createElement('sup')
    sup.className = 'annotation-ref'
    sup.setAttribute('data-hl-id', hl.id)
    sup.setAttribute('data-note', hl.note || '')
    if (last.nextSibling) last.parentNode.insertBefore(sup, last.nextSibling)
    else last.parentNode.appendChild(sup)
    renumberAnnotations()
  }

  function renumberAnnotations() {
    var data = loadData()
    var notes = data.highlights.filter(function (h) { return h.note && !h.orphan }).sort(byCreatedAt)
    var num = {}
    for (var i = 0; i < notes.length; i++) num[notes[i].id] = i + 1
    qsa('.annotation-ref').forEach(function (sup) {
      var n = num[sup.getAttribute('data-hl-id')]
      sup.textContent = n ? String(n) : ''
    })
  }

  function removeAnnotation(hlId) {
    updateHighlight(hlId, { note: '' })
    var ref = qs('.annotation-ref' + hlSelector(hlId))
    if (ref) ref.parentNode.removeChild(ref)
    renumberAnnotations()
    renderSidebar()
  }

  /* ============================================================
     POPUP DE SELECCIÓN
     ============================================================ */
  var popupEl = null, popupVisible = false, currentRange = null, currentText = ''

  function createPopup() {
    if (popupEl) return
    popupEl = document.createElement('div')
    popupEl.className = 'selection-popup'
    popupEl.setAttribute('role', 'toolbar')
    popupEl.setAttribute('aria-label', 'Subrayar selección')
    COLORS.forEach(function (c) {
      var btn = document.createElement('button')
      btn.className = 'sp-color-btn'
      btn.type = 'button'
      btn.setAttribute('data-color', c)
      btn.setAttribute('aria-label', 'Subrayar en ' + c)
      btn.title = 'Subrayar en ' + c
      btn.addEventListener('click', function () { onColorSelect(c) })
      popupEl.appendChild(btn)
    })
    var div = document.createElement('span')
    div.className = 'sp-divider'
    popupEl.appendChild(div)
    var ann = document.createElement('button')
    ann.className = 'sp-annotate-btn'
    ann.type = 'button'
    ann.textContent = 'Anotar'
    ann.title = 'Subrayar y añadir una nota'
    ann.addEventListener('click', showNoteForm)
    popupEl.appendChild(ann)
    document.body.appendChild(popupEl)
  }

  function removeNoteForm() {
    if (!popupEl) return
    var form = popupEl.querySelector('.sp-note-form')
    if (form) popupEl.removeChild(form)
    var ann = popupEl.querySelector('.sp-annotate-btn')
    if (ann) ann.style.display = ''
  }

  function showPopup(range, text) {
    if (!popupEl) createPopup()
    currentRange = range; currentText = text
    var rect = range.getBoundingClientRect()
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      var sel = window.getSelection()
      if (sel.rangeCount > 0) rect = sel.getRangeAt(0).getBoundingClientRect()
    }
    popupEl.classList.remove('note-mode')
    removeNoteForm()
    popupEl.style.left = '0px'; popupEl.style.top = '0px'
    popupEl.classList.add('visible'); popupVisible = true
    var pw = popupEl.offsetWidth, ph = popupEl.offsetHeight
    var cx = rect.left + rect.width / 2
    var left = Math.max(8, Math.min(cx - pw / 2, window.innerWidth - pw - 8))
    var top = rect.top - ph - 10
    if (top < 4) top = rect.bottom + 10
    popupEl.style.left = left + 'px'; popupEl.style.top = top + 'px'
    var firstBtn = popupEl.querySelector('.sp-color-btn')
    if (firstBtn) firstBtn.focus()
  }

  function hidePopup() {
    if (popupEl) {
      popupEl.classList.remove('visible')
      popupEl.classList.remove('note-mode')
      removeNoteForm()
    }
    popupVisible = false; currentRange = null; currentText = ''
  }

  function showNoteForm() {
    if (!popupEl) return
    popupEl.classList.add('note-mode')
    var ann = popupEl.querySelector('.sp-annotate-btn')
    if (ann) ann.style.display = 'none'
    var form = document.createElement('div'); form.className = 'sp-note-form'
    var input = document.createElement('input'); input.className = 'sp-note-input'; input.type = 'text'
    input.placeholder = 'Escribe tu nota...'; input.setAttribute('aria-label', 'Nota')
    var save = document.createElement('button'); save.className = 'sp-note-save'; save.type = 'button'; save.textContent = 'Guardar'
    var cancel = document.createElement('button'); cancel.className = 'sp-note-cancel'; cancel.type = 'button'; cancel.textContent = 'Cancelar'
    form.appendChild(input); form.appendChild(save); form.appendChild(cancel)
    popupEl.appendChild(form)
    save.addEventListener('click', function () { onColorSelect('yellow', input.value.trim() || null) })
    cancel.addEventListener('click', hidePopup)
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); save.click() }
      if (e.key === 'Escape') { e.preventDefault(); hidePopup() }
    })
    setTimeout(function () { input.focus() }, 30)
  }

  function onColorSelect(color, note) {
    if (!currentRange) { hidePopup(); return }
    var range = currentRange, text = currentText
    var c = color || 'yellow'
    var hl = createHighlightObject(range, text, c, note || '')
    if (!hl) { hidePopup(); return }
    var spans = wrapRangeWithHighlight(range, hl.id, c)
    if (!spans.length) { hidePopup(); return }
    saveHighlight(hl)
    if (hl.note) addAnnotationRef(hl)
    hidePopup()
    renderSidebar()
  }

  /* ============================================================
     CONTROLES FLOTANTES (temas + tamaño de fuente)
     ============================================================ */
  function createControls() {
    if (qs('#book-reader-controls')) return
    var settings = loadSettings()
    var panel = document.createElement('div')
    panel.id = 'book-reader-controls'
    panel.setAttribute('role', 'toolbar')
    panel.setAttribute('aria-label', 'Preferencias del lector')
    var themes = [
      { id: 'sepia', label: 'S', title: 'Sepia' },
      { id: 'white', label: 'W', title: 'Blanco' },
      { id: 'dark', label: 'D', title: 'Oscuro' }
    ]
    themes.forEach(function (t) {
      var b = document.createElement('button')
      b.className = 'br-theme'; b.type = 'button'
      b.textContent = t.label; b.title = t.title
      b.setAttribute('data-theme', t.id)
      b.setAttribute('aria-label', 'Tema ' + t.title)
      b.setAttribute('aria-pressed', settings.theme === t.id ? 'true' : 'false')
      b.addEventListener('click', function () { setTheme(t.id) })
      panel.appendChild(b)
    })
    var sep = document.createElement('span')
    sep.className = 'br-sep'
    sep.setAttribute('aria-hidden', 'true')
    panel.appendChild(sep)
    ;[
      { label: 'A\u2212', title: 'Reducir fuente', delta: -1 },
      { label: 'A+', title: 'Aumentar fuente', delta: 1 }
    ].forEach(function (s) {
      var b = document.createElement('button')
      b.className = 'br-font'; b.type = 'button'
      b.textContent = s.label; b.title = s.title
      b.setAttribute('aria-label', s.title)
      b.addEventListener('click', function () { adjustFontSize(s.delta) })
      panel.appendChild(b)
    })
    document.body.appendChild(panel)
  }

  /* ============================================================
     SIDEBAR
     ============================================================ */
  var sidebarEl = null, overlayEl = null, toggleBtn = null
  var sidebarOpen = false, lastFocus = null

  function createSidebar() {
    if (sidebarEl) return
    toggleBtn = document.createElement('button')
    toggleBtn.className = 'sidebar-toggle'; toggleBtn.type = 'button'
    toggleBtn.innerHTML = '&#9776;'; toggleBtn.title = 'Mis notas'
    toggleBtn.setAttribute('aria-label', 'Abrir notas')
    toggleBtn.setAttribute('aria-expanded', 'false')
    toggleBtn.setAttribute('aria-controls', 'reader-sidebar')
    toggleBtn.addEventListener('click', toggleSidebar)
    document.body.appendChild(toggleBtn)

    overlayEl = document.createElement('div')
    overlayEl.className = 'sidebar-overlay'
    overlayEl.addEventListener('click', closeSidebar)
    document.body.appendChild(overlayEl)

    sidebarEl = document.createElement('aside')
    sidebarEl.id = 'reader-sidebar'
    sidebarEl.className = 'reader-sidebar'
    sidebarEl.setAttribute('role', 'dialog')
    sidebarEl.setAttribute('aria-label', 'Notas y subrayados')

    var header = document.createElement('div'); header.className = 'sidebar-header'
    var title = document.createElement('h3'); title.textContent = 'Notas'
    var closeBtn = document.createElement('button'); closeBtn.className = 'sidebar-close'; closeBtn.type = 'button'
    closeBtn.innerHTML = '&#10005;'; closeBtn.title = 'Cerrar'; closeBtn.setAttribute('aria-label', 'Cerrar notas')
    closeBtn.addEventListener('click', closeSidebar)
    header.appendChild(title); header.appendChild(closeBtn)
    sidebarEl.appendChild(header)

    var body = document.createElement('div'); body.className = 'sidebar-body'; body.id = 'sidebar-body'
    sidebarEl.appendChild(body)

    var footer = document.createElement('div'); footer.className = 'sidebar-footer'
    var exp = document.createElement('button'); exp.className = 'sidebar-export-btn'; exp.type = 'button'
    exp.innerHTML = '&#8595; Exportar a .md'; exp.addEventListener('click', exportMarkdown)
    footer.appendChild(exp)
    sidebarEl.appendChild(footer)

    document.body.appendChild(sidebarEl)
  }

  function toggleSidebar() { sidebarOpen ? closeSidebar() : openSidebar() }

  function openSidebar() {
    sidebarOpen = true
    lastFocus = document.activeElement
    sidebarEl.classList.add('open')
    overlayEl.classList.add('visible')
    toggleBtn.setAttribute('aria-expanded', 'true')
    renderSidebar()
    var closeBtn = sidebarEl.querySelector('.sidebar-close')
    if (closeBtn) closeBtn.focus()
  }

  function closeSidebar() {
    if (!sidebarOpen) return
    sidebarOpen = false
    sidebarEl.classList.remove('open')
    overlayEl.classList.remove('visible')
    toggleBtn.setAttribute('aria-expanded', 'false')
    if (lastFocus && lastFocus.focus) lastFocus.focus()
  }

  function colorHex(c) {
    var m = { yellow: '#ffd500', green: '#4caf50', blue: '#2196f3', pink: '#e91e63', orange: '#ff9800', purple: '#9c27b0' }
    return m[c] || '#ffd500'
  }

  function makeItem(hl, index, isNote) {
    var item = document.createElement('div')
    item.className = 'sidebar-item' + (hl.orphan ? ' is-orphan' : '')
    if (!hl.orphan) item.style.borderLeftColor = colorHex(hl.color)

    var del = document.createElement('button')
    del.className = 'sidebar-delete-btn'; del.type = 'button'; del.innerHTML = '&#10005;'
    del.title = isNote ? 'Eliminar nota' : 'Eliminar subrayado'
    del.setAttribute('aria-label', del.title)
    del.addEventListener('click', function (ev) {
      ev.stopPropagation()
      if (isNote) removeAnnotation(hl.id)
      else removeHighlightById(hl.id)
    })
    item.appendChild(del)

    var main = document.createElement('div'); main.className = 'sidebar-main'
    if (!hl.orphan) main.addEventListener('click', function () { scrollToHighlight(hl.id) })

    var ref = document.createElement('span'); ref.className = 'sidebar-ref-badge'
    ref.textContent = (index + 1) + '.'
    main.appendChild(ref)

    var t = document.createElement('div'); t.className = 'sidebar-highlight-text'; t.textContent = hl.text
    main.appendChild(t)

    if (isNote && hl.note) {
      var n = document.createElement('div'); n.className = 'sidebar-note-preview'; n.textContent = hl.note
      main.appendChild(n)
    }
    if (hl.orphan) {
      var tag = document.createElement('div'); tag.className = 'sidebar-orphan-tag'
      tag.textContent = 'No encontrado en el texto actual'
      main.appendChild(tag)
    }
    item.appendChild(main)
    return item
  }

  function renderSidebar() {
    if (!sidebarEl) return
    var body = qs('#sidebar-body'); if (!body) return
    body.innerHTML = ''
    var data = loadData()
    if (data.highlights.length === 0) {
      var empty = document.createElement('div'); empty.className = 'sidebar-empty'
      empty.textContent = 'Selecciona texto para subrayar'
      body.appendChild(empty); return
    }
    var notes = data.highlights.filter(function (h) { return h.note && !h.orphan }).sort(byCreatedAt)
    var plain = data.highlights.filter(function (h) { return !h.note && !h.orphan }).sort(byCreatedAt)
    var orphans = data.highlights.filter(function (h) { return h.orphan })

    function addSection(titleText, list, isNote) {
      if (!list.length) return
      var sec = document.createElement('div'); sec.className = 'sidebar-section'
      var st = document.createElement('div'); st.className = 'sidebar-section-title'
      st.textContent = titleText + ' (' + list.length + ')'
      sec.appendChild(st)
      list.forEach(function (h, i) { sec.appendChild(makeItem(h, i, isNote)) })
      body.appendChild(sec)
    }
    addSection('Anotaciones', notes, true)
    addSection('Subrayados', plain, false)
    addSection('No encontrados', orphans, false)
  }

  function scrollToHighlight(id) {
    var span = qs(hlSelector(id))
    if (span) {
      span.scrollIntoView({ behavior: 'smooth', block: 'center' })
      span.classList.add('hl-flash')
      setTimeout(function () { span.classList.remove('hl-flash') }, 2000)
    }
    closeSidebar()
  }

  /* ============================================================
     EXPORT A MARKDOWN  (buildMarkdown es pura)
     ============================================================ */
  function buildMarkdown(data, title) {
    var lines = []
    lines.push('# ' + (title || 'Notas de lectura'))
    lines.push('')
    var all = (data && data.highlights) ? data.highlights.slice() : []
    var notes = all.filter(function (h) { return h.note && !h.orphan }).sort(byCreatedAt)
    var plain = all.filter(function (h) { return !h.note && !h.orphan }).sort(byCreatedAt)
    var orphans = all.filter(function (h) { return h.orphan })

    if (notes.length) {
      lines.push('## Anotaciones'); lines.push('')
      notes.forEach(function (h, i) {
        lines.push((i + 1) + '. **' + h.text + '**')
        lines.push('   > *' + h.note + '*'); lines.push('')
      })
    }
    if (plain.length) {
      lines.push('## Subrayados'); lines.push('')
      plain.forEach(function (h) { lines.push('- ' + h.text); lines.push('') })
    }
    if (orphans.length) {
      lines.push('## No encontrados en el texto actual'); lines.push('')
      orphans.forEach(function (h) {
        lines.push('- ' + h.text + ' _(color: ' + h.color + ')_'); lines.push('')
      })
    }
    return lines.join('\n')
  }

  function exportMarkdown() {
    var data = loadData()
    if (data.highlights.length === 0) return
    var title = ''
    var h1 = qs('h1')
    if (h1) title = h1.textContent.trim()
    var md = buildMarkdown(data, title)
    var blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a')
    a.href = url
    a.download = (title ? title.replace(/[^a-zA-Z0-9\u00C0-\u024f\s]/g, '').trim() : 'notas') + '.md'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /* ============================================================
     DETECCIÓN DE HUÉRFANOS  (computeOrphans es pura)
     ============================================================ */
  function computeOrphans(highlights, availablePids) {
    var set = availablePids instanceof Set ? availablePids : new Set(availablePids || [])
    return (highlights || []).map(function (h) {
      var orphan = !set.has(h.startPid) || !set.has(h.endPid)
      return { id: h.id, startPid: h.startPid, endPid: h.endPid, orphan: orphan }
    })
  }

  /* ============================================================
     EVENT WIRING
     ============================================================ */
  function isTypingTarget(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
  }

  function onMouseUp(e) {
    if (e.target && e.target.closest && e.target.closest(UI_SELECTOR)) return
    setTimeout(function () {
      var sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) { hidePopup(); return }
      var text = sel.toString().trim()
      if (!text) { hidePopup(); return }
      var range = sel.getRangeAt(0)
      if (!closestBlock(range.startContainer) || !closestBlock(range.endContainer)) { hidePopup(); return }
      showPopup(range, text)
    }, 10)
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      if (popupVisible) { hidePopup(); return }
      if (sidebarOpen) { closeSidebar(); return }
    }
    if (e.key === 'n' && !popupVisible && !sidebarOpen && !isTypingTarget(e.target)) {
      e.preventDefault(); toggleSidebar()
    }
  }

  function onClickOutside(e) {
    if (popupVisible && popupEl && !popupEl.contains(e.target)) {
      var sel = window.getSelection()
      if (!sel || !sel.toString().trim()) hidePopup()
    }
  }

  function onSidebarKeydown(e) {
    if (!sidebarOpen || e.key !== 'Tab') return
    var focusable = sidebarEl.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')
    if (!focusable.length) return
    var first = focusable[0], last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  /* ============================================================
     INIT
     ============================================================ */
  var initialized = false
  function init() {
    if (!hasDOM || initialized) return
    initialized = true
    applySettings()
    createControls()
    assignParagraphIds()
    migrateLegacy()
    reapplyHighlights()
    createSidebar()
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onSidebarKeydown)
  }

  if (hasDOM) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
    else init()
  }

  /* API pura para tests en Node */
  return {
    slugFromPath: slugFromPath,
    escapeAttr: escapeAttr,
    buildMarkdown: buildMarkdown,
    computeOrphans: computeOrphans,
    byCreatedAt: byCreatedAt
  }
})
