"use client";

import { FormEvent, useEffect, useState } from "react";

// Yeni Model Yapısına Uygun Tip Tanımlaması
type TrafficEvent = {
  id: number;
  average_kmh: number;
  known_reason: string | null;
  expected_resolution_time: string | null;
  created_at: string;
  // Serializer'dan gelen detay bilgisi
  signaller_detail: {
    city: string;
    district: string;
    road: string;
  };
};

export default function Home() {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State'leri
  const [city, setCity] = useState("Istanbul");
  const [district, setDistrict] = useState("Kadikoy");
  const [roadName, setRoadName] = useState("Bagdat Caddesi");
  const [avgSpeed, setAvgSpeed] = useState(30);
  const [reason, setReason] = useState("Heavy Traffic");

  async function fetchEvents() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/traffic", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load events");
      const data = await res.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      
      // Backend'in beklediği yeni JSON formatı
      const payload = {
        city_name: city,
        district_name: district,
        road_name: roadName,
        average_kmh: avgSpeed,
        known_reason: reason,
      };

      const res = await fetch("/api/traffic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create event");
      }
      await fetchEvents();
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setCreating(false);
    }
  }

  return (
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans"> 
        <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
          <header className="flex flex-col gap-3 border-b border-slate-800 pb-6">
          <h1 className="text-4xl font-bold tracking-tight text-sky-400">
            Smart City Control Center
          </h1>
          <p className="max-w-3xl text-slate-400 text-lg">
            Manage city traffic incidents via relational data layers.
            <br />
            <span className="text-sm text-slate-500">
              Architecture: Next.js → Django API → Pub/Sub → Worker → PostgreSQL
            </span>
          </p>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          {/* FORM ALANI */}
          <div className="h-fit rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-sm">
            <h2 className="mb-6 text-xl font-semibold text-slate-200">
              Report Traffic Incident
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase text-slate-500">City</label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Istanbul"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase text-slate-500">District</label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Kadikoy"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase text-slate-500">Road / Signaller Name</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none"
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  placeholder="e.g. Bagdat Street Sensor #4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase text-slate-500">Speed (km/h)</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none"
                    value={avgSpeed}
                    onChange={(e) => setAvgSpeed(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase text-slate-500">Known Reason</label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Accident"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-lg bg-sky-600 py-3 font-semibold text-white shadow-lg hover:bg-sky-500 disabled:opacity-50 transition-colors"
              >
                {creating ? "Publishing Event..." : "Create & Publish Event"}
              </button>
              {error && <p className="text-center text-sm text-red-400">{error}</p>}
            </form>
          </div>

          {/* LISTE ALANI */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-200">Live Traffic Feed</h2>
              <button onClick={fetchEvents} className="text-sm text-sky-400 hover:underline">
                Refresh Data
              </button>
            </div>
            
            {loading ? (
              <div className="text-slate-500">Loading stream...</div>
            ) : events.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center text-slate-500">
                No active traffic events recorded.
              </div>
            ) : (
              <ul className="space-y-3">
                {events.map((ev) => (
                  <li key={ev.id} className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-5 transition-all hover:border-slate-700 hover:bg-slate-800/80">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                {ev.signaller_detail.city}
                            </span>
                            <span className="text-slate-500 text-xs">/</span>
                            <span className="text-slate-300 text-sm font-medium">
                                {ev.signaller_detail.district}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                          {ev.signaller_detail.road}
                        </h3>
                        {ev.known_reason && (
                           <p className="text-sm text-amber-400">⚠️ {ev.known_reason}</p>
                        )}
                        <p className="text-xs text-slate-500 pt-2">
                           Event ID: #{ev.id} • {new Date(ev.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">
                            {ev.average_kmh} <span className="text-sm text-slate-500 font-normal">km/h</span>
                        </div>
                        <div className="mt-1 text-xs text-slate-400">Avg Speed</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}