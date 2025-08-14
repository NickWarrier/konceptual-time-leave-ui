import React, { useMemo, useState, useEffect } from "react";

// Konceptual Time & Leave — Frontend Prototype
// Brand implementation from Brandbook 2025
// Colors: Jungle Green #0D3036, Vivid Orange #FF5C01, Beige White #F0F6E0, Black #000000, White #FFFFFF
// Headings: Sherika (Bold/Medium). Body: Helvetica Neue Regular (with fallbacks).

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
  soft: "0 2px 12px rgba(0,0,0,.06)",
};

// Inject minimal global styles for typography
function BrandTypography() {
  return (
    <style>{`
      :root{
        --brand-jungle: ${BRAND.jungle};
        --brand-orange: ${BRAND.orange};
        --brand-beige: ${BRAND.beige};
      }
      .font-display{ font-family: Sherika, "Helvetica Neue", Arial, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-weight: 700; letter-spacing: -0.01em; }
      .font-display-medium{ font-family: Sherika, "Helvetica Neue", Arial, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; font-weight: 600; letter-spacing: -0.01em; }
      .font-body{ font-family: "Helvetica Neue", Arial, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
      .bevel-card{ border-radius: 1rem; box-shadow: ${shadow.card}; background: ${BRAND.white}; }
      .pill{ border-radius: 0.75rem; }
      .btn{ border-radius: 0.75rem; font-weight: 700; }
    `}</style>
  );
}

function Header({ role, onRoleChange }) {
  return (
    <header style={{
      background: `linear-gradient(120deg, ${BRAND.jungle}, ${BRAND.jungle600})`,
      color: BRAND.white,
      boxShadow: shadow.card,
    }} className="sticky top-0 z-30 font-body">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{background: BRAND.orange}} className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl">K</div>
          <div>
            <div className="font-display text-xl">Konceptual</div>
            <div className="opacity-85 text-sm">Engineering Excellence From Ground Up</div>
          </div>
        </div>
        <RoleSwitch role={role} onChange={onRoleChange} />
      </div>
    </header>
  );
}

function RoleSwitch({ role, onChange }) {
  const roles = ["Employee", "Manager", "Admin"];
  return (
    <div className="flex items-center pill p-1" style={{background: "rgba(255,255,255,0.12)"}}>
      {roles.map(r => (
        <button key={r}
          onClick={() => onChange(r)}
          style={{
            background: role===r ? BRAND.beige : "transparent",
            color: role===r ? BRAND.jungle : BRAND.white,
          }}
          className={`px-3 py-1.5 pill text-sm font-body font-semibold transition-all`}>{r}</button>
      ))}
    </div>
  );
}

function TabBar({ tabs, active, onSelect }) {
  return (
    <nav className="max-w-7xl mx-auto px-5 pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-body">
      {tabs.map(t => (
        <button key={t.key}
          onClick={() => onSelect(t.key)}
          style={{
            borderColor: active===t.key ? BRAND.orange : "transparent",
            background: active===t.key ? BRAND.beige : BRAND.white,
          }}
          className="pill border-2 p-3 text-left shadow-sm hover:shadow-md transition-all">
          <div className="text-xs opacity-70">{t.section}</div>
          <div className="font-display-medium">{t.label}</div>
        </button>
      ))}
    </nav>
  );
}

function StatCard({ label, value, hint, progress, accent="jungle" }) {
  const bar = accent==="orange" ? BRAND.orange : BRAND.jungle;
  return (
    <div className="bevel-card p-5 font-body">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-2xl md:text-3xl font-display">{value}</div>
      {hint && <div className="text-xs opacity-70 mt-1">{hint}</div>}
      {typeof progress === "number" && (
        <div className="mt-3">
          <div className="h-2 w-full pill" style={{background: "#E5E7EB"}} />
          <div className="-mt-2 h-2 pill" style={{width: `${Math.min(100, Math.max(0, progress))}%`, background: bar}} />
        </div>
      )}
    </div>
  );
}

function Section({ title, children, actions }) {
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

// --- Sample data (placeholder) ---
const sampleProjects = [
  { code: "01-MEL-01-0007", name: "Factory Retaining Walls", client: "RWS", hours: 126 },
  { code: "01-SYD-01-0032", name: "Sunset Sleepers Custom", client: "SSP", hours: 76 },
  { code: "01-MEL-01-0019", name: "Keystone POS Connection R&D", client: "KST", hours: 48 },
];

const sampleEmployees = [
  { id: "E1001", name: "Rizwan", rate: 55, country: "AU", manager: "Nick" },
  { id: "E1002", name: "Hira", rate: 45, country: "PK", manager: "Nick" },
  { id: "E1003", name: "Miguel", rate: 65, country: "AU", manager: "Nick" },
];

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
}

// --- Employee: Clock-In Hub ---
function ClockInHub({ state, setState }) {
  const now = useClock();
  const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 5);
  const checkedIn = !!state.timeIn && !state.timeOut;

  const toggleCheck = () => {
    if (!checkedIn) setState(s => ({...s, timeIn: new Date(), late: isLate}));
    else setState(s => ({...s, timeOut: new Date()}));
  };

  return (
    <Section title="Clock-In Hub" actions={
      <button onClick={toggleCheck}
        style={{background: checkedIn ? BRAND.orange : BRAND.jungle, color: BRAND.white}}
        className="btn px-5 py-2.5 shadow hover:opacity-95 font-body">
        {checkedIn ? "Check-Out" : "Check-In"}
      </button>
    }>
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="Current Time" value={now.toLocaleTimeString()} hint={now.toDateString()} />
        <StatCard label="Status" value={checkedIn ? (state.late? "Late (In)" : "On Time") : "Not Checked-In"} hint={state.timeIn ? new Date(state.timeIn).toLocaleTimeString() : "—"} />
        <StatCard label="Breaks Today" value={`${state.breakMin} min`} />
        <StatCard label="Utilisation" value={`${state.util}%`} progress={state.util} />
      </div>
      <div className="mt-5 pill p-4" style={{background: BRAND.beige, color: BRAND.jungle}}>
        <div className="font-display-medium">Tip</div>
        <div className="text-sm opacity-90">You are marked <b>{isLate? "Late" : "On-time"}</b> if check-in after <b>08:05</b> local.</div>
      </div>
    </Section>
  );
}

// --- Employee: Work Timer ---
function WorkTimer({ state, setState, projects }) {
  const [active, setActive] = useState(null);
  const [task, setTask] = useState("Design");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [active]);

  const start = () => { if (!active) setActive({ started: new Date(), project: projects[0].code, task }); };
  const stop  = () => { if (active) { setActive(null); setElapsed(0); } };
  const takeBreak = () => setState(s => ({...s, breakMin: s.breakMin + 15}));

  return (
    <Section title="Work Timer">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bevel-card p-5">
          <div className="text-sm opacity-70 mb-1 font-body">Project</div>
          <select className="w-full border pill p-3 font-body" value={active?.project ?? projects[0].code}
            onChange={e => setActive(a => a? {...a, project: e.target.value} : { started: new Date(), project: e.target.value, task })}>
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

function fmt(sec){
  const h = Math.floor(sec/3600).toString().padStart(2,'0');
  const m = Math.floor((sec%3600)/60).toString().padStart(2,'0');
  const s = Math.floor(sec%60).toString().padStart(2,'0');
  return `${h}:${m}:${s}`;
}

function MiniBarChart({ data }){
  const max = Math.max(...data.map(d=>d.value));
  return (
    <div className="space-y-2 font-body">
      {data.map(d => (
        <div key={d.label}>
          <div className="text-xs opacity-70 mb-1 flex justify-between"><span>{d.label}</span><span>{d.value.toFixed(1)}h</span></div>
          <div className="h-2 w-full pill" style={{background: "#E5E7EB"}}/>
          <div className="-mt-2 h-2 pill" style={{width: `${(d.value/max)*100}%`, background: BRAND.jungle}}/>
        </div>
      ))}
    </div>
  );
}

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
          <label className="flex items-center gap-2 mt-3 text-sm font-body"><input type="checkbox" checked={form.cashout} onChange={e=>setForm({...form, cashout:e.target.checked})} /> Cash-out if over balance</label>
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

function calcDays(start, end){
  const s = new Date(start), e = new Date(end);
  const ms = e - s; if (ms < 0) return 0;
  return Math.round(ms / (1000*60*60*24)) + 1;
}

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
          <MiniBarChart data={sampleProjects.map(p=>({ label: p.client, value: Math.max(1, Math.round(p.hours/10)/10) }))} />
        </div>
        <div className="bevel-card p-5">
          <div className="font-display-medium mb-2">Top Contributors</div>
          <ul className="space-y-2 text-sm font-body">
            {sampleEmployees.map(e => (
              <li key={e.id} className="flex items-center justify-between border-b pb-2">
                <span className="font-display-medium">{e.name}</span>
                <span className="opacity-70">Util: {80 + Math.floor(Math.random()*15)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bevel-card p-5">
          <div className="font-display-medium mb-2">Attendance Today</div>
          <ul className="space-y-2 text-sm font-body">
            {sampleEmployees.map(e => (
              <li key={e.id} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 pill" style={{background: Math.random()>.15? BRAND.jungle : BRAND.orange}}></span>
                <span className="font-display-medium">{e.name}</span>
                <span className="opacity-60 ml-auto">{Math.random()>.15? "On-site" : "Late"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

// --- Admin Panels ---
function ProjectsAdmin(){
  const [list, setList] = useState(sampleProjects);
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

function EmployeesAdmin(){
  return (
    <Section title="Employees">
      <table className="w-full text-sm bevel-card font-body">
        <thead>
          <tr className="text-left opacity-70">
            <th className="py-2 pl-5">ID</th><th>Name</th><th>Rate</th><th>Country</th><th>Manager</th>
          </tr>
        </thead>
        <tbody>
          {sampleEmployees.map(e => (
            <tr key={e.id} className="border-t">
              <td className="py-2 pl-5">{e.id}</td><td>{e.name}</td><td>${e.rate}/h</td><td>{e.country}</td><td>{e.manager}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

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

export default function App(){
  const [role, setRole] = useState("Employee");
  const [tab, setTab] = useState("emp.dashboard");
  const [empState, setEmpState] = useState({ timeIn: null, timeOut: null, breakMin: 0, late: false, util: 82 });

  const tabs = useMemo(() => {
    if(role === 'Employee') return [
      { key: 'emp.dashboard', label: 'My Dashboard', section: 'Employee' },
      { key: 'emp.clock',     label: 'Clock-In Hub', section: 'Employee' },
      { key: 'emp.timer',     label: 'Work Timer',   section: 'Employee' },
      { key: 'emp.leave',     label: 'Leave',        section: 'Employee' },
    ];
    if(role === 'Manager') return [
      { key: 'mgr.team',      label: 'Team Dashboard', section: 'Manager' },
      { key: 'mgr.approvals', label: 'Timesheet Approvals', section: 'Manager' },
      { key: 'emp.leave',     label: 'My Leave', section: 'Employee' },
    ];
    return [
      { key: 'adm.projects',  label: 'Projects', section: 'Admin' },
      { key: 'adm.emps',      label: 'Employees', section: 'Admin' },
      { key: 'mgr.team',      label: 'Team Dashboard', section: 'Manager' },
      { key: 'mgr.approvals', label: 'Approvals', section: 'Manager' },
    ];
  }, [role]);

  useEffect(()=>{ setTab(tabs[0].key); }, [role]);

  return (
    <div className="font-body" style={{background: BRAND.beige, minHeight: '100vh', color: BRAND.jungle}}>
      <BrandTypography />
      <Header role={role} onRoleChange={setRole} />
      <TabBar tabs={tabs} active={tab} onSelect={setTab} />

      {tab === 'emp.dashboard' && (
        <Section title="My Dashboard">
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard label="This Week" value="37.8 h" hint="Mon-Thu" progress={89} />
            <StatCard label="Utilisation" value="82%" progress={82} />
            <StatCard label="Breaks (avg)" value="38 m" />
            <StatCard label="Late (week)" value="1" accent="orange" />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bevel-card p-5">
              <div className="font-display-medium mb-2">My Projects</div>
              <ul className="text-sm divide-y font-body">
                {sampleProjects.map(p => (
                  <li key={p.code} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-display-medium">{p.name}</div>
                      <div className="opacity-70 text-xs">{p.code} • {p.client}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display-medium">{p.hours} h</div>
                      <div className="opacity-70 text-xs">month-to-date</div>
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
                <li>Project <b>01-SYD-01-0032</b> nearing budget.</li>
              </ul>
            </div>
          </div>
        </Section>
      )}

      {tab === 'emp.clock'   && <ClockInHub state={empState} setState={setEmpState} />}
      {tab === 'emp.timer'   && <WorkTimer state={empState} setState={setEmpState} projects={sampleProjects} />}
      {tab === 'emp.leave'   && <LeaveHub />}
      {tab === 'mgr.team'    && <TeamDashboard />}
      {tab === 'mgr.approvals' && <Approvals />}
      {tab === 'adm.projects' && <ProjectsAdmin />}
      {tab === 'adm.emps'    && <EmployeesAdmin />}

      <footer className="max-w-7xl mx-auto px-5 py-10 text-sm opacity-80 font-body">
        UI uses brand colors & typography per Brandbook 2025. In production, connect to SharePoint, Power Automate, and Power BI.
      </footer>
    </div>
  );
}
