import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, Upload, Flame, Dumbbell, Wheat, Droplets, Loader2, Trash2 } from 'lucide-react';
import './style.css';

function Stat({ icon, label, value, unit }) {
  return (
    <div className="stat">
      <div className="ico">{icon}</div>
      <b>{value}{unit}</b>
      <span>{label}</span>
    </div>
  );
}

async function compressImage(file, maxWidth = 900, quality = 0.65) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = () => {
      img.src = reader.result;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    reader.onerror = reject;
    img.onerror = reject;

    reader.readAsDataURL(file);
  });
}

function App() {
  const [image, setImage] = useState(null);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('history') || '[]'));
  const [error, setError] = useState('');

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setResult(null);

    try {
      const compressed = await compressImage(file);
      setImage(compressed);
    } catch {
      setError('Image failed to load. Please try another photo.');
    }
  };

  async function analyze() {
    if (!image) {
      setError('Please upload a food photo first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, notes })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Analysis failed.');

      setResult(data);

      const entry = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        image,
        notes,
        result: data
      };

      const next = [entry, ...history].slice(0, 10);
      setHistory(next);
      localStorage.setItem('history', JSON.stringify(next));
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem('history');
  }

  return (
    <main className="app">
      <section className="panel">
        <h1>CalorieScan</h1>
        <p className="sub">Take a food photo, add details, and estimate calories + macros.</p>

        {result && (
          <div className="stats">
            <Stat icon={<Flame size={18} />} label="Calories" value={result.calories || 0} unit="" />
            <Stat icon={<Dumbbell size={18} />} label="Protein" value={result.protein_g || 0} unit="g" />
            <Stat icon={<Wheat size={18} />} label="Carbs" value={result.carbs_g || 0} unit="g" />
            <Stat icon={<Droplets size={18} />} label="Fats" value={result.fat_g || 0} unit="g" />
          </div>
        )}

        <label className="upload">
          {image ? (
            <img src={image} alt="Meal preview" />
          ) : (
            <div className="placeholder">
              <Camera size={34} />
              <b>Tap to scan meal</b>
              <span>Camera or gallery</span>
            </div>
          )}

          <input type="file" accept="image/*" capture="environment" onChange={onFile} hidden />
        </label>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Example: Only one item: 1 banana"
        />

        <button onClick={analyze} disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
          {loading ? 'Analyzing...' : 'Analyze calories'}
        </button>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="result">
            <h2>Detected food</h2>

            <ul>
              {(result.items || []).map((item, i) => (
                <li key={i}>
                  <b>{item.name}</b>
                  <span>{item.portion || 'estimated portion'}</span>
                  <small>{item.calories || 0} kcal</small>
                </li>
              ))}
            </ul>

            {result.confidence_percent && (
              <p className="note">Confidence: {result.confidence_percent}%</p>
            )}

            {result.summary && <p className="note">{result.summary}</p>}
          </div>
        )}

        <div className="historyHead">
          <h2>History</h2>
          {history.length > 0 && (
            <button className="iconBtn" onClick={clearHistory}>
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="history">
          {history.length === 0 && <p className="muted">No saved scans yet.</p>}

          {history.map((h) => (
            <div className="historyItem" key={h.id}>
              <img src={h.image} alt="History meal" />
              <div>
                <b>{h.result?.calories || 0} kcal</b>
                <span>{h.notes || 'No description'}</span>
                <small>{h.date}</small>
              </div>
            </div>
          ))}
        </div>

        <p className="footer">Estimates only. Not medical advice.</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
