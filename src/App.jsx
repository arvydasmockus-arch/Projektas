import { useEffect, useRef, useState } from 'react'
import './App.css'

const key = 'mano-diena-tasks'
const examples = [
  { id: '1', title: 'Susiplanuoti savaitės darbus', description: 'Išsirink tris svarbiausius darbus.', category: 'Darbas', priority: 'Svarbi', done: false },
  { id: '2', title: 'Išmokti React pagrindus', description: 'Sukurk komponentą ir išbandyk mygtuko paspaudimą.', category: 'Mokslai', priority: 'Įprasta', done: false },
  { id: '3', title: 'Išeiti pasivaikščioti', description: '20 minučių gryno oro ir laiko sau.', category: 'Asmeninė', priority: 'Įprasta', done: false },
  { id: '4', title: 'Susitvarkyti darbo vietą', description: 'Daugiau erdvės naujoms idėjoms.', category: 'Darbas', priority: 'Įprasta', done: true },
]
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(key))
    if (Array.isArray(saved) && saved.every(t => t && typeof t.id === 'string' && typeof t.title === 'string' && typeof t.description === 'string' && ['Darbas', 'Mokslai', 'Asmeninė'].includes(t.category) && ['Svarbi', 'Įprasta'].includes(t.priority) && typeof t.done === 'boolean')) return saved
  } catch { /* Start with examples when storage is unavailable. */ }
  return examples
}
function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [filter, setFilter] = useState('Visos')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [storageError, setStorageError] = useState(false)
  const input = useRef(null)
  const done = tasks.filter(t => t.done).length
  const progress = tasks.length ? Math.round(done / tasks.length * 100) : 0
  const visible = tasks.filter(t => (filter === 'Visos' || (filter === 'Aktyvios' ? !t.done : t.done)) && `${t.title} ${t.description} ${t.category}`.toLocaleLowerCase('lt').includes(search.trim().toLocaleLowerCase('lt')))
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(tasks)) }
    catch { queueMicrotask(() => setStorageError(true)) }
  }, [tasks])
  function addTask(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const title = data.get('title').trim()
    if (!title) { setMessage('Įrašyk užduoties pavadinimą.'); input.current.focus(); return }
    setTasks(current => [{ id: crypto.randomUUID(), title, description: data.get('description').trim(), category: data.get('category'), priority: data.get('priority'), done: false }, ...current])
    form.reset()
    setFilter('Visos')
    setSearch('')
    setMessage('Užduotis pridėta!')
    input.current.focus()
  }
  return (
    <div className="app">
      <header><a className="brand" href="#"><span>✓</span> Mano diena.</a><span className="date">{new Intl.DateTimeFormat('lt-LT', { month: 'long', day: 'numeric' }).format(new Date())}</span><span className="avatar">A</span></header>
      <main>
        <section className="intro"><div><p className="eyebrow">MAŽI ŽINGSNIAI. DIDELI REZULTATAI.</p><h1>Gera diena prasideda<br />nuo aiškaus plano<span>.</span></h1><p className="subtitle">Surink mintis, susidėliok darbus ir judėk savo tempu.</p></div><button className="primary" onClick={() => input.current.focus()}>＋ Nauja užduotis</button></section>
        <section className="stats" aria-label="Užduočių statistika">
          <div className="stat"><span className="stat-icon purple">▤</span><div><p>Iš viso užduočių</p><strong>{tasks.length}</strong></div></div>
          <div className="stat"><span className="stat-icon orange">◷</span><div><p>Aktyvios užduotys</p><strong>{tasks.length - done}</strong></div></div>
          <div className="stat"><span className="stat-icon green">✓</span><div><p>Jau atlikta</p><strong>{done}</strong></div></div>
          <div className="stat progress-stat"><div className="progress-heading"><p>Tavo progresas</p><b>{progress}%</b></div><progress value={progress} max="100" aria-label="Atliktų užduočių procentas" /><small>Kiekvienas atliktas darbas svarbus.</small></div>
        </section>
        <div className="workspace">
          <section aria-labelledby="tasks-heading">
            <div className="section-heading"><h2 id="tasks-heading">Mano užduotys <span>{visible.length}</span></h2><button className="text-button" disabled={!done} onClick={() => { setTasks(current => current.filter(t => !t.done)); setMessage('Atliktos užduotys pašalintos.') }}>Išvalyti atliktas</button></div>
            <div className="toolbar"><div className="filters">{['Visos', 'Aktyvios', 'Atliktos'].map(f => <button key={f} aria-pressed={filter === f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div><input type="search" className="search" aria-label="Ieškoti užduočių" placeholder="Ieškoti užduoties…" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <div className="task-grid">{visible.map(t => <article key={t.id} className={`task-card ${t.done ? 'done' : ''}`}><div className="card-top"><span className={`category category-${t.category}`}>{t.category}</span><button className="delete-button" aria-label={`Ištrinti: ${t.title}`} onClick={() => { setTasks(current => current.filter(item => item.id !== t.id)); setMessage('Užduotis ištrinta.') }}>×</button></div><h3>{t.title}</h3><p>{t.description || 'Aprašymas nepridėtas.'}</p><div className="card-bottom"><span className={`priority ${t.priority === 'Svarbi' ? 'important' : ''}`}>● {t.priority}</span><button className={`complete-button ${t.done ? 'completed' : ''}`} aria-pressed={t.done} onClick={() => { setTasks(current => current.map(item => item.id === t.id ? { ...item, done: !item.done } : item)); setMessage('Užduoties būsena atnaujinta.') }}>{t.done ? '✓ Atlikta' : 'Pažymėti atlikta'}</button></div></article>)}</div>
            {!visible.length && <div className="empty"><span>☀</span><h3>{search ? 'Nieko neradome' : 'Čia kol kas ramu'}</h3><p>Pridėk užduotį arba pakeisk paiešką ir filtrus.</p></div>}
          </section>
          <aside><form onSubmit={addTask} className="add-form"><span className="form-icon">＋</span><h2>Naujas planas</h2><p>Ką norėtum nuveikti?</p><label htmlFor="title">Užduoties pavadinimas</label><input ref={input} name="title" id="title" required maxLength={100} placeholder="Pvz., perskaityti 10 puslapių" /><label htmlFor="description">Aprašymas (nebūtina)</label><textarea name="description" id="description" rows="3" maxLength={400} placeholder="Pridėk kelias detales…" /><div className="form-row"><div><label htmlFor="category">Kategorija</label><select name="category" id="category"><option>Asmeninė</option><option>Darbas</option><option>Mokslai</option></select></div><div><label htmlFor="priority">Prioritetas</label><select name="priority" id="priority"><option>Įprasta</option><option>Svarbi</option></select></div></div><button className="primary submit" type="submit">＋ Pridėti užduotį</button><p className="notice" role="status">{message}</p></form><div className="tip"><span>✦</span><div><strong>Vienas darbas vienu metu.</strong><p>Pradėk nuo mažos užduoties. Ji gali suteikti impulso visai dienai.</p></div></div></aside>
        </div>
      </main>
      <footer><span>Mano diena · Tavo erdvė planams</span><span>{storageError ? 'Išsaugojimas nepasiekiamas: užduotys liks tik šiame lange.' : 'Užduotys saugomos šioje naršyklėje'}</span></footer>
    </div>
  )
}
export default App
