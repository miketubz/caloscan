import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Camera,
  Upload,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Loader2,
  Trash2
} from "lucide-react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";
import "./style.css";

const FOOD_DB = {
  rice: { calories: 200, protein_g: 4, carbs_g: 45, fat_g: 0 },
  garlic_rice: { calories: 250, protein_g: 5, carbs_g: 45, fat_g: 6 },
  fried_rice: { calories: 280, protein_g: 6, carbs_g: 48, fat_g: 8 },

  egg: { calories: 90, protein_g: 6, carbs_g: 1, fat_g: 7 },
  boiled_egg: { calories: 78, protein_g: 6, carbs_g: 1, fat_g: 5 },
  fried_egg: { calories: 100, protein_g: 6, carbs_g: 1, fat_g: 8 },

  chicken: { calories: 250, protein_g: 25, carbs_g: 0, fat_g: 15 },
  fried_chicken: { calories: 320, protein_g: 23, carbs_g: 10, fat_g: 20 },
  pork: { calories: 300, protein_g: 22, carbs_g: 0, fat_g: 22 },
  beef: { calories: 280, protein_g: 24, carbs_g: 0, fat_g: 20 },
  fish: { calories: 220, protein_g: 25, carbs_g: 0, fat_g: 12 },

  adobo: { calories: 350, protein_g: 25, carbs_g: 5, fat_g: 25 },
  chicken_adobo: { calories: 320, protein_g: 28, carbs_g: 4, fat_g: 20 },
  pork_adobo: { calories: 400, protein_g: 25, carbs_g: 5, fat_g: 30 },
  sinigang: { calories: 250, protein_g: 22, carbs_g: 10, fat_g: 12 },
  pork_sinigang: { calories: 330, protein_g: 24, carbs_g: 10, fat_g: 22 },
  shrimp_sinigang: { calories: 220, protein_g: 24, carbs_g: 10, fat_g: 7 },
  nilaga: { calories: 280, protein_g: 25, carbs_g: 10, fat_g: 15 },
  bulalo: { calories: 450, protein_g: 30, carbs_g: 8, fat_g: 30 },
  kare_kare: { calories: 500, protein_g: 25, carbs_g: 20, fat_g: 35 },
  menudo: { calories: 350, protein_g: 20, carbs_g: 15, fat_g: 22 },
  afritada: { calories: 340, protein_g: 22, carbs_g: 15, fat_g: 18 },
  mechado: { calories: 380, protein_g: 25, carbs_g: 15, fat_g: 25 },
  kaldereta: { calories: 420, protein_g: 25, carbs_g: 15, fat_g: 30 },
  bicol_express: { calories: 450, protein_g: 22, carbs_g: 8, fat_g: 35 },
  sisig: { calories: 550, protein_g: 30, carbs_g: 10, fat_g: 40 },
  dinuguan: { calories: 300, protein_g: 20, carbs_g: 8, fat_g: 20 },
  lechon: { calories: 500, protein_g: 30, carbs_g: 0, fat_g: 40 },
  lechon_kawali: { calories: 650, protein_g: 28, carbs_g: 5, fat_g: 55 },
  crispy_pata: { calories: 800, protein_g: 35, carbs_g: 5, fat_g: 70 },
  lumpia: { calories: 120, protein_g: 5, carbs_g: 12, fat_g: 6 },
  lumpiang_shanghai: { calories: 150, protein_g: 7, carbs_g: 10, fat_g: 9 },
  tortang_talong: { calories: 250, protein_g: 10, carbs_g: 10, fat_g: 18 },
  pinakbet: { calories: 180, protein_g: 6, carbs_g: 18, fat_g: 8 },
  laing: { calories: 300, protein_g: 8, carbs_g: 15, fat_g: 22 },
  ginataang_gulay: { calories: 280, protein_g: 8, carbs_g: 18, fat_g: 20 },

  bangus: { calories: 250, protein_g: 24, carbs_g: 0, fat_g: 15 },
  tilapia: { calories: 220, protein_g: 25, carbs_g: 0, fat_g: 12 },
  daing: { calories: 260, protein_g: 28, carbs_g: 0, fat_g: 15 },
  paksiw: { calories: 220, protein_g: 25, carbs_g: 4, fat_g: 10 },
  tinapa: { calories: 230, protein_g: 26, carbs_g: 0, fat_g: 12 },
  galunggong: { calories: 220, protein_g: 24, carbs_g: 0, fat_g: 12 },

  pancit: { calories: 250, protein_g: 7, carbs_g: 40, fat_g: 8 },
  pancit_canton: { calories: 300, protein_g: 8, carbs_g: 45, fat_g: 10 },
  pancit_bihon: { calories: 230, protein_g: 6, carbs_g: 40, fat_g: 6 },
  palabok: { calories: 350, protein_g: 12, carbs_g: 45, fat_g: 12 },
  mami: { calories: 300, protein_g: 12, carbs_g: 45, fat_g: 8 },
  sopas: { calories: 320, protein_g: 15, carbs_g: 35, fat_g: 12 },
  lomi: { calories: 450, protein_g: 18, carbs_g: 55, fat_g: 18 },

  tapsilog: { calories: 650, protein_g: 30, carbs_g: 60, fat_g: 25 },
  tocilog: { calories: 700, protein_g: 25, carbs_g: 70, fat_g: 25 },
  longsilog: { calories: 750, protein_g: 25, carbs_g: 65, fat_g: 35 },
  bangsilog: { calories: 600, protein_g: 30, carbs_g: 60, fat_g: 18 },
  hotsilog: { calories: 650, protein_g: 20, carbs_g: 65, fat_g: 30 },
  cornsilog: { calories: 650, protein_g: 25, carbs_g: 65, fat_g: 25 },

  kwek_kwek: { calories: 180, protein_g: 8, carbs_g: 15, fat_g: 10 },
  fishball: { calories: 150, protein_g: 6, carbs_g: 15, fat_g: 7 },
  squidball: { calories: 170, protein_g: 8, carbs_g: 15, fat_g: 8 },
  kikiam: { calories: 200, protein_g: 8, carbs_g: 18, fat_g: 10 },
  isaw: { calories: 180, protein_g: 12, carbs_g: 3, fat_g: 12 },
  barbecue: { calories: 220, protein_g: 18, carbs_g: 8, fat_g: 12 },
  pork_barbecue: { calories: 250, protein_g: 18, carbs_g: 8, fat_g: 16 },
  banana_cue: { calories: 250, protein_g: 2, carbs_g: 55, fat_g: 5 },
  turon: { calories: 280, protein_g: 3, carbs_g: 45, fat_g: 10 },

  halo_halo: { calories: 450, protein_g: 8, carbs_g: 80, fat_g: 12 },
  leche_flan: { calories: 300, protein_g: 6, carbs_g: 35, fat_g: 15 },
  maja_blanca: { calories: 250, protein_g: 3, carbs_g: 35, fat_g: 10 },
  bibingka: { calories: 280, protein_g: 5, carbs_g: 40, fat_g: 10 },
  puto: { calories: 120, protein_g: 2, carbs_g: 25, fat_g: 1 },
  kutsinta: { calories: 100, protein_g: 1, carbs_g: 23, fat_g: 1 },
  sapin_sapin: { calories: 250, protein_g: 3, carbs_g: 45, fat_g: 6 },
  cassava_cake: { calories: 300, protein_g: 4, carbs_g: 50, fat_g: 10 },
  biko: { calories: 280, protein_g: 4, carbs_g: 55, fat_g: 5 },
  taho: { calories: 250, protein_g: 8, carbs_g: 45, fat_g: 4 },

  chickenjoy: { calories: 320, protein_g: 23, carbs_g: 10, fat_g: 20 },
  jolly_spaghetti: { calories: 400, protein_g: 12, carbs_g: 60, fat_g: 12 },
  burger_steak: { calories: 350, protein_g: 18, carbs_g: 20, fat_g: 20 },
  palabok_fiesta: { calories: 450, protein_g: 16, carbs_g: 55, fat_g: 18 },

  banana: { calories: 105, protein_g: 1, carbs_g: 27, fat_g: 0 },
  mango: { calories: 135, protein_g: 1, carbs_g: 35, fat_g: 0 },
  papaya: { calories: 60, protein_g: 1, carbs_g: 15, fat_g: 0 },
  pineapple: { calories: 80, protein_g: 1, carbs_g: 20, fat_g: 0 },
  apple: { calories: 95, protein_g: 0, carbs_g: 25, fat_g: 0 },
  bread: { calories: 90, protein_g: 3, carbs_g: 15, fat_g: 1 },
  pizza: { calories: 285, protein_g: 12, carbs_g: 36, fat_g: 10 },
  burger: { calories: 450, protein_g: 22, carbs_g: 40, fat_g: 22 },
  fries: { calories: 365, protein_g: 4, carbs_g: 48, fat_g: 17 },
  noodles: { calories: 250, protein_g: 7, carbs_g: 40, fat_g: 8 },
  vegetable: { calories: 80, protein_g: 3, carbs_g: 12, fat_g: 2 }
};

const ALIASES = {
  "garlic rice": "garlic_rice",
  "fried rice": "fried_rice",
  "boiled egg": "boiled_egg",
  "fried egg": "fried_egg",
  "fried chicken": "fried_chicken",
  "chicken adobo": "chicken_adobo",
  "pork adobo": "pork_adobo",
  "pork sinigang": "pork_sinigang",
  "shrimp sinigang": "shrimp_sinigang",
  "kare kare": "kare_kare",
  "bicol express": "bicol_express",
  "lechon kawali": "lechon_kawali",
  "crispy pata": "crispy_pata",
  "lumpiang shanghai": "lumpiang_shanghai",
  "tortang talong": "tortang_talong",
  "ginataang gulay": "ginataang_gulay",
  "pancit canton": "pancit_canton",
  "pancit bihon": "pancit_bihon",
  bihon: "pancit_bihon",
  "pork barbecue": "pork_barbecue",
  bbq: "barbecue",
  "banana cue": "banana_cue",
  bananacue: "banana_cue",
  "halo halo": "halo_halo",
  "leche flan": "leche_flan",
  "maja blanca": "maja_blanca",
  "cassava cake": "cassava_cake",
  "jolly spaghetti": "jolly_spaghetti",
  "burger steak": "burger_steak",
  "palabok fiesta": "palabok_fiesta",
  "jollibee chicken": "chickenjoy",
  chickenjoy: "chickenjoy"
};

function Stat({ icon, label, value, unit }) {
  return (
    <div className="stat">
      <div className="ico">{icon}</div>
      <b>{value}{unit}</b>
      <span>{label}</span>
    </div>
  );
}

function prettyName(key) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function findFoodsFromText(text) {
  const lower = text.toLowerCase();
  const found = [];

  Object.entries(ALIASES).forEach(([phrase, key]) => {
    if (lower.includes(phrase)) found.push(key);
  });

  Object.keys(FOOD_DB).forEach((key) => {
    const phrase = key.replaceAll("_", " ");
    if (lower.includes(key) || lower.includes(phrase)) found.push(key);
  });

  return [...new Set(found)];
}

function estimatePortionMultiplier(notes, foodKey) {
  const lower = notes.toLowerCase();
  const foodText = foodKey.replaceAll("_", " ");
  const escaped = foodText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const directMatch = lower.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(pcs|pieces|piece|servings|serving|cups|cup)?\\s*${escaped}`));
  if (directMatch) return Number(directMatch[1]);

  const foodBeforeNumber = lower.match(new RegExp(`${escaped}\\s*(x\\s*)?(\\d+(?:\\.\\d+)?)`));
  if (foodBeforeNumber) return Number(foodBeforeNumber[2]);

  if (lower.includes("half")) return 0.5;
  if (lower.includes("small")) return 0.75;
  if (lower.includes("medium")) return 1;
  if (lower.includes("large")) return 1.5;
  if (lower.includes("extra large")) return 2;

  return 1;
}

function buildEstimate(foods, notes, confidence = 70) {
  const uniqueFoods = [...new Set(foods)];

  const items = uniqueFoods.map((food) => {
    const base = FOOD_DB[food];
    const multiplier = estimatePortionMultiplier(notes, food);

    return {
      name: prettyName(food),
      portion: multiplier === 1 ? "estimated serving" : `${multiplier} serving(s)`,
      calories: Math.round(base.calories * multiplier),
      protein_g: Math.round(base.protein_g * multiplier),
      carbs_g: Math.round(base.carbs_g * multiplier),
      fat_g: Math.round(base.fat_g * multiplier)
    };
  });

  return {
    calories: items.reduce((sum, i) => sum + i.calories, 0),
    protein_g: items.reduce((sum, i) => sum + i.protein_g, 0),
    carbs_g: items.reduce((sum, i) => sum + i.carbs_g, 0),
    fat_g: items.reduce((sum, i) => sum + i.fat_g, 0),
    confidence_percent: confidence,
    items,
    summary:
      "Free estimate using Filipino food database, browser image recognition, and your description. For best accuracy, type the food and portion."
  };
}

function App() {
  const imgRef = useRef(null);
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem("history") || "[]")
  );
  const [error, setError] = useState("");

  useEffect(() => {
    mobilenet.load().then(setModel).catch(() => {
      setError("Free AI model failed to load. You can still use description-only mode.");
    });
  }, []);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setResult(null);
    setImage(URL.createObjectURL(file));
  };

  async function analyze() {
    if (!image && !notes.trim()) {
      setError("Upload a photo or type a food description first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let foods = findFoodsFromText(notes);
      let confidence = foods.length ? 85 : 50;

      if (foods.length === 0 && model && imgRef.current) {
        const predictions = await model.classify(imgRef.current);
        const joined = predictions.map((p) => p.className).join(" ").toLowerCase();

        foods = findFoodsFromText(joined);

        if (joined.includes("banana")) foods.push("banana");
        if (joined.includes("apple")) foods.push("apple");
        if (joined.includes("pizza")) foods.push("pizza");
        if (joined.includes("burger") || joined.includes("cheeseburger")) foods.push("burger");
        if (joined.includes("hotdog")) foods.push("bread");
        if (joined.includes("plate") || joined.includes("dish")) foods.push("rice");

        confidence = Math.round((predictions[0]?.probability || 0.5) * 100);
      }

      if (foods.length === 0) {
        setError("Food not found. Please type the food name, for example: 1 cup rice, pork adobo, pancit.");
        setLoading(false);
        return;
      }

      const data = buildEstimate(foods, notes, confidence);
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
      localStorage.setItem("history", JSON.stringify(next));
    } catch {
      setError("Analysis failed. Try typing the food name and portion.");
    } finally {
      setLoading(false);
    }
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem("history");
  }

  return (
    <main className="app">
      <section className="panel">
        <h1>CalorieScan</h1>
        <p className="sub">Free calorie estimate with Filipino food support.</p>

        {result && (
          <div className="stats">
            <Stat icon={<Flame size={18} />} label="Calories" value={result.calories} unit="" />
            <Stat icon={<Dumbbell size={18} />} label="Protein" value={result.protein_g} unit="g" />
            <Stat icon={<Wheat size={18} />} label="Carbs" value={result.carbs_g} unit="g" />
            <Stat icon={<Droplets size={18} />} label="Fats" value={result.fat_g} unit="g" />
          </div>
        )}

        <label className="upload">
          {image ? (
            <img ref={imgRef} src={image} alt="Meal preview" />
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
          placeholder="Example: 1 cup rice, 2 eggs, pork adobo, pancit canton"
        />

        <button onClick={analyze} disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
          {loading ? "Analyzing..." : "Analyze calories"}
        </button>

        {error && <div className="error">{error}</div>}

        {result && (
          <div className="result">
            <h2>Detected food</h2>

            <ul>
              {result.items.map((item, i) => (
                <li key={i}>
                  <b>{item.name}</b>
                  <span>{item.portion}</span>
                  <small>
                    {item.calories} kcal · P {item.protein_g}g · C {item.carbs_g}g · F {item.fat_g}g
                  </small>
                </li>
              ))}
            </ul>

            <p className="note">Confidence: {result.confidence_percent}%</p>
            <p className="note">{result.summary}</p>
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
              {h.image && <img src={h.image} alt="History meal" />}
              <div>
                <b>{h.result?.calories || 0} kcal</b>
                <span>{h.notes || "No description"}</span>
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

createRoot(document.getElementById("root")).render(<App />);
