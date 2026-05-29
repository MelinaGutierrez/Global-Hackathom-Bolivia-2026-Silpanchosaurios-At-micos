import { motion } from 'framer-motion'
import { Battery, Wifi, Route, AlertTriangle, Radio, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const INK   = '#0f172a'
const GREEN = '#16a34a'
const ink   = (o) => `rgba(15,23,42,${o})`

function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${ink(0.08)}`, borderRadius: 12, ...style }}>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color, pulse }) {
  return (
    <Card style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: 'Outfit', fontSize: 10, fontWeight: 600, color: ink(0.38), letterSpacing: '0.06em' }}>
          {label}
        </span>
        {pulse && (
          <motion.div style={{ width: 6, height: 6, borderRadius: '50%', background: color }}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <Icon size={13} style={{ color, flexShrink: 0, marginBottom: 2 }} />
        <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 24, color, lineHeight: 1 }}>{value}</span>
      </div>
      {sub && <div style={{ fontFamily: 'Outfit', fontSize: 11, color: ink(0.4), marginTop: 5 }}>{sub}</div>}
    </Card>
  )
}

const DIAGNOSTICS = [
  { label: 'Left Motor',   key: 'motor_l' },
  { label: 'Right Motor',  key: 'motor_r' },
  { label: 'LiDAR',        key: 'lidar'   },
  { label: 'GPS',          key: 'gps'     },
  { label: 'Soil Probe',   key: 'probe'   },
  { label: '4G Radio',     key: 'radio'   },
  { label: 'Camera',       key: 'camera'  },
  { label: 'IMU',          key: 'imu'     },
  { label: 'Temp Sensor',  key: 'temp'    },
  { label: 'Battery BMS',  key: 'bms'     },
]

export default function RoverMonitoring({ telemetry }) {
  const { rover } = telemetry
  const online    = rover.status === 'ONLINE'
  const battColor = rover.battery < 20 ? '#dc2626' : rover.battery < 50 ? '#d97706' : GREEN
  const sigColor  = rover.signal  < 40 ? '#dc2626' : rover.signal  < 70 ? '#d97706' : GREEN

  const diagOk = {
    motor_l: online, motor_r: online, lidar: online,
    gps:     online || rover.signal > 20,
    probe:   rover.failures === 0,
    radio:   rover.signal > 30,
    camera:  online, imu: online, temp: true,
    bms:     rover.battery > 5,
  }

  const signalHistory = Array.from({ length: 20 }, (_, i) => ({
    t: `${i * 3}s`,
    signal: Math.max(0, Math.min(100, rover.signal + (Math.random() - 0.5) * 18)),
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      style={{ height: '100%', padding: 14, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {/* Compact status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px', borderRadius: 10,
        background: '#fff', border: `1px solid ${ink(0.08)}`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '3px 10px', borderRadius: 20,
          background: online ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
          border: `1px solid ${online ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
        }}>
          <motion.div style={{ width: 5, height: 5, borderRadius: '50%', background: online ? GREEN : '#dc2626' }}
            animate={{ opacity: online ? [1, 0.3, 1] : 1 }} transition={{ duration: 1.2, repeat: Infinity }} />
          <span style={{ fontFamily: 'Outfit', fontSize: 10, fontWeight: 700, color: online ? GREEN : '#dc2626', letterSpacing: '0.05em' }}>
            {rover.status}
          </span>
        </div>
        <span style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 700, color: INK }}>HYDRO ROVER HR-01</span>
        <span style={{ fontFamily: 'Outfit', fontSize: 11, color: ink(0.35) }}>·</span>
        <span style={{ fontFamily: 'Outfit', fontSize: 11, color: ink(0.45) }}>{rover.mode}</span>
        <span style={{ fontFamily: 'Outfit', fontSize: 11, color: ink(0.35), marginLeft: 'auto' }}>
          Route&nbsp;
          <span style={{ fontWeight: 600, color: INK }}>{rover.routeProgress}%</span>
          &nbsp;complete
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <StatCard icon={Battery} label="BATTERY" value={`${rover.battery}%`}
          sub={rover.battery < 20 ? '⚠ Charge urgently' : rover.battery < 50 ? 'Low — monitor' : 'Good'}
          color={battColor} />
        <StatCard icon={Wifi} label="SIGNAL STRENGTH" value={`${rover.signal}%`}
          sub={`${rover.syncLatency} ms sync latency`} color={sigColor} pulse={online} />
        <StatCard icon={Route} label="FAILURES" value={rover.failures}
          sub={rover.failures === 0 ? 'All systems nominal' : 'Recovery mode active'}
          color={rover.failures > 0 ? '#dc2626' : GREEN} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Signal chart */}
        <Card style={{ padding: 14 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: INK, marginBottom: 10 }}>Signal History</div>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={signalHistory}>
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: ink(0.3), fontFamily: 'Outfit' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: ink(0.3), fontFamily: 'Outfit' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${ink(0.1)}`, borderRadius: 8, fontSize: 11, fontFamily: 'Outfit' }} />
              <Line type="monotone" dataKey="signal" stroke={GREEN} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Position */}
        <Card style={{ padding: 14 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: INK, marginBottom: 10 }}>Position & Motion</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {[
              { label: 'Latitude',  value: `${rover.lat?.toFixed(5)}°` },
              { label: 'Longitude', value: `${rover.lng?.toFixed(5)}°` },
              { label: 'Speed',     value: `${rover.speed?.toFixed(1)} m/s` },
              { label: 'Zone',      value: rover._zone || '—', highlight: true },
            ].map(f => (
              <div key={f.label} style={{ background: '#f8fafc', border: `1px solid ${ink(0.06)}`, borderRadius: 8, padding: '9px 11px' }}>
                <div style={{ fontFamily: 'Outfit', fontSize: 9, fontWeight: 600, color: ink(0.35), letterSpacing: '0.05em', marginBottom: 3 }}>
                  {f.label.toUpperCase()}
                </div>
                <div style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 700, color: f.highlight ? GREEN : INK }}>{f.value}</div>
              </div>
            ))}
          </div>
          {rover.failures > 0 && (
            <motion.div animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
              style={{
                marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 10px', borderRadius: 8,
                background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)',
              }}>
              <AlertTriangle size={11} color="#dc2626" />
              <span style={{ fontFamily: 'Outfit', fontSize: 11, color: '#dc2626', fontWeight: 500 }}>Recovery mode active</span>
            </motion.div>
          )}
        </Card>
      </div>

      {/* Battery bar */}
      <Card style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: 'Outfit', fontSize: 11, fontWeight: 600, color: ink(0.5) }}>Battery</span>
          <span style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 700, color: battColor }}>{rover.battery}%</span>
        </div>
        <div style={{ height: 7, background: ink(0.06), borderRadius: 5, overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', borderRadius: 5, background: battColor }}
            animate={{ width: `${rover.battery}%` }} transition={{ duration: 0.8 }} />
        </div>
      </Card>

      {/* Diagnostics */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: INK, marginBottom: 10 }}>System Diagnostics</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7 }}>
          {DIAGNOSTICS.map(d => {
            const ok = diagOk[d.key]
            return (
              <div key={d.key} style={{
                background: ok ? 'rgba(22,163,74,0.04)' : 'rgba(220,38,38,0.04)',
                border: `1px solid ${ok ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)'}`,
                borderRadius: 8, padding: '9px 6px', textAlign: 'center',
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
                  {ok ? (
                    <motion.div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN }}
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2.5, repeat: Infinity }} />
                  ) : (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626' }} />
                  )}
                </div>
                <div style={{ fontFamily: 'Outfit', fontSize: 9, color: ink(0.45), marginBottom: 2 }}>{d.label}</div>
                <div style={{ fontFamily: 'Outfit', fontSize: 10, fontWeight: 700, color: ok ? GREEN : '#dc2626' }}>
                  {ok ? 'OK' : 'FAIL'}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </motion.div>
  )
}
