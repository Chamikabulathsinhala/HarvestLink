import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  const [statusInfo, setStatusInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [farm, setFarm] = useState("");
  const [spoilageHours, setSpoilageHours] = useState(24);
  const [qtyKg, setQtyKg] = useState(30);

  async function loadData() {
    const [statusRes, itemsRes] = await Promise.all([
      fetch(`${API_BASE}/api/status`),
      fetch(`${API_BASE}/api/produce/priority`),
    ]);
    const statusJson = await statusRes.json();
    const itemsJson = await itemsRes.json();
    setStatusInfo(statusJson);
    setItems(itemsJson.items || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim() || !farm.trim()) return;

    await fetch(`${API_BASE}/api/produce`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        farm: farm.trim(),
        spoilage_hours: Number(spoilageHours),
        qty_kg: Number(qtyKg),
      }),
    });

    setName("");
    setFarm("");
    await loadData();
  }

  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-emerald-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">HarvestLink</h1>
            <p className="text-sm text-gray-600">
              Priority Delivery Queue (Min-Heap DSA by Spoilage Window)
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            API: {statusInfo ? statusInfo.status : "connecting..."}
          </span>
        </div>

        <form
          onSubmit={handleAdd}
          className="bg-white rounded-2xl shadow-sm p-6 border border-emerald-100 grid grid-cols-1 sm:grid-cols-5 gap-3"
        >
          <input
            type="text"
            placeholder="Produce (e.g. Carrots)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Farm name"
            value={farm}
            onChange={(e) => setFarm(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Spoilage (hrs)"
            value={spoilageHours}
            onChange={(e) => setSpoilageHours(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Qty (kg)"
            value={qtyKg}
            onChange={(e) => setQtyKg(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg px-4 py-2 text-sm cursor-pointer"
          >
            Add Batch
          </button>
        </form>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-emerald-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Urgent Delivery Queue (Most Urgent First)
          </h2>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    #{idx + 1} · {item.name}{" "}
                    <span className="text-xs font-normal text-gray-500">
                      ({item.farm})
                    </span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Quantity: {item.qty_kg} kg
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
                  {item.spoilage_hours}h left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}