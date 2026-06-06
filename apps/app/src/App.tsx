import { useEffect, useState } from "react";
import { getDashboard, type DashboardData } from "./api";
import "./App.css";

const TABS = [
  { id: "summary", label: "Resumen" },
  { id: "capture", label: "Captura" },
  { id: "coordination", label: "Coordinación" },
  { id: "impact", label: "Impacto" },
  { id: "donations", label: "Donaciones" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function load(signal?: AbortSignal) {
      try {
        const nextData = await getDashboard(signal);
        setData(nextData);
        setError(null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "No se pudo cargar el tablero");
      } finally {
        setLoading(false);
      }
    }

    void load(controller.signal);
    const interval = window.setInterval(() => void load(), 5000);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main className="dashboard-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Fundación Raíces · Demo MVP</p>
          <h1>Huella WebApp</h1>
          <p className="hero-copy">
            Tablero read-only alimentado por el backend. Muestra lo que el bot captura,
            estructura y deja trazable desde WhatsApp.
          </p>
        </div>
        <div className="sync-card">
          <span>Última lectura</span>
          <strong>{data ? formatDateTime(data.generatedAt) : "Sin datos"}</strong>
          <small>Polling cada 5s vía apps/api</small>
        </div>
      </section>

      <nav className="tabs" aria-label="Vistas del tablero">
        {TABS.map((tab) => (
          <button
            className={tab.id === activeTab ? "tab active" : "tab"}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error && <div className="notice">{error}</div>}
      {loading && !data ? <div className="panel empty">Cargando tablero...</div> : null}
      {data ? renderTab(activeTab, data) : null}
    </main>
  );
}

function renderTab(tab: TabId, data: DashboardData) {
  switch (tab) {
    case "summary":
      return <SummaryTab data={data} />;
    case "capture":
      return <CaptureTab data={data} />;
    case "coordination":
      return <CoordinationTab data={data} />;
    case "impact":
      return <ImpactTab data={data} />;
    case "donations":
      return <DonationsTab data={data} />;
  }
}

function SummaryTab({ data }: { data: DashboardData }) {
  return (
    <section className="summary-grid">
      <Metric label="Eventos capturados" value={data.summary.eventsCaptured} />
      <Metric label="Tareas abiertas" value={data.summary.openTasks} />
      <Metric label="Actividades" value={data.summary.activities} />
      <Metric label="Asistentes totales" value={data.summary.totalAttendees} />
      <Metric label="Donaciones" value={data.summary.donations} />
      <Metric label="Monto registrado" value={formatMoney(data.summary.donationAmount, "ARS")} />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function CaptureTab({ data }: { data: DashboardData }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <h2>Captura cruda</h2>
        <p>Prueba visual de captura-primero: el mensaje queda guardado antes de estructurarlo.</p>
      </div>
      <div className="event-feed">
        {data.rawEvents.map((event) => (
          <article className="feed-item" key={event.id}>
            <div className="feed-topline">
              <span className="pill">{event.detected_intent ?? "sin intención"}</span>
              <span className="muted">{event.status ?? "sin estado"}</span>
              {event.is_deferred ? <span className="pill warning">diferido</span> : null}
            </div>
            <p>{event.content_text ?? "Sin texto"}</p>
            <small>{formatDateTime(event.received_at ?? event.created_at)}</small>
          </article>
        ))}
        {data.rawEvents.length === 0 ? <EmptyState text="Todavía no hay eventos capturados." /> : null}
      </div>
    </section>
  );
}

function CoordinationTab({ data }: { data: DashboardData }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <h2>Coordinación</h2>
        <p>Tareas creadas desde mensajes internos del equipo.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Responsable</th>
              <th>Vence</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title ?? "Sin título"}</td>
                <td>{task.assignee_name}</td>
                <td>{task.due_date ? formatDate(task.due_date) : "Sin fecha"}</td>
                <td><span className="pill">{task.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.tasks.length === 0 ? <EmptyState text="Todavía no hay tareas." /> : null}
    </section>
  );
}

function ImpactTab({ data }: { data: DashboardData }) {
  return (
    <section className="panel cards-panel">
      <div className="panel-title">
        <h2>Impacto</h2>
        <p>Actividades con métricas agregadas, sin PII.</p>
      </div>
      <div className="activity-grid">
        {data.activities.map((activity) => (
          <article className="activity-card" key={activity.id}>
            <div className="feed-topline">
              <span className="pill">{activity.status}</span>
              {activity.is_deferred ? <span className="pill warning">diferido</span> : null}
            </div>
            <h3>{activity.title ?? "Actividad sin título"}</h3>
            <p>{activity.location ?? "Sin lugar"}</p>
            <div className="activity-stats">
              <span>{activity.attendees_count ?? 0} asistentes</span>
              <span>{activity.volunteers_count ?? 0} voluntarios</span>
            </div>
            <small>{activity.program_name} · {formatDateTime(activity.occurred_at ?? activity.created_at)}</small>
          </article>
        ))}
      </div>
      {data.activities.length === 0 ? <EmptyState text="Todavía no hay actividades." /> : null}
    </section>
  );
}

function DonationsTab({ data }: { data: DashboardData }) {
  return (
    <section className="donations-layout">
      <div className="panel">
        <div className="panel-title">
          <h2>Campañas</h2>
          <p>Progreso de campañas activas o recientes.</p>
        </div>
        <div className="campaign-list">
          {data.campaigns.map((campaign) => {
            const progress = getProgress(campaign.current_amount, campaign.goal_amount);
            return (
              <article className="campaign-card" key={campaign.id}>
                <div>
                  <span className="pill">{campaign.campaign_type}</span>
                  <h3>{campaign.name}</h3>
                  <p>{campaign.description ?? "Sin descripción"}</p>
                </div>
                <div className="progress-label">
                  <span>{formatMoney(campaign.current_amount, campaign.currency)}</span>
                  <span>{campaign.goal_amount ? formatMoney(campaign.goal_amount, campaign.currency) : "Sin meta"}</span>
                </div>
                <div className="progress-bar"><span style={{ width: `${progress}%` }} /></div>
              </article>
            );
          })}
          {data.campaigns.length === 0 ? <EmptyState text="Todavía no hay campañas." /> : null}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h2>Donaciones</h2>
          <p>Intenciones registradas desde remitentes externos.</p>
        </div>
        <div className="event-feed compact">
          {data.donations.map((donation) => (
            <article className="feed-item" key={donation.id}>
              <div className="feed-topline">
                <span className="pill">{donation.donation_type}</span>
                <span className="muted">{donation.status}</span>
              </div>
              <p>{donation.campaign_name}</p>
              <small>{donation.amount ? formatMoney(donation.amount, donation.currency) : formatItems(donation.items)}</small>
            </article>
          ))}
          {data.donations.length === 0 ? <EmptyState text="Todavía no hay donaciones." /> : null}
        </div>
      </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state">{text}</div>;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function getProgress(current: number, goal: number | null) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
}

function formatItems(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) return "Bienes sin detalle";
  return items
    .map((item) => {
      if (typeof item !== "object" || item === null) return "item";
      const record = item as { item?: unknown; qty?: unknown };
      const name = typeof record.item === "string" ? record.item : "item";
      const qty = typeof record.qty === "number" ? ` x${record.qty}` : "";
      return `${name}${qty}`;
    })
    .join(", ");
}
