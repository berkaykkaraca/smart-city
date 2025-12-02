"use client";

import { FormEvent, useEffect, useState } from "react";

type TrafficEvent = {
  id: number;
  sensor_id: string;
  location: string;
  vehicle_count: number;
  average_speed_kmh: number;
  created_at: string;
};

export default function Home() {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sensorId, setSensorId] = useState("sensor-1");
  const [location, setLocation] = useState("Main St & 3rd Ave");
  const [vehicleCount, setVehicleCount] = useState(10);
  const [avgSpeed, setAvgSpeed] = useState(40);

  async function fetchEvents() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/traffic", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load events");
      }
      const data = await res.json();
      setEvents(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Unknown error");
      } else {
        setError("Unknown error");
      }
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
      const res = await fetch("/api/traffic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sensor_id: sensorId,
          location,
          vehicle_count: vehicleCount,
          average_speed_kmh: avgSpeed,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create event");
      }
      await fetchEvents();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Unknown error");
      } else {
        setError("Unknown error");
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col gap-2 border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Smart City Traffic Dashboard
          </h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Django REST API + Google Pub/Sub backend, visualized with a Next.js
            frontend. Use the form below to send synthetic traffic data into the
            system.
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40"
          >
            <h2 className="text-lg font-medium">Send traffic event</h2>

            <div className="space-y-1 text-sm">
              <label className="block text-slate-300" htmlFor="sensorId">
                Sensor ID
              </label>
              <input
                id="sensorId"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-0 focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                value={sensorId}
                onChange={(e) => setSensorId(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-sm">
              <label className="block text-slate-300" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-0 focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <label className="block text-slate-300" htmlFor="vehicleCount">
                  Vehicle count
                </label>
                <input
                  id="vehicleCount"
                  type="number"
                  min={0}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-0 focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                  value={vehicleCount}
                  onChange={(e) => setVehicleCount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-300" htmlFor="avgSpeed">
                  Avg speed (km/h)
                </label>
                <input
                  id="avgSpeed"
                  type="number"
                  min={0}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-0 focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                  value={avgSpeed}
                  onChange={(e) => setAvgSpeed(Number(e.target.value))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Sending..." : "Send event"}
            </button>
            <button
              type="button"
              onClick={fetchEvents}
              className="ml-2 inline-flex items-center justify-center rounded-full border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-sky-500 hover:text-sky-300"
            >
              Refresh events
            </button>

            {error && (
              <p className="pt-1 text-sm text-red-400">Error: {error}</p>
            )}
          </form>

          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium">Recent events</h2>
              {loading && (
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Loading…
                </span>
              )}
            </div>
            {events.length === 0 ? (
              <p className="text-sm text-slate-400">
                No events yet. Submit the form to create the first one.
              </p>
            ) : (
              <ul className="divide-y divide-slate-800 text-sm">
                {events.map((ev) => (
                  <li key={ev.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-100">
                          {ev.location}
                        </p>
                        <p className="text-xs text-slate-400">
                          Sensor {ev.sensor_id} •{" "}
                          {new Date(ev.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right text-xs text-slate-300">
                        <p>{ev.vehicle_count} vehicles</p>
                        <p>{ev.average_speed_kmh.toFixed(1)} km/h</p>
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
