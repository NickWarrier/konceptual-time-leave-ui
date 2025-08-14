import React, { useMemo, useState, useEffect } from "react";

// Konceptual Time & Leave — Frontend Prototype (Brand 2025)
// New features in this revision:
// 1) Corrected tip text + proper late logic
// 2) Timezone-aware clocking per employee (AU vs PK etc.)
// 3) Per-employee shift window (start/end) + grace minutes
// 4) Roles/permissions: Manager, Engineer, Drafter (tabs adapt)
// 5) Mobile bottom nav for quick access

// --- Brand Palette (exact matches) ---
const BRAND = {
  jungle: "#0D3036",      // Jungle Green (Primary)
  jungle600: "#09242A",   // Darkened Jungle for gradients
  orange: "#FF5C01",      // Vivid Orange (Accent)
  beige: "#F0F6E0",       // Beige White (Background highlight)
  black: "#000000",
  white: "#FFFFFF",
};

const shadow = {
  card: "0 10px 25px rgba(0,0,0,.06)",
};

// Inject minimal global styles for typography
function BrandTypography() {
  return (
    <style>{`
      :root{ --brand-jungle:${BRAND.jungle}; --brand-orange:${BRAND.orange}; --brand-beige:${BRAND.beige}; }
      .font-display{ font-family: Sherika, "Helvetica Neue", Arial, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-weight: 700; letter-spacing: -0.01em; }
      .font-display-medium{ font-family: Sherika, "Helvetica Neue", Arial, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-weight: 600; letter-spacing: -0.01em; }
      .font-body{ font-family: "Helvetica Neue", Arial, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
      .bevel-card{ border-radius: 1rem; box-shadow: ${shadow.card}; background: ${BRAND.white}; }
      .pill{ border-radius: 0.75rem; }
      .btn{ border-radius: 0.75rem; font-weight: 700; }
      .safe-touch{ min-height: 44px; min-width: 44px; }
      @media (max-width: 768px){
        body{ padding-bottom: 72px; } /* space for bottom nav */
      }
    `}</style>
  );
}

// --- Helpers: time & shifts ---
const TZ = {
  AU: "Australia/Melbourne",
  PK: "Asia/Karachi",
};

function hhmmToMins(hhmm){ const [h,m] = hhmm.split(":").map(Number); return h*60 + m; }
function minsToHHMM(mins){ const h = Math.floor(mins/60).toString().padStart(2,'0'); const m = (mins%60).toString().padStart(2,'0'); return `${h}:${m}`; }
function nowMinsInTZ(timeZone){
  const s = new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone}).format(new Date());
  const [hh,mm] = s.split(':').map(Number); return hh*60+mm;
}
function nowClockString(tz){
  return new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone: tz}).format(new Date());
}

// --- Sample employees with roles, timezones & shifts ---
const EMPLOYEES = [
  { id:"U001", name:"Nick",     role:"Manager",  country:"AU", timeZone: TZ.AU, shiftStart:"08:00", shiftEnd:"16:00", graceMin:5, rate: 90 },
  { id:"U002", name:"Rizwan",   role:"Engineer", country:"PK", timeZone: TZ.PK, shiftStart:"08:00", shiftEnd:"16:00", graceMin:5, rate: 55 },
  { id:"U003", name:"Hira",     role:"Drafter",  country:"PK", timeZone: TZ.PK, shiftStart:"10:00", shiftEnd:"18:00", graceMin:5, rate: 45 },
  { id:"U004", name:"Miguel",   role:"Engineer", country:"AU", timeZone: TZ.AU, shiftStart:"09:30", shiftEnd:"17:30", graceMin:10, rate: 65 },
];

// Projects sample
const PROJECTS = [
  { code: "01-MEL-01-0007", name: "Factory Retaining Walls", client: "RWS", hours: 126 },
  { code: "01-SYD-01-0032", name: "Sunset Sleepers Custom", client: "SSP", hours: 76 },
  { code: "01-MEL-01-0019", name: "Keystone POS Connection R&D", client: "KST", hours: 48 },
];

function Header({ user, onUserChange }){
  return (
    <header style={{
      background: `linear-gradient(120deg, ${BRAND.jungle}, ${BRAND.jungle600})`,
      color: BRAND.white,
      boxShadow: shadow.card,
    }} className="sticky top-0 z-30 font-body">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div style={{background: BRAND.orange}} className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl">K</div>
          <div>
            <div className="font-display text-xl">Konceptual</div>
            <div className="opacity-85 text-sm">Engineering Excellence From Ground Up</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-xs opacity-80">Role</div>
            <div className="font-display-medium">{user.role}</div>
          </div>
          <select className="pill p-2 text-sm text-black" value={user.id} onChange={e=>onUserChange(e.target.value)}>
            {EMPLOYEES.map(u => (
              <option key={u.id} value={u.id}>{u.name} • {u.role}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}

function TabBar({ tabs, active, onSelect }){
  return (
    <nav className="max-w-7xl mx-auto px-5 pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-body">
      {tabs.map(t => (
        <button key={t.key} onClick={()=>onSelect(t.key)}
          style={{ borderColor: active===t.key? BRAND.orange : "transparent", background: active===t.key? BRAND.beige : BRAND.white }}
          className="pill border-2 p-3 text-left shadow-sm hover:shadow-md transition-all">
          <div className="text-xs opacity-70">{t.section}</div>
          <div className="font-display-medium">{t.label}</div>
        </button>
      ))}
    </nav>
  );
}

function MobileNav({ tabs, active, onSelect }){
  // Mobile bottom nav for quick access
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t font-body" style={{borderColor:'#E5E7EB'}}>
      <div className="grid grid-cols-4 text-sm">
        {tabs.slice(0,4).map(t => (
          <button key={t.key} onClick={()=>onSelect(t.key)} className="py-3 safe-touch" style={{color: active===t.key? BRAND.orange : BRAND.jungle}}>
            <div className="font-display-medium leading-none">{t.label.split(' ')[0]}</div>
          </button>
        ))}
      </div>
    </nav>
  );
}

function StatCard({ label, value, hint, progress, accent="jungle" }){
  const bar = accent==="orange" ? BRAND.orange : BRAND.jungle;
  return (
    <div className="bevel-card p-5 font-body">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-2xl md:text-3xl font-display">{value}</div>
      {hint && <div className="text-xs opacity-70 mt-1">{hint}</div>}
      {typeof progress === 'number' && (
        <div className="mt-3">
          <div className="h-2 w-full pill" style={{background: "#E5E7EB"}} />
          <div className="-mt-2 h-2 pill" style={{width: `${Math.min(100, Math.max(0, progress))}%`, background: bar}} />
        </div>
      )}
    </div>
  );
}

function Section({ title, children, actions }){
  return (
    <section className="max-w-7xl mx-auto px-5 py-6 font-body">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-display" style={{color: BRAND.jungle}}>{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

// --- Employee: Clock-In Hub (timezone & flexible shift aware) ---
function ClockInHub({ user, state, setState }){
  const nowStr = nowClockString(user.timeZone);
  const nowMins = nowMinsInTZ(user.timeZone);
  const threshold = hhmmToMins(user.shiftStart) + (user.graceMin ?? 0);
  const isLateNow = nowMins > threshold;
  const checkedIn = !!state.timeIn && !state.timeOut;

  const toggleCheck = () => {
    if (!checkedIn) setState(s => ({...s, timeIn: new Date().toISOString(), late: isLateNow}));
    else setState(s => ({...s, timeOut: new Date().toISOString()}));
  };

  return (
    <Section title="Clock‑In Hub" actions={
      <button onClick={toggleCheck}
        style={{background: checkedIn ? BRAND.orange : BRAND.jungle, color: BRAND.white}}
        className="btn px-5 py-2.5 shadow hover:opacity-95 font-body">
        {checkedIn ? "Check‑Out" : "Check‑In"}
      </button>
    }>
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label={`Current Time (${user.country})`} value={nowStr} hint={user.timeZone} />
        <StatCard label="Status" value={checkedIn ? (state.late? "Late (In)" : "On Time") : "Not Checked‑In"} hint={state.timeIn ? new Date(state.timeIn).toLocaleTimeString() : "—"} />
        <StatCard label="Breaks Today" value={`${state.breakMin} min`} />
        <StatCard label="Utilisation" value={`${state.util}%`} progress={state.util} />
      </div>
      <div className="mt-5 pill p-4" style={{background: BRAND.beige, color: BRAND.jungle}}>
        <div className="font-display-medium">Tip</div>
        <div className="text-sm opacity-90">
          You are marked <b>Late</b> if you check‑in after <b>{user.shiftStart}{user.graceMin? `+${user.graceMin}m` : ''}</b> local to your timezone ({user.timeZone}).<br/>
          You are <b>On‑time</b> if you check‑in <b>before</b> that threshold.
        </div>
      </div>
    </Section>
  );
}

// --- Employee: Work Timer ---
function WorkTimer({ user, state, setState, projects }){
  const [active, setActive] = useState(null);
  const [task, setTask] = useState("Design");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => { if (!active) return; const t = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(t); }, [active]);

  const start = () => { if (!active) setActive({ started: new Date().toISOString(), project: projects[0].code, task }); };
  const stop  = () => { if (active) { setActive(null); setElapsed(0); } };
  const takeBreak = () => setState(s => ({...s, breakMin: s.breakMin + 15}));

  return (
    <Section title="Work Timer">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bevel-card p-5">
          <div className="text-sm opacity-70 mb-1 font-body">Project</div>
          <select className="w-full border pill p-3 font-body" value={active?.project ?? projects[0].code}
            onChange={e => setActive(a => a? {...a, project: e.target.value} : { started: new Date().toISOString(), project: e.target.value, task })}>
            {projects.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
          </select>
          <div className="text-sm opacity-70 mt-3 mb-1 font-body">Task Type</div>
          <select className="w-full border pill p-3 font-body" value={task} onChange={e => setTask(e.target.value)}>
            {["Design","CAD","RFI","Review","Admin"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex gap-2 mt-4">
            <button onClick={start} style={{background: BRAND.jungle, color: BRAND.white}} className="btn px-4 py-2 shadow font-body">Start</button>
            <button onClick={stop} style={{background: BRAND.orange, color: BRAND.white}} className="btn px-4 py-2 shadow font-body">Stop</button>
            <button onClick={takeBreak} className="btn px-4 py-2 font-body" style={{background: BRAND.beige, color: BRAND.jungle}}>+15m Break</button>
          </div>
        </div>
        <div className="bevel-card p-5 flex flex-col items-center justify-center">
          <div className="text-sm opacity-70 mb-2 font-body">Elapsed</div>
          <div className="text-5xl font-display">{fmt(elapsed)}</div>
          <div className="text-sm opacity-70 mt-2 font-body">{active? `${active.project} • ${task}` : "Idle"}</div>
        </div>
        <div className="bevel-card p-5">
          <div className="font-display-medium mb-2">Today</div>
          <MiniBarChart data={[
            { label: "Design", value: 3.2 },
            { label: "CAD", value: 2.1 },
            { label: "RFI", value: 0.7 },
            { label: "Break", value: 0.5 },
          ]} />
        </div>
      </div>
    </Section>
  );
}

function fmt(sec){ const h = Math.floor(sec/3600).toString().padStart(2,'0'); const m = Math.floor((sec%3600)/60).toString().padStart(2,'0'); const s = Math.floor(sec%60).toString().padStart(2,'0'); return `${h}:${m}:${s}`; }
function MiniBarChart({ data }){ const max = Math.max(...data.map(d=>d.value)); return (
  <div className="space-y-2 font-body">{data.map(d => (
    <div key={d.label}>
      <div className="text-xs opacity-70 mb-1 flex justify-between"><span>{d.label}</span><span>{d.value.toFixed(1)}h</span></div>
      <div className="h-2 w-full pill" style={{background: "#E5E7EB"}}/>
      <div className="-mt-2 h-2 pill" style={{width: `${(d.value/max)*100}%`, background: BRAND.jungle}}/>
    </div>
  ))}</div>
); }

// --- Leave Hub ---
function LeaveHub(){
  const [requests, setRequests] = useState([
    { id: "L-001", type: "Annual", start: "2025-08-25", end: "2025-08-29", days: 5, status: "Approved" },
    { id: "L-002", type: "Sick",   start: "2025-07-02", end: "2025-07-03", days: 2, status: "Approved" },
  ]);
  const [balance, setBalance] = useState(12);
  const [form, setForm] = useState({ type: "Annual", start: "", end: "", cashout: false });

  const submit = () => {
    if(!form.start || !form.end) return alert("Pick dates");
    const days = calcDays(form.start, form.end);
    if(days > balance && !form.cashout) return alert("Insufficient balance");
    setRequests(rs => [{ id: `L-${(rs.length+1).toString().padStart(3,'0')}`, type: form.type, start: form.start, end: form.end, days, status: "Submitted" }, ...rs]);
  };

  return (
    <Section title="Leave Hub" actions={<div className="text-sm opacity-80 font-body">Balance: <b>{balance} days</b></div>}>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bevel-card p-5">
          <div className="font-display-medium mb-3">Request Leave</div>
          <div className="text-sm opacity-70 font-body">Type</div>
          <select className="w-full border pill p-3 mb-3 font-body" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
            {['Annual','Sick','Misc'].map(t=> <option key={t}>{t}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm opacity-70 font-body">Start</div>
              <input type="date" className="w-full border pill p-3 font-body" value={form.start} onChange={e=>setForm({...form, start:e.target.value})} />
            </div>
            <div>
              <div className="text-sm opacity-70 font-body">End</div>
              <input type="date" className="w-full border pill p-3 font-body" value={form.end} onChange={e=>setForm({...form, end:e.target.value})} />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm font-body"><input type="checkbox" checked={form.cashout} onChange={e=>setForm({...form, cashout:e.target.checked})} /> Cash‑out if over balance</label>
          <button onClick={submit} style={{background: BRAND.jungle, color: BRAND.white}} className="btn mt-4 w-full py-3 shadow font-body">Submit</button>
          <div className="mt-3 text-xs opacity-70 font-body">Public holidays are excluded automatically.</div>
        </div>
        <div className="md:col-span-2 bevel-card p-5 overflow-auto">
          <div className="font-display-medium mb-3">My Requests</div>
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2">ID</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="py-2">{r.id}</td>
                  <td>{r.type}</td>
                  <td>{r.start} → {r.end}</td>
                  <td>{r.days}</td>
                  <td>
                    <span className="px-2 py-1 pill text-xs font-display-medium" style={{background: r.status==="Approved"? BRAND.beige : "#F3F4F6", color: BRAND.jungle}}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

function calcDays(start, end){ const s = new Date(start), e = new Date(end); const ms = e - s; if (ms < 0) return 0; return Math.round(ms / (1000*60*60*24)) + 1; }

// --- Manager / Team Dashboard ---
function TeamDashboard(){
  return (
    <Section title="Team Dashboard">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Utilisation (Avg)" value="87%" progress={87} />
        <StatCard label="Late Arrivals (Week)" value="3" hint="Target ≤ 2" accent="orange" />
        <StatCard label="Open Leave Requests" value="2" />
        <StatCard label="Payroll (Month)" value="$42,380" hint="Approved hours × rates" />
      </div>
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <div className="bevel-card p-5">
          <div className="font-display-medium mb-2">Project Effort Split</div>
          <MiniBarChart data={PROJECTS.map(p=>({ label: p.client, value: Math.max(1, Math.round(p.hours/10)/10) }))} />
        </div>
        <div className="bevel-card p-5">
          <div className="font-display-medium mb-2">Top Contributors</div>
          <ul className="space-y-2 text-sm font-body">
            {EMPLOYEES.slice(1).map(e => (
              <li key={e.id} className="flex items-center justify-between border-b pb-2">
                <span className="font-display-medium">{e.name}</span>
                <span className="opacity-70">{e.role}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bevel-card p-5">
          <div className="font-display-medium mb-2">Attendance Today</div>
          <ul className="space-y-2 text-sm font-body">
            {EMPLOYEES.map(e => {
              const late = nowMinsInTZ(e.timeZone) > (hhmmToMins(e.shiftStart) + (e.graceMin??0));
              return (
                <li key={e.id} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 pill" style={{background: late? BRAND.orange : BRAND.jungle}}></span>
                  <span className="font-display-medium">{e.name}</span>
                  <span className="opacity-60 ml-auto">{late? "Late" : "On‑time"} ({e.country})</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}

// --- Admin: Projects (unchanged) ---
function ProjectsAdmin(){
  const [list, setList] = useState(PROJECTS);
  const [form, setForm] = useState({ code: "", name: "", client: "" });
  const add = () => { if(!form.code) return; setList(ls=>[{...form, hours:0}, ...ls]); setForm({code:"",name:"",client:""}); };
  return (
    <Section title="Projects">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bevel-card p-5">
          <div className="font-display-medium mb-3">Add Project</div>
          {['code','name','client'].map(k => (
            <div key={k} className="mb-2">
              <div className="text-sm opacity-70 capitalize font-body">{k}</div>
              <input className="w-full border pill p-3 font-body" value={form[k]} onChange={e=>setForm({...form, [k]: e.target.value})} />
            </div>
          ))}
          <button onClick={add} style={{background: BRAND.jungle, color: BRAND.white}} className="btn mt-2 w-full py-3 shadow font-body">Save</button>
        </div>
        <div className="md:col-span-2 bevel-card p-5 overflow-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2">Code</th><th>Name</th><th>Client</th><th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.code} className="border-t">
                  <td className="py-2">{p.code}</td><td>{p.name}</td><td>{p.client}</td><td>{p.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

// --- Admin: Employees (edit TZ & shifts) ---
function EmployeesAdmin({ employees, setEmployees }){
  const [sel, setSel] = useState(employees[0].id);
  const e = employees.find(x => x.id===sel);
  const update = (patch) => setEmployees(list => list.map(x => x.id===e.id? {...x, ...patch} : x));

  return (
    <Section title="Employees (Timezone & Shifts)">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bevel-card p-5">
          <div className="font-display-medium mb-3">Select Employee</div>
          <select className="w-full border pill p-3 font-body" value={sel} onChange={e=>setSel(e.target.value)}>
            {employees.map(p => <option key={p.id} value={p.id}>{p.name} • {p.role}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <div className="text-sm opacity-70">Shift Start</div>
              <input className="w-full border pill p-3" value={e.shiftStart} onChange={ev=>update({shiftStart: ev.target.value})} placeholder="08:00"/>
            </div>
            <div>
              <div className="text-sm opacity-70">Shift End</div>
              <input className="w-full border pill p-3" value={e.shiftEnd} onChange={ev=>update({shiftEnd: ev.target.value})} placeholder="16:00"/>
            </div>
            <div>
              <div className="text-sm opacity-70">Grace (min)</div>
              <input type="number" className="w-full border pill p-3" value={e.graceMin} onChange={ev=>update({graceMin: Number(ev.target.value)||0})} />
            </div>
            <div>
              <div className="text-sm opacity-70">Timezone</div>
              <select className="w-full border pill p-3" value={e.timeZone} onChange={ev=>update({timeZone: ev.target.value})}>
                <option value={TZ.AU}>Australia/Melbourne</option>
                <option value={TZ.PK}>Asia/Karachi</option>
              </select>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 bevel-card p-5 overflow-auto">
          <div className="font-display-medium mb-3">Roster</div>
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2">Name</th><th>Role</th><th>Country</th><th>Timezone</th><th>Shift</th><th>Grace</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.name}</td>
                  <td>{p.role}</td>
                  <td>{p.country}</td>
                  <td className="text-xs">{p.timeZone}</td>
                  <td>{p.shiftStart}–{p.shiftEnd}</td>
                  <td>{p.graceMin}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

// --- Approvals ---
function Approvals(){
  const [items, setItems] = useState([
    { id: "TS-1007", employee: "Rizwan", period: "05–11 Aug", hours: 39.5, status: "Pending" },
    { id: "TS-1008", employee: "Hira",   period: "05–11 Aug", hours: 41.0, status: "Pending" },
  ]);
  const act = (id, status) => setItems(xs=> xs.map(x => x.id===id? {...x, status}: x));
  return (
    <Section title="Weekly Timesheet Approvals">
      <div className="bevel-card p-5">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="text-left opacity-70">
              <th className="py-2">ID</th><th>Employee</th><th>Week</th><th>Hours</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-t">
                <td className="py-2">{i.id}</td><td>{i.employee}</td><td>{i.period}</td><td>{i.hours}</td><td>{i.status}</td>
                <td className="text-right">
                  <button onClick={()=>act(i.id, 'Approved')} style={{background: BRAND.jungle, color: BRAND.white}} className="btn px-3 py-1.5 mr-2 shadow font-body">Approve</button>
                  <button onClick={()=>act(i.id, 'Rejected')} style={{background: BRAND.orange, color: BRAND.white}} className="btn px-3 py-1.5 shadow font-body">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// --- Root App with RBAC & Mobile Nav ---
export default function App(){
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [userId, setUserId] = useState(EMPLOYEES[0].id);
  const user = employees.find(u => u.id===userId);

  const [tab, setTab] = useState("emp.dashboard");
  const [empState, setEmpState] = useState({ timeIn: null, timeOut: null, breakMin: 0, late: false, util: 82 });

  const tabs = useMemo(() => {
    if(user.role === 'Manager') return [
      { key: 'emp.dashboard', label: 'My Dashboard', section: 'Employee' },
      { key: 'emp.clock',     label: 'Clock‑In Hub', section: 'Employee' },
      { key: 'emp.timer',     label: 'Work Timer',   section: 'Employee' },
      { key: 'emp.leave',     label: 'Leave',        section: 'Employee' },
      { key: 'mgr.team',      label: 'Team Dashboard', section: 'Manager' },
      { key: 'mgr.approvals', label: 'Approvals', section: 'Manager' },
      { key: 'adm.emps',      label: 'Employees', section: 'Admin' },
      { key: 'adm.projects',  label: 'Projects',  section: 'Admin' },
    ];
    return [
      { key: 'emp.dashboard', label: 'My Dashboard', section: 'Employee' },
      { key: 'emp.clock',     label: 'Clock‑In Hub', section: 'Employee' },
      { key: 'emp.timer',     label: 'Work Timer',   section: 'Employee' },
      { key: 'emp.leave',     label: 'Leave',        section: 'Employee' },
    ];
  }, [user.role]);

  useEffect(()=>{ setTab(tabs[0].key); }, [user.role]);

  return (
    <div className="font-body" style={{background: BRAND.beige, minHeight: '100vh', color: BRAND.jungle}}>
      <BrandTypography />
      <Header user={user} onUserChange={setUserId} />
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />

      {tab === 'emp.dashboard' && (
        <Section title="My Dashboard">
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard label="This Week" value="37.8 h" hint="Mon‑Thu" progress={89} />
            <StatCard label="Utilisation" value="82%" progress={82} />
            <StatCard label="Breaks (avg)" value="38 m" />
            <StatCard label="Late (week)" value="1" accent="orange" />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bevel-card p-5">
              <div className="font-display-medium mb-2">My Projects</div>
              <ul className="text-sm divide-y font-body">
                {PROJECTS.map(p => (
                  <li key={p.code} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-display-medium">{p.name}</div>
                      <div className="opacity-70 text-xs">{p.code} • {p.client}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display-medium">{p.hours} h</div>
                      <div className="opacity-70 text-xs">month‑to‑date</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bevel-card p-5">
              <div className="font-display-medium mb-2">Notifications</div>
              <ul className="text-sm space-y-2 font-body">
                <li>Timesheet due <b>Friday 4pm</b>.</li>
                <li>Leave approved <b>25–29 Aug</b>.</li>
                <li>Project <b>01‑SYD‑01‑0032</b> nearing budget.</li>
              </ul>
            </div>
          </div>
        </Section>
      )}

      {tab === 'emp.clock'   && <ClockInHub user={user} state={empState} setState={setEmpState} />}
      {tab === 'emp.timer'   && <WorkTimer user={user} state={empState} setState={setEmpState} projects={PROJECTS} />}
      {tab === 'emp.leave'   && <LeaveHub />}
      {tab === 'mgr.team'    && user.role==='Manager' && <TeamDashboard />}
      {tab === 'mgr.approvals' && user.role==='Manager' && <Approvals />}
      {tab === 'adm.projects' && user.role==='Manager' && <ProjectsAdmin />}
      {tab === 'adm.emps'    && user.role==='Manager' && <EmployeesAdmin employees={employees} setEmployees={setEmployees} />}

      <MobileNav tabs={tabs} active={tab} onSelect={setTab} />

      <footer className="max-w-7xl mx-auto px-5 py-10 text-sm opacity-80 font-body">
        Timezone & shift-aware. Roles: Manager / Engineer / Drafter. Mobile nav enabled.
      </footer>
    </div>
  );
}import React, { useMemo, useState, useEffect } from "react";

// Konceptual Time & Leave — Frontend Prototype (Brand 2025)
// New features in this revision:
// 1) Corrected tip text + proper late logic
// 2) Timezone-aware clocking per employee (AU vs PK etc.)
// 3) Per-employee shift window (start/end) + grace minutes
// 4) Roles/permissions: Manager, Engineer, Drafter (tabs adapt)
// 5) Mobile bottom nav for quick access

// --- Brand Palette (exact matches) ---
const BRAND = {
  jungle: "#0D3036",      // Jungle Green (Primary)
  jungle600: "#09242A",   // Darkened Jungle for gradients
  orange: "#FF5C01",      // Vivid Orange (Accent)
  beige: "#F0F6E0",       // Beige White (Background highlight)
  black: "#000000",
  white: "#FFFFFF",
};

const shadow = {
  card: "0 10px 25px rgba(0,0,0,.06)",
};

// Inject minimal global styles for typography
function BrandTypography() {
  return (
    <style>{`
      :root{ --brand-jungle:${BRAND.jungle}; --brand-orange:${BRAND.orange}; --brand-beige:${BRAND.beige}; }
      .font-display{ font-family: Sherika, "Helvetica Neue", Arial, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-weight: 700; letter-spacing: -0.01em; }
      .font-display-medium{ font-family: Sherika, "Helvetica Neue", Arial, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-weight: 600; letter-spacing: -0.01em; }
      .font-body{ font-family: "Helvetica Neue", Arial, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
      .bevel-card{ border-radius: 1rem; box-shadow: ${shadow.card}; background: ${BRAND.white}; }
      .pill{ border-radius: 0.75rem; }
      .btn{ border-radius: 0.75rem; font-weight: 700; }
      .safe-touch{ min-height: 44px; min-width: 44px; }
      @media (max-width: 768px){
        body{ padding-bottom: 72px; } /* space for bottom nav */
      }
    `}</style>
  );
}

// --- Helpers: time & shifts ---
const TZ = {
  AU: "Australia/Melbourne",
  PK: "Asia/Karachi",
};

function hhmmToMins(hhmm){ const [h,m] = hhmm.split(":").map(Number); return h*60 + m; }
function minsToHHMM(mins){ const h = Math.floor(mins/60).toString().padStart(2,'0'); const m = (mins%60).toString().padStart(2,'0'); return `${h}:${m}`; }
function nowMinsInTZ(timeZone){
  const s = new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone}).format(new Date());
  const [hh,mm] = s.split(':').map(Number); return hh*60+mm;
}
function nowClockString(tz){
  return new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone: tz}).format(new Date());
}

// --- Sample employees with roles, timezones & shifts ---
const EMPLOYEES = [
  { id:"U001", name:"Nick",     role:"Manager",  country:"AU", timeZone: TZ.AU, shiftStart:"08:00", shiftEnd:"16:00", graceMin:5, rate: 90 },
  { id:"U002", name:"Rizwan",   role:"Engineer", country:"PK", timeZone: TZ.PK, shiftStart:"08:00", shiftEnd:"16:00", graceMin:5, rate: 55 },
  { id:"U003", name:"Hira",     role:"Drafter",  country:"PK", timeZone: TZ.PK, shiftStart:"10:00", shiftEnd:"18:00", graceMin:5, rate: 45 },
  { id:"U004", name:"Miguel",   role:"Engineer", country:"AU", timeZone: TZ.AU, shiftStart:"09:30", shiftEnd:"17:30", graceMin:10, rate: 65 },
];

// Projects sample
const PROJECTS = [
  { code: "01-MEL-01-0007", name: "Factory Retaining Walls", client: "RWS", hours: 126 },
  { code: "01-SYD-01-0032", name: "Sunset Sleepers Custom", client: "SSP", hours: 76 },
  { code: "01-MEL-01-0019", name: "Keystone POS Connection R&D", client: "KST", hours: 48 },
];

function Header({ user, onUserChange }){
  return (
    <header style={{
      background: `linear-gradient(120deg, ${BRAND.jungle}, ${BRAND.jungle600})`,
      color: BRAND.white,
      boxShadow: shadow.card,
    }} className="sticky top-0 z-30 font-body">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div style={{background: BRAND.orange}} className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl">K</div>
          <div>
            <div className="font-display text-xl">Konceptual</div>
            <div className="opacity-85 text-sm">Engineering Excellence From Ground Up</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-xs opacity-80">Role</div>
            <div className="font-display-medium">{user.role}</div>
          </div>
          <select className="pill p-2 text-sm text-black" value={user.id} onChange={e=>onUserChange(e.target.value)}>
            {EMPLOYEES.map(u => (
              <option key={u.id} value={u.id}>{u.name} • {u.role}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}

function TabBar({ tabs, active, onSelect }){
  return (
    <nav className="max-w-7xl mx-auto px-5 pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-body">
      {tabs.map(t => (
        <button key={t.key} onClick={()=>onSelect(t.key)}
          style={{ borderColor: active===t.key? BRAND.orange : "transparent", background: active===t.key? BRAND.beige : BRAND.white }}
          className="pill border-2 p-3 text-left shadow-sm hover:shadow-md transition-all">
          <div className="text-xs opacity-70">{t.section}</div>
          <div className="font-display-medium">{t.label}</div>
        </button>
      ))}
    </nav>
  );
}

function MobileNav({ tabs, active, onSelect }){
  // Mobile bottom nav for quick access
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t font-body" style={{borderColor:'#E5E7EB'}}>
      <div className="grid grid-cols-4 text-sm">
        {tabs.slice(0,4).map(t => (
          <button key={t.key} onClick={()=>onSelect(t.key)} className="py-3 safe-touch" style={{color: active===t.key? BRAND.orange : BRAND.jungle}}>
            <div className="font-display-medium leading-none">{t.label.split(' ')[0]}</div>
          </button>
        ))}
      </div>
    </nav>
  );
}

function StatCard({ label, value, hint, progress, accent="jungle" }){
  const bar = accent==="orange" ? BRAND.orange : BRAND.jungle;
  return (
    <div className="bevel-card p-5 font-body">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-2xl md:text-3xl font-display">{value}</div>
      {hint && <div className="text-xs opacity-70 mt-1">{hint}</div>}
      {typeof progress === 'number' && (
        <div className="mt-3">
          <div className="h-2 w-full pill" style={{background: "#E5E7EB"}} />
          <div className="-mt-2 h-2 pill" style={{width: `${Math.min(100, Math.max(0, progress))}%`, background: bar}} />
        </div>
      )}
    </div>
  );
}

function Section({ title, children, actions }){
  return (
    <section className="max-w-7xl mx-auto px-5 py-6 font-body">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-display" style={{color: BRAND.jungle}}>{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

// --- Employee: Clock-In Hub (timezone & flexible shift aware) ---
function ClockInHub({ user, state, setState }){
  const nowStr = nowClockString(user.timeZone);
  const nowMins = nowMinsInTZ(user.timeZone);
  const threshold = hhmmToMins(user.shiftStart) + (user.graceMin ?? 0);
  const isLateNow = nowMins > threshold;
  const checkedIn = !!state.timeIn && !state.timeOut;

  const toggleCheck = () => {
    if (!checkedIn) setState(s => ({...s, timeIn: new Date().toISOString(), late: isLateNow}));
    else setState(s => ({...s, timeOut: new Date().toISOString()}));
  };

  return (
    <Section title="Clock‑In Hub" actions={
      <button onClick={toggleCheck}
        style={{background: checkedIn ? BRAND.orange : BRAND.jungle, color: BRAND.white}}
        className="btn px-5 py-2.5 shadow hover:opacity-95 font-body">
        {checkedIn ? "Check‑Out" : "Check‑In"}
      </button>
    }>
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label={`Current Time (${user.country})`} value={nowStr} hint={user.timeZone} />
        <StatCard label="Status" value={checkedIn ? (state.late? "Late (In)" : "On Time") : "Not Checked‑In"} hint={state.timeIn ? new Date(state.timeIn).toLocaleTimeString() : "—"} />
        <StatCard label="Breaks Today" value={`${state.breakMin} min`} />
        <StatCard label="Utilisation" value={`${state.util}%`} progress={state.util} />
      </div>
      <div className="mt-5 pill p-4" style={{background: BRAND.beige, color: BRAND.jungle}}>
        <div className="font-display-medium">Tip</div>
        <div className="text-sm opacity-90">
          You are marked <b>Late</b> if you check‑in after <b>{user.shiftStart}{user.graceMin? `+${user.graceMin}m` : ''}</b> local to your timezone ({user.timeZone}).<br/>
          You are <b>On‑time</b> if you check‑in <b>before</b> that threshold.
        </div>
      </div>
    </Section>
  );
}

// --- Employee: Work Timer ---
function WorkTimer({ user, state, setState, projects }){
  const [active, setActive] = useState(null);
  const [task, setTask] = useState("Design");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => { if (!active) return; const t = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(t); }, [active]);

  const start = () => { if (!active) setActive({ started: new Date().toISOString(), project: projects[0].code, task }); };
  const stop  = () => { if (active) { setActive(null); setElapsed(0); } };
  const takeBreak = () => setState(s => ({...s, breakMin: s.breakMin + 15}));

  return (
    <Section title="Work Timer">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bevel-card p-5">
          <div className="text-sm opacity-70 mb-1 font-body">Project</div>
          <select className="w-full border pill p-3 font-body" value={active?.project ?? projects[0].code}
            onChange={e => setActive(a => a? {...a, project: e.target.value} : { started: new Date().toISOString(), project: e.target.value, task })}>
            {projects.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
          </select>
          <div className="text-sm opacity-70 mt-3 mb-1 font-body">Task Type</div>
          <select className="w-full border pill p-3 font-body" value={task} onChange={e => setTask(e.target.value)}>
            {["Design","CAD","RFI","Review","Admin"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex gap-2 mt-4">
            <button onClick={start} style={{background: BRAND.jungle, color: BRAND.white}} className="btn px-4 py-2 shadow font-body">Start</button>
