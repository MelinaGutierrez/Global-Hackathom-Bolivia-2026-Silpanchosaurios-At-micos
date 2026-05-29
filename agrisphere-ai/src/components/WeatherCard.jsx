import { motion } from 'framer-motion'
import { Thermometer, Droplets, Wind, CloudRain, Sun, Gauge } from 'lucide-react'

export default function WeatherCard({ weather }) {
  const { temp, humidity, wind, et0, rainfall } = weather

  const getWeatherIcon = () => {
    if (rainfall > 5) return '🌧️'
    if (humidity > 75) return '⛅'
    if (temp > 30) return '☀️'
    return '🌤️'
  }

  return (
    <div className="glass rounded-2xl p-4 border border-neon-700/15">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display font-semibold text-sm text-neon-100">Clima & Entorno</span>
        <span className="text-2xl">{getWeatherIcon()}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <WeatherStat icon={Thermometer} label="Temp" value={`${temp.toFixed(1)}°C`}
          accent={temp > 30 ? '#ef4444' : '#22c55e'} />
        <WeatherStat icon={Droplets} label="Humedad" value={`${humidity.toFixed(0)}%`}
          accent="#38bdf8" />
        <WeatherStat icon={Wind} label="Viento" value={`${wind.toFixed(0)} km/h`}
          accent="#86efac" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg p-2.5 bg-void/40 border border-neon-700/10">
          <div className="flex items-center gap-1.5 mb-1">
            <CloudRain size={10} className="text-info" />
            <span className="font-mono text-[9px] text-sage-500">LLUVIA HOY</span>
          </div>
          <span className="font-mono text-sm font-bold text-neon-200">{rainfall.toFixed(1)} mm</span>
        </div>
        <div className="rounded-lg p-2.5 bg-void/40 border border-neon-700/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge size={10} className="text-warning" />
            <span className="font-mono text-[9px] text-sage-500">ET₀</span>
          </div>
          <span className="font-mono text-sm font-bold text-neon-200">{et0.toFixed(1)} mm/d</span>
          <div className="font-mono text-[8px] text-sage-600">evapotransp.</div>
        </div>
      </div>

      {/* ET0 indicator bar */}
      <div className="mt-3">
        <div className="flex justify-between mb-1">
          <span className="font-mono text-[9px] text-sage-500">PRESIÓN EVAPORATIVA</span>
          <span className="font-mono text-[9px] text-warning">{et0 > 6 ? 'ALTA' : et0 > 3 ? 'MEDIA' : 'BAJA'}</span>
        </div>
        <div className="h-1 bg-void/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${Math.min((et0 / 12) * 100, 100)}%`,
              background: et0 > 6 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #22c55e, #86efac)'
            }}
            animate={{ width: `${Math.min((et0 / 12) * 100, 100)}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>
    </div>
  )
}

function WeatherStat({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-lg p-2 bg-void/40 border border-neon-700/10 text-center">
      <Icon size={12} className="mx-auto mb-1" style={{ color: accent }} />
      <div className="font-mono text-xs font-bold" style={{ color: accent }}>{value}</div>
      <div className="font-mono text-[8px] text-sage-500 mt-0.5">{label}</div>
    </div>
  )
}
