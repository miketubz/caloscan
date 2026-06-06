import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, Upload, Flame, Dumbbell, Wheat, Droplets, Loader2, Plus, Trash2 } from 'lucide-react';
import './style.css';

function Stat({ icon, label, value, unit }) {
  return <div className="stat"><div className="ico">{icon}</div><b>{value}{unit}</b><span>{label}</span></div>;
}

function fallbackEstimate() {
  return {
    calories: 882, protein_g: 52, carbs_g: 59, fat_g: 48, confidence_percent: 55,
    items: [
      { name: 'Rice', portion: 'about 1 cup', calories: 200 },
      { name: 'Fried eggs', portion: '2 pieces', calories: 180 },
      { name: 'Meat dish', portion: 'medium serving', calories: 350 },
      { name: 'Noodles / pancit', portion: 'small serving', calories: 150 }
    ],
    notes: 'Demo estimate. Add an API key for real photo scanning.'
  };
}

function App() {
  const [image, setImage] = useState(null);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('history') || '[]'));

  const onFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImage(reader.result); setResult(null); };
    reader.readAsDataURL(file);
  };

  async function analyze() {
    if (!image) return;
    setLoading(true);
    try {
      const r = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image, notes }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setResult({ ...fallbackEstimate(), notes: e.message || 'Using demo estimate.' });
    } finally { setLoading(false); }
  }

  function save() {
    const entry = { ...result, date: new Date().toLocaleString(), image };
    const next = [entry, ...history].slice(0, 30);
    setHistory(next); localStorage.setItem('history', JSON.stringify(next));
  }

  function clearHistory() { setHistory([]); localStorage.removeItem('history'); }

  return <main>
    <section className="hero">
      <div><h1>CalorieScan</h1><p>Take a food photo, add details, and estimate calories + macros.</p></div>
    </section>

    <label className="upload">
      {image ? <img src={image} /> : <div><Camera size={42}/><b>Tap to scan meal</b><span>Camera or gallery</span></div>}
      <input type="file" accept="image/*" capture="environment" onChange={onFile}/>
    </label>

    <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional: e.g. 2 eggs, 1 cup rice, pork adobo, small noodles..." />
    <button className="primary" disabled={!image || loading} onClick={analyze}>{loading ? <Loader2 className="spin"/> : <Upload/>} Analyze calories</button>

    {result && <section className="card">
      <div className="grid">
        <Stat icon={<Flame/>} value={Math.round(result.calories || 0)} unit="" label="CALORIES" />
        <Stat icon={<Dumbbell/>} value={Math.round(result.protein_g || 0)} unit="g" label="PROTEIN" />
        <Stat icon={<Wheat/>} value={Math.round(result.carbs_g || 0)} unit="g" label="CARBS" />
        <Stat icon={<Droplets/>} value={Math.round(result.fat_g || 0)} unit="g" label="FATS" />
      </div>
      <p className="confidence">Confidence: {result.confidence_percent || '?'}%</p>
      <h3>Detected food</h3>
      {(result.items || []).map((x,i)=><div className="item" key={i}><span>{x.name}<small>{x.portion}</small></span><b>{x.calories} cal</b></div>)}
      <p className="note">{result.notes}</p>
      <button className="save" onClick={save}><Plus/> Save to history</button>
    </section>}

    <section className="card">
      <div className="row"><h3>History</h3>{history.length>0 && <button className="link" onClick={clearHistory}><Trash2 size={16}/>Clear</button>}</div>
      {history.length === 0 ? <p className="muted">No saved scans yet.</p> : history.map((h,i)=><div className="history" key={i}><img src={h.image}/><div><b>{h.calories} calories</b><small>{h.date}</small></div></div>)}
    </section>
    <p className="footer">Estimates only. For diabetes, HbA1c, or diet targets, confirm with a healthcare professional.</p>
  </main>
}

createRoot(document.getElementById('root')).render(<App />);
