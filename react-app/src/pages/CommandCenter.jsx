import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';

export default function CommandCenter({ user, initialImei }) {
  const [devices, setDevices] = useState([]);
  const [activeImei, setActiveImei] = useState(null);

  const [eventCount, setEventCount] = useState(0);
  const [lastPacketAt, setLastPacketAt] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [pulseLive, setPulseLive] = useState(false);
  const [connectionText, setConnectionText] = useState('Connecting to stream…');
  const [streamState, setStreamState] = useState('Establishing SSH tail');

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const seenPacketIds = useRef(new Set());
  const activeSSE = useRef(null);
  const terminalRef = useRef(null);

  const [telemetry, setTelemetry] = useState({});

  useEffect(() => {
    loadDevices();
    return () => {
      if (activeSSE.current) {
        activeSSE.current.close();
      }
    };
  }, []);

  const loadDevices = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/device/all-last-locations`);
      const data = await res.json();

      if (data && data.status && data.result && data.result.length > 0) {
        const imeiList = data.result.map(d => d.imei).filter(Boolean);
        const uniqueImeis = [...new Set(imeiList)];

        if (initialImei) {
          setDevices([initialImei]);
          switchDevice(initialImei);
        } else {
          setDevices(uniqueImeis);
          if (uniqueImeis.length > 0) {
            switchDevice(uniqueImeis[0]);
          }
        }
      } else if (initialImei) {
        setDevices([initialImei]);
        switchDevice(initialImei);
      }
    } catch (err) {
      console.error("Failed to load devices", err);
      if (initialImei) {
        setDevices([initialImei]);
        switchDevice(initialImei);
      }
    }
  };

  const switchDevice = async (imei) => {
    // Hardware logs typically don't have leading zeros, but DB might
    let cleanImei = imei || '';
    if (cleanImei.startsWith('0')) {
      cleanImei = cleanImei.replace(/^0+/, '');
    }

    if (activeSSE.current) {
      activeSSE.current.close();
      activeSSE.current = null;
    }
    setActiveImei(imei);
    setEvents([]);
    setEventCount(0);
    seenPacketIds.current = new Set();
    setLastPacketAt(null);
    setPulseLive(false);
    setConnectionText('Switching device…');
    setTelemetry({});
    setSelectedEvent(null);

    await loadHistory(cleanImei);
    startSSE(cleanImei);
  };

  const enrichEvent = (ev) => {
    if (ev.raw && typeof ev.raw === 'string') {
      const accMatch = ev.raw.match(/ACC:\s*(ON|OFF|HIGH|LOW)/i);
      if (accMatch && !ev.acc) ev.acc = accMatch[1].toUpperCase();

      const voltMatch = ev.raw.match(/Voltage:\s*([\d\.\/]+)/i);
      if (voltMatch && !ev.voltage) ev.voltage = voltMatch[1];
      
      const voltLevelMatch = ev.raw.match(/Voltage:\s*(\d+)\/6/i);
      if (voltLevelMatch && ev.battery_level == null) ev.battery_level = parseInt(voltLevelMatch[1], 10);

      const alarmMatch = ev.raw.match(/Alarm(?: Type)?:\s*([a-zA-Z0-9_ \-]+)/i);
      if (alarmMatch && !ev.alarm) ev.alarm = alarmMatch[1].trim();

      const latMatch = ev.raw.match(/Lat:\s*([-\d\.]+)/i);
      if (latMatch && ev.latitude == null) ev.latitude = parseFloat(latMatch[1]);
      
      const lngMatch = ev.raw.match(/Lng:\s*([-\d\.]+)/i);
      if (lngMatch && ev.longitude == null) ev.longitude = parseFloat(lngMatch[1]);

      const speedMatch = ev.raw.match(/Speed:\s*([\d\.]+)/i);
      if (speedMatch && ev.speed == null) ev.speed = parseFloat(speedMatch[1]);
      
      const hwAlarmMatch = ev.raw.match(/HWAlarm:\s*([a-zA-Z0-9_]+)/i);
      if (hwAlarmMatch && !ev.hw_alarm) ev.hw_alarm = hwAlarmMatch[1];
      
      const extPowerMatch = ev.raw.match(/External Power:\s*([a-zA-Z0-9_]+)/i);
      if (extPowerMatch && !ev.external_power) ev.external_power = extPowerMatch[1].toUpperCase();

      const gpsMatch = ev.raw.match(/GPS:\s*([a-zA-Z0-9_]+)/i);
      if (gpsMatch && !ev.gps_tracking) ev.gps_tracking = gpsMatch[1].toUpperCase();

      const oilMatch = ev.raw.match(/Oil:\s*([a-zA-Z0-9_]+)/i);
      if (oilMatch && !ev.oil_elec) ev.oil_elec = oilMatch[1].toUpperCase();

      const actMatch = ev.raw.match(/Activated:\s*([a-zA-Z0-9_]+)/i);
      if (actMatch && !ev.activated) ev.activated = actMatch[1].toUpperCase();

      const gsmMatch = ev.raw.match(/GSM:\s*([\d\.\/]+)/i);
      if (gsmMatch && !ev.gsm_signal) ev.gsm_signal = gsmMatch[1];
    }
    return ev;
  };

  const loadHistory = async (imei) => {
    try {
      const response = await fetch(`${BASE_URL}/api/command-center/history?imei=${imei}&t=${Date.now()}`);
      const payload = await response.json();
      const histEvents = Array.isArray(payload) ? payload : (payload.events || []);

      const newEvents = [];
      histEvents.forEach(ev => {
        if (ev.id != null && !seenPacketIds.current.has(ev.id)) {
          seenPacketIds.current.add(ev.id);
          newEvents.push(enrichEvent(ev));
        }
      });
      if (newEvents.length > 0) {
        setEvents(newEvents.slice(-300));
        setEventCount(newEvents.length);
        newEvents.forEach(ev => updateTelemetry(ev));
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const ingest = (rawEvent) => {
    if (rawEvent.id != null && seenPacketIds.current.has(rawEvent.id)) return;
    if (rawEvent.id != null) seenPacketIds.current.add(rawEvent.id);

    const event = enrichEvent(rawEvent);

    setEvents(prev => {
      const updated = [...prev, event];
      if (updated.length > 300) updated.shift();
      return updated;
    });
    setEventCount(prev => prev + 1);
    setLastPacketAt(Date.now());

    updateTelemetry(event);
  };

  const updateTelemetry = (event) => {
    setTelemetry(prev => {
      let next = { ...prev };
      
      if (event.latitude != null) next.latitude = event.latitude;
      if (event.longitude != null) next.longitude = event.longitude;
      if (event.speed != null) next.speed = event.speed;
      
      if (event.acc) next.acc = event.acc;
      if (event.external_power && event.external_power !== 'Unknown') next.external_power = event.external_power;
      if (event.battery_level != null) next.battery_level = event.battery_level;
      if (event.battery_status) next.battery_status = event.battery_status;
      if (event.voltage) next.voltage = event.voltage;
      if (event.alarm) next.alarm = event.alarm;
      if (event.hw_alarm && event.hw_alarm !== 'Unknown') next.hw_alarm = event.hw_alarm;
      if (event.gps_tracking && event.gps_tracking !== 'Unknown') next.gps_tracking = event.gps_tracking;
      if (event.oil_elec && event.oil_elec !== 'Unknown') next.oil_elec = event.oil_elec;
      if (event.activated && event.activated !== 'Unknown') next.activated = event.activated;
      if (event.gsm_signal && event.gsm_signal !== 'Unknown') next.gsm_signal = event.gsm_signal;
      if (event.remote_ip) {
        next.remote_ip = event.remote_ip;
        next.remote_port = event.remote_port;
      }
      return next;
    });
  };

  const startSSE = (imei) => {
    const source = new EventSource(`${BASE_URL}/api/command-center/events?imei=${imei}`);
    activeSSE.current = source;
    source.onopen = () => {
      setConnectionText('Live stream active');
      setStreamState('SSE connection established');
      setPulseLive(true);
    };
    source.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.imei === imei || !payload.imei) ingest(payload);
      } catch (err) { }
    };
    source.onerror = () => {
      setPulseLive(false);
      setConnectionText('Stream disconnected, retrying…');
      setStreamState('SSE reconnect in progress');
      source.close();
      if (activeSSE.current === source) {
        setTimeout(() => startSSE(imei), 2000);
      }
    };
  };

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  const packetNames = {
    location: 'Location / GPS', status: 'Heartbeat / status', login: 'Login',
    iccid: 'ICCID information', raw: 'Unclassified log'
  };

  const sendCommand = async (action) => {
    if (action.startsWith('cut-')) {
      const target = action === 'cut-engine' ? 'fuel/engine' : action.replace('cut-', '');
      const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to CUT the vehicle ${target}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/command-center/control/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imei: activeImei })
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire(data.message || `${action} command sent successfully!`);
      } else {
        Swal.fire("Error: " + (data.error || `Failed to ${action}`));
      }
    } catch (err) {
      Swal.fire("Network Error: " + err.message);
    }
  };

  const [freshnessWidth, setFreshnessWidth] = useState(0);
  const [lastSeenText, setLastSeenText] = useState('Waiting for packet');

  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastPacketAt) return;
      const age = Math.floor((Date.now() - lastPacketAt) / 1000);
      setLastSeenText(age < 2 ? 'now' : `${age}s ago`);
      setFreshnessWidth(Math.max(0, 100 - age * 2));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastPacketAt]);

  const ignitionHigh = telemetry.acc === 'ON';
  const onExternalPower = telemetry.external_power === 'CONNECTED';
  const gpsOn = telemetry.gps_tracking === 'ON';
  const relayConn = telemetry.oil_elec === 'CONNECTED';
  const isActivated = telemetry.activated === 'YES';

  let sig = parseInt(telemetry.gsm_signal?.split('/')[0]);
  if (isNaN(sig)) sig = undefined;

  let signalQuality = "Signal strength";
  if (sig === 4) signalQuality = "Excellent signal";
  else if (sig === 3) signalQuality = "Good signal";
  else if (sig === 2) signalQuality = "Fair signal";
  else if (sig === 1) signalQuality = "Weak signal";
  else if (sig === 0) signalQuality = "No signal";

  return (
    <div className="command-center-container">
      <style>{`
        .command-center-container {
          --ink: oklch(0.92 0.012 82);
          --muted: oklch(0.67 0.018 82);
          --faint: oklch(0.48 0.014 82);
          --base: oklch(0.145 0.012 82);
          --surface: oklch(0.19 0.014 82);
          --raised: oklch(0.235 0.016 82);
          --line: oklch(0.34 0.018 82);
          --amber: oklch(0.79 0.14 77);
          --green: oklch(0.78 0.15 145);
          --red: oklch(0.68 0.17 28);
          --space-xs: 4px; --space-sm: 8px; --space-md: 12px;
          --space-lg: 16px; --space-xl: 24px; --space-2xl: 32px;
          --space-3xl: 48px;

          min-height: calc(100vh - 64px);
          color: var(--ink); 
          background: var(--base);
          font-family: Aptos, "Segoe UI Variable", sans-serif;
          background-image: linear-gradient(oklch(0.2 0.012 82 / .3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.2 0.012 82 / .3) 1px, transparent 1px);
          background-size: 32px 32px;
          padding: 0;
          margin: ${initialImei ? '0' : '-24px'}; /* offset the admin panel padding */
          flex: 1;
          overflow-y: auto;
          width: 100%;
        }
        
        .cc-shell {
          width: min(1500px, 100%);
          margin: 0 auto;
          padding: var(--space-xl);
        }

        .cc-header {
          min-height: 92px; display: flex; align-items: center; justify-content: space-between;
          gap: var(--space-xl); border-bottom: 1px solid var(--line);
        }
        .cc-identity { display: flex; align-items: center; gap: var(--space-lg); }
        .cc-mark { width: 34px; height: 34px; position: relative; border: 1px solid var(--primary); transform: rotate(45deg); }
        .cc-mark::after { content: ""; position: absolute; inset: 9px; background: var(--primary); }
        .cc-h1 { margin: 0; font: 650 1.5rem/1 Bahnschrift, "Arial Narrow", sans-serif; letter-spacing: .025em; color: var(--primary); }
        .cc-eyebrow { color: var(--text-muted); font-size: .72rem; letter-spacing: .16em; text-transform: uppercase; margin-bottom: 7px; font-weight: 700; }
        .cc-connection { display: flex; align-items: center; gap: var(--space-md); color: var(--muted); font-size: .84rem; }
        .cc-pulse { width: 9px; height: 9px; border-radius: 50%; background: var(--red); }
        .cc-pulse.live { background: var(--green); animation: breathe 2s ease-in-out infinite; }
        @keyframes breathe { 50% { opacity: .35; transform: scale(.82); } }
        
        .cc-context { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(300px, .55fr); gap: var(--space-2xl); padding: var(--space-3xl) 0 var(--space-2xl); }
        .cc-device-id { color: var(--muted); font-size: .78rem; letter-spacing: .1em; text-transform: uppercase; }
        .cc-device-id strong { display: block; color: var(--ink); margin-top: var(--space-sm); font: 650 clamp(1.9rem, 5vw, 4rem)/.95 Bahnschrift, "Arial Narrow", sans-serif; letter-spacing: .035em; }
        .cc-freshness { align-self: end; display: grid; gap: var(--space-sm); }
        .cc-freshness-row { display: flex; justify-content: space-between; gap: var(--space-md); font-size: .8rem; color: var(--muted); }
        .cc-freshness-track { height: 4px; background: var(--raised); overflow: hidden; }
        .cc-freshness-track span { display: block; width: 0; height: 100%; background: var(--amber); transition: width .45s cubic-bezier(.22,1,.36,1); }
        
        .cc-telemetry { display: grid; grid-template-columns: repeat(10, 1fr); border: 1px solid var(--line); background: var(--surface); }
        .cc-metric { min-height: 150px; padding: var(--space-xl); border-bottom: 1px solid var(--line); border-inline-end: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between; }
        .cc-metric.location { grid-column: span 10; }
        .cc-metric.small { grid-column: span 2; }
        .cc-metric:nth-last-child(-n+4) { border-bottom: 0; }
        .cc-label { color: var(--muted); font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; }
        .cc-value { font: 620 2.25rem/1 Bahnschrift, "Arial Narrow", sans-serif; letter-spacing: .01em; color: var(--ink); }
        .cc-value.coords { font-size: clamp(1.65rem, 3vw, 2.7rem); }
        .cc-value.text-val { font-size: clamp(1.25rem, 2.2vw, 1.65rem); }
        .cc-unit { color: var(--faint); font-size: .9rem; margin-left: 5px; }
        .cc-sub { color: var(--muted); font-size: .8rem; }
        .cc-green { color: var(--green); } .cc-amber { color: var(--amber); }
        
        .cc-workbench { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: var(--space-2xl); padding-top: var(--space-2xl); }
        .cc-section-head { display: flex; align-items: end; justify-content: space-between; gap: var(--space-lg); margin-bottom: var(--space-lg); }
        .cc-h2 { font: 600 1.15rem/1 Bahnschrift, "Arial Narrow", sans-serif; margin: 0; letter-spacing: .04em; color: var(--ink); }
        .cc-count { color: var(--faint); font-size: .74rem; }
        
        .cc-terminal { height: 390px; overflow: auto; background: oklch(0.115 0.009 82); border: 1px solid var(--line); padding: var(--space-lg); scrollbar-color: var(--line) transparent; }
        .cc-line { display: grid; grid-template-columns: 74px 80px minmax(0,1fr); gap: var(--space-md); padding: 7px 0; border-bottom: 1px solid oklch(0.25 0.012 82 / .55); font-family: Consolas, "Cascadia Code", monospace; font-size: .76rem; line-height: 1.55; cursor: pointer; transition: background .18s ease-out, color .18s ease-out; }
        .cc-line:last-child { border-bottom: 0; }
        .cc-line:hover, .cc-line.selected { background: var(--raised); }
        .cc-time { color: var(--faint); } .cc-kind { color: var(--amber); text-transform: uppercase; } .cc-raw { color: oklch(0.79 0.012 82); overflow-wrap: anywhere; }
        
        .cc-tools { display: flex; flex-direction: column; gap: var(--space-xl); }
        .cc-tool-group { border-top: 1px solid var(--line); padding-top: var(--space-lg); display: grid; gap: var(--space-md); }
        .cc-tool-group:first-child { border-top: 0; padding-top: 0; }
        .cc-tool-label { color: var(--muted); font-size: .72rem; letter-spacing: .13em; text-transform: uppercase; }
        .cc-tool-value { font: 520 .94rem/1.45 Bahnschrift, "Arial Narrow", sans-serif; word-break: break-all; color: var(--ink); }
        
        .cc-inspector { grid-column: 1 / -1; border: 1px solid var(--line); background: var(--surface); margin-top: var(--space-xl); }
        .cc-inspector-head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-lg); padding: var(--space-lg) var(--space-xl); border-bottom: 1px solid var(--line); }
        .cc-packet-type { color: var(--amber); font-size: .75rem; letter-spacing: .13em; text-transform: uppercase; }
        .cc-packet-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); margin: 0; }
        .cc-packet-field { min-height: 88px; padding: var(--space-lg) var(--space-xl); border-bottom: 1px solid var(--line); border-inline-end: 1px solid var(--line); }
        .cc-packet-field dt { color: var(--faint); font-size: .69rem; letter-spacing: .11em; text-transform: uppercase; }
        .cc-packet-field dd { margin: var(--space-sm) 0 0; color: var(--ink); font: 520 .92rem/1.4 Bahnschrift, "Arial Narrow", sans-serif; word-break: break-word; }
        .cc-packet-raw { padding: var(--space-lg) var(--space-xl); color: var(--muted); font-family: Consolas, "Cascadia Code", monospace; font-size: .76rem; line-height: 1.65; overflow-wrap: anywhere; }
        
        .cc-actions { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
        .cc-button { color: var(--ink); background: transparent; border: 1px solid var(--line); padding: 9px 12px; cursor: pointer; transition: border-color .18s, color .18s, background .18s; font-family: inherit; font-size: 13px; }
        .cc-button:hover { border-color: var(--amber); color: var(--amber); }
        .cc-button.active { background: var(--amber); border-color: var(--amber); color: var(--base); }
        
        .cc-device-select { display: flex; align-items: center; }
        .cc-select { font: 580 .85rem/1 Bahnschrift, "Arial Narrow", sans-serif; letter-spacing: .05em; color: var(--ink); background: var(--surface); border: 1px solid var(--line); padding: 8px 12px; cursor: pointer; border-radius: 4px; outline: none; transition: border-color .18s; }
        .cc-select:focus { border-color: var(--amber); }
        .cc-select option { background: var(--surface); color: var(--ink); }
        
        @media (max-width: 900px) {
          .cc-context, .cc-workbench { grid-template-columns: 1fr; }
          .cc-metric.location { grid-column: span 10; }
          .cc-metric.small { grid-column: span 5; }
          .cc-metric:nth-last-child(-n+4) { border-bottom: 1px solid var(--line); }
          .cc-metric:nth-last-child(-n+2) { border-bottom: 0; }
          .cc-tools { display: grid; grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 580px) {
          .cc-shell { padding: var(--space-lg); }
          .cc-header { align-items: flex-start; padding: var(--space-lg) 0; flex-direction: column; }
          .cc-context { padding-top: var(--space-2xl); }
          .cc-metric.small { grid-column: span 10; min-height: 120px; border-inline-end: 0; }
          .cc-metric.location { border-inline-end: 0; }
          .cc-tools { grid-template-columns: 1fr; }
          .cc-line { grid-template-columns: 62px minmax(0,1fr); }
          .cc-line .cc-raw { grid-column: 1 / -1; }
        }
      `}</style>

      <div className="cc-shell">
        <div className="cc-header" style={{ background: 'transparent' }}>
          <div className="cc-identity">
            <div className="cc-mark" aria-hidden="true"></div>
            <div>
              <div className="cc-eyebrow">Trackify engineering</div>
              <h1 className="cc-h1">GPS Live Console</h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)', flexWrap: 'wrap' }}>
            <div className="cc-device-select">
              <select
                value={activeImei || ''}
                onChange={(e) => switchDevice(e.target.value)}
                className="cc-select"
              >
                {devices.length === 0 && <option value="" disabled>Loading devices...</option>}
                {devices.map(imei => (
                  <option key={imei} value={imei}>
                    {imei}
                  </option>
                ))}
              </select>
            </div>
            <div className="cc-connection">
              <span className={`cc-pulse ${pulseLive ? 'live' : ''}`}></span>
              <span>{connectionText}</span>
            </div>
          </div>
        </div>

        <section className="cc-context">
          <div className="cc-device-id">
            Active device
            <strong>{activeImei || '—'}</strong>
          </div>
          <div className="cc-freshness">
            <div className="cc-freshness-row">
              <span>Packet freshness</span>
              <span>{lastSeenText}</span>
            </div>
            <div className="cc-freshness-track">
              <span style={{ width: `${freshnessWidth}%` }}></span>
            </div>
          </div>
        </section>

        <section className="cc-telemetry" aria-label="Latest telemetry">
          <article className="cc-metric location">
            <span className="cc-label">Position</span>
            <div className="cc-value coords">
              {telemetry.latitude != null ? `${telemetry.latitude.toFixed(6)}, ${telemetry.longitude.toFixed(6)}` : '—, —'}
            </div>
            <span className="cc-sub">{telemetry.remote_ip ? `${telemetry.remote_ip}:${telemetry.remote_port}` : 'No live endpoint yet'}</span>
          </article>

          <article className="cc-metric small">
            <span className="cc-label">Speed</span>
            <div>
              <span className="cc-value">{telemetry.speed != null ? Number(telemetry.speed).toFixed(1) : '—'}</span>
              <span className="cc-unit">km/h</span>
            </div>
            <span className="cc-sub">Ground speed</span>
          </article>

          <article className="cc-metric small">
            <span className="cc-label">Ignition pin</span>
            <div className={`cc-value ${ignitionHigh ? 'cc-green' : 'cc-amber'}`}>
              {telemetry.acc === 'ON' ? 'HIGH' : (telemetry.acc === 'OFF' ? 'LOW' : '—')}
            </div>
            <span className="cc-sub">ACC {telemetry.acc || 'waiting'} · ignition {ignitionHigh ? 'ON' : 'OFF'}</span>
          </article>

          <article className="cc-metric small">
            <span className="cc-label">Power source</span>
            <div className={`cc-value text-val ${onExternalPower ? 'cc-green' : 'cc-amber'}`}>
              {onExternalPower ? 'Car Battery' : (telemetry.external_power ? 'Internal Battery' : '—')}
            </div>
            <span className="cc-sub">{onExternalPower ? 'Running on external vehicle power' : 'Running on backup internal battery'}</span>
          </article>

          <article className="cc-metric small">
            <span className="cc-label">Battery</span>
            <div className={`cc-value ${telemetry.battery_level >= 4 ? 'cc-green' : (telemetry.battery_level <= 2 ? 'cc-amber' : '')}`}>
              {telemetry.battery_level ?? telemetry.voltage ?? '—'}
            </div>
            <span className="cc-sub">{telemetry.battery_status ? `L57 level · ${telemetry.battery_status}` : 'L57 level · waiting'}</span>
          </article>

          <article className="cc-metric small">
            <span className="cc-label">Alarm</span>
            <div className={`cc-value ${telemetry.alarm === 'None' ? 'cc-green' : 'cc-amber'}`}>
              {telemetry.alarm || '—'}
            </div>
            <span className="cc-sub">Latest device state</span>
          </article>

          <article className="cc-metric small">
            <span className="cc-label">HW Alarm</span>
            <div className={`cc-value ${telemetry.hw_alarm === 'Normal' ? 'cc-green' : 'cc-amber'}`}>
              {telemetry.hw_alarm || '—'}
            </div>
            <span className="cc-sub">Hardware alert</span>
          </article>

          <article className="cc-metric small">
            <span className="cc-label">GPS Engine</span>
            <div className={`cc-value ${gpsOn ? 'cc-green' : 'cc-amber'}`}>
              {gpsOn ? 'ON' : (telemetry.gps_tracking ? 'OFF' : '—')}
            </div>
            <span className="cc-sub">{gpsOn ? 'GPS tracking is active' : 'GPS tracking is inactive'}</span>
          </article>

          <article className="cc-metric small">
            <span className="cc-label">Relay</span>
            <div className={`cc-value ${relayConn ? 'cc-green' : 'cc-amber'}`}>
              {relayConn ? 'CONN' : (telemetry.oil_elec ? 'CUT' : '—')}
            </div>
            <span className="cc-sub">{relayConn ? 'Oil/electricity normal' : 'Oil/electricity disconnected'}</span>
          </article>

          <article className="cc-metric small">
            <span className="cc-label">Activated</span>
            <div className={`cc-value ${isActivated ? 'cc-green' : 'cc-amber'}`}>
              {isActivated ? 'YES' : (telemetry.activated ? 'NO' : '—')}
            </div>
            <span className="cc-sub">Terminal state</span>
          </article>

          <article className="cc-metric small">
            <span className="cc-label">GSM Signal</span>
            <div>
              <span className={`cc-value ${sig >= 3 ? 'cc-green' : (sig < 2 ? 'cc-amber' : '')}`}>
                {sig != null ? sig : (telemetry.gsm_signal?.split('/')[0] || '—')}
              </span>
              <span className="cc-unit">/4</span>
            </div>
            <span className="cc-sub">{signalQuality}</span>
          </article>
        </section>

        <section className="cc-workbench">
          <div>
            <div className="cc-section-head">
              <h2 className="cc-h2">Raw packet evidence</h2>
              <span className="cc-count">{eventCount} EVENTS</span>
            </div>
            <div className="cc-terminal" ref={terminalRef}>
              {events.map((ev, i) => (
                <div
                  key={ev.id || i}
                  className={`cc-line ${selectedEvent === ev ? 'selected' : ''}`}
                  onClick={() => setSelectedEvent(ev)}
                >
                  <span className="cc-time">{new Date((ev.received_at || Date.now() / 1000) * 1000).toLocaleTimeString([], { hour12: false })}</span>
                  <span className="cc-kind">{ev.kind || 'raw'}</span>
                  <span className="cc-raw">{ev.raw}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="cc-tools">
            <div className="cc-tool-group">
              <span className="cc-tool-label">Server</span>
              <span className="cc-tool-value">139.59.1.109:4000</span>
            </div>
            <div className="cc-tool-group">
              <span className="cc-tool-label">Stream</span>
              <span className="cc-tool-value">{streamState}</span>
            </div>
            <div className="cc-tool-group">
              <span className="cc-tool-label">Protocol</span>
              <span className="cc-tool-value">L57 · GPS/LBS + heartbeat</span>
            </div>
            <div className="cc-tool-group">
              <span className="cc-tool-label">View</span>
              <div className="cc-actions">
                <button className={`cc-button ${autoScroll ? 'active' : ''}`} onClick={() => setAutoScroll(!autoScroll)}>Auto-scroll</button>
                <button className="cc-button" onClick={() => { setEvents([]); setEventCount(0); setSelectedEvent(null); }}>Clear</button>
              </div>
            </div>
            <div className="cc-tool-group">
              <span className="cc-tool-label">Relay (Anti-Theft)</span>
              <div className="cc-actions" style={{ marginTop: '4px' }}>
                <button className="cc-button" onClick={() => sendCommand('cut-engine')} style={{ color: '#ef4444', borderColor: '#ef4444', fontWeight: 'bold' }}>Cut Fuel</button>
                <button className="cc-button" onClick={() => sendCommand('restore-engine')} style={{ color: '#10b981', borderColor: '#10b981', fontWeight: 'bold' }}>Restore Fuel</button>
              </div>
              <div className="cc-actions" style={{ marginTop: '4px' }}>
                <button className="cc-button" onClick={() => sendCommand('cut-power')} style={{ color: '#ef4444', borderColor: '#ef4444', fontWeight: 'bold' }}>Cut Power</button>
                <button className="cc-button" onClick={() => sendCommand('restore-power')} style={{ color: '#10b981', borderColor: '#10b981', fontWeight: 'bold' }}>Restore Power</button>
              </div>
            </div>
          </aside>

          <section className="cc-inspector">
            {(() => {
              const displayEvent = selectedEvent || (events.length > 0 ? events[events.length - 1] : null);
              return (
                <>
                  <div className="cc-inspector-head">
                    <h2 className="cc-h2">Packet inspector {selectedEvent ? '' : (displayEvent ? '(Auto-tracking latest)' : '')}</h2>
                    <span className="cc-packet-type">
                      {displayEvent ? packetNames[(displayEvent.kind || '').toLowerCase()] || displayEvent.kind : 'Select a packet'}
                    </span>
                  </div>
                  <dl className="cc-packet-fields">
                    {!displayEvent ? (
                <div className="cc-packet-field">
                  <dt>Tip</dt>
                  <dd>Click any row above to inspect its parsed L57 values.</dd>
                </div>
              ) : (
                [
                  ['IMEI', displayEvent.imei],
                  ['Category', packetNames[(displayEvent.kind || '').toLowerCase()] || displayEvent.kind],
                  ['Remote IP', displayEvent.remote_ip],
                  ['Remote port', displayEvent.remote_port],
                  ['Latitude', displayEvent.latitude],
                  ['Longitude', displayEvent.longitude],
                  ['Speed', displayEvent.speed != null ? `${displayEvent.speed} km/h` : null],
                  ['Ignition pin', displayEvent.acc ? `${displayEvent.acc === 'ON' ? 'HIGH' : 'LOW'} · ACC ${displayEvent.acc}` : null],
                  ['External power', displayEvent.external_power],
                  ['Power source', displayEvent.power_source],
                  ['Battery', displayEvent.battery_level != null ? `${displayEvent.battery_level}/6 · ${displayEvent.battery_status}` : displayEvent.voltage],
                  ['Alarm', displayEvent.alarm],
                  ['HW Alarm', displayEvent.hw_alarm],
                  ['GPS Tracking', displayEvent.gps_tracking],
                  ['Oil/Electricity', displayEvent.oil_elec],
                  ['Activated', displayEvent.activated],
                  ['GSM Signal', displayEvent.gsm_signal]
                ].filter(x => x[1] != null && x[1] !== 'Unknown' && x[1] !== '').map(([k, v]) => (
                  <div className="cc-packet-field" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))
              )}
            </dl>
            <div className="cc-packet-raw">
              {displayEvent ? displayEvent.raw : 'Raw packet information will appear here.'}
            </div>
            </>
            );
            })()}
          </section>
        </section>
      </div>
    </div>
  );
}
