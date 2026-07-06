/* Test de lógica pura del lector (sin DOM).
 * Ejecutar:  node test/logic.test.js
 */
'use strict'
var assert = require('assert')
var api = require('../book-reader.js')

var passed = 0
function ok(name, cond) { assert.ok(cond, name); passed++; console.log('  \u2713 ' + name) }

console.log('book-reader — tests de lógica')

/* --- slugFromPath --- */
console.log('slugFromPath:')
ok('libro en GH Pages', api.slugFromPath('/libros/where-wizards-stay-up-late/') === 'where-wizards-stay-up-late')
ok('libro con index.html', api.slugFromPath('/libros/where-wizards-stay-up-late/index.html') === 'where-wizards-stay-up-late')
ok('portal', api.slugFromPath('/libros/') === 'libros')
ok('portal con index.html', api.slugFromPath('/libros/index.html') === 'libros')
ok('ruta file:// profunda', api.slugFromPath('/home/angel/libros/where-wizards-stay-up-late/index.html') === 'where-wizards-stay-up-late')
ok('vacío -> home', api.slugFromPath('') === 'home')
ok('raíz -> home', api.slugFromPath('/') === 'home')

/* --- escapeAttr --- */
console.log('escapeAttr:')
ok('id seguro sin cambios', api.escapeAttr('p-0') === 'p-0')
ok('escapa comilla', api.escapeAttr('a"b') === 'a\\"b')
ok('escapa backslash', api.escapeAttr('a\\b') === 'a\\\\b')
ok('null -> ""', api.escapeAttr(null) === '')

/* --- buildMarkdown --- */
console.log('buildMarkdown:')
var data = {
  highlights: [
    { id: '1', text: 'foo', color: 'yellow', note: '', createdAt: 1 },
    { id: '2', text: 'bar', color: 'blue', note: 'my note', createdAt: 2 },
    { id: '3', text: 'baz', color: 'green', note: '', createdAt: 3, orphan: true }
  ]
}
var md = api.buildMarkdown(data, 'My Book')
ok('título del libro', md.indexOf('# My Book') === 0)
ok('sección anotaciones', md.indexOf('## Anotaciones') !== -1)
ok('anotación numerada', md.indexOf('1. **bar**') !== -1)
ok('nota en blockquote', md.indexOf('> *my note*') !== -1)
ok('sección subrayados', md.indexOf('## Subrayados') !== -1)
ok('subrayado plano', md.indexOf('- foo') !== -1)
ok('sección huérfanos', md.indexOf('## No encontrados en el texto actual') !== -1)
ok('huérfano con color', md.indexOf('_(color: green)_') !== -1)

var mdEmpty = api.buildMarkdown({ highlights: [] }, '')
ok('vacío usa título por defecto', mdEmpty.indexOf('# Notas de lectura') === 0)
ok('vacío sin secciones', mdEmpty.indexOf('## ') === -1)

/* --- computeOrphans --- */
console.log('computeOrphans:')
var pids = new Set(['p-0', 'p-1'])
var orphans = api.computeOrphans([
  { id: 'a', startPid: 'p-0', endPid: 'p-1' },
  { id: 'b', startPid: 'p-0', endPid: 'p-5' },
  { id: 'c', startPid: 'p-9', endPid: 'p-1' }
], pids)
ok('no huérfano cuando ambos pids existen', orphans[0].orphan === false)
ok('huérfano si endPid falta', orphans[1].orphan === true)
ok('huérfano si startPid falta', orphans[2].orphan === true)
ok('acepta array en vez de Set', api.computeOrphans([{ id: 'x', startPid: 'p-0', endPid: 'p-0' }], ['p-0'])[0].orphan === false)
ok('vacío -> []', Array.isArray(api.computeOrphans([], [])) && api.computeOrphans([], []).length === 0)

/* --- byCreatedAt --- */
console.log('byCreatedAt:')
var sorted = [{ createdAt: 3 }, { createdAt: 1 }, { createdAt: 2 }].sort(api.byCreatedAt)
ok('orden ascendente por createdAt', sorted[0].createdAt === 1 && sorted[2].createdAt === 3)

console.log('\nOK \u2014 ' + passed + ' comprobaciones pasadas')
