'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface WeatherState {
  temperature: number
  condition: string
  forecast: { day: string; min: number; max: number; rain: number }[]
}

const WEATHER_CODE_MAP: Record<number, string> = {
  0: 'Ensolarado',
  1: 'Predom. Ensolarado',
  2: 'Parcialmente Nublado',
  3: 'Nublado',
  45: 'Nevoeiro',
  48: 'Nevoeiro',
  51: 'Garoa Leve',
  53: 'Garoa',
  55: 'Garoa Forte',
  61: 'Chuva Leve',
  63: 'Chuva Moderada',
  65: 'Chuva Forte',
  80: 'Pancadas de Chuva',
  81: 'Pancadas Fortes',
  82: 'Chuva Torrencial',
  95: 'Tempestade',
}

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function Topbar() {
  const [time, setTime] = useState('')
  const [dateFormatted, setDateFormatted] = useState('')
  const [weather, setWeather] = useState<WeatherState | null>(null)

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      const dateText = now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      setDateFormatted(dateText.charAt(0).toUpperCase() + dateText.slice(1))
    }

    updateDateTime()
    const timer = setInterval(updateDateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Guarulhos / Lavras coordinates: -23.43, -46.50
    const url =
      'https://api.open-meteo.com/v1/forecast?latitude=-23.43&longitude=-46.50&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&forecast_days=4'

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data?.current_weather) return
        const cw = data.current_weather
        const daily = data.daily

        const forecastList = (daily.time || []).slice(0, 3).map((dateStr: string, idx: number) => {
          const dateObj = new Date(dateStr + 'T12:00:00')
          const dayLabel = idx === 0 ? 'Hoje' : DAYS_SHORT[dateObj.getDay()]
          return {
            day: dayLabel,
            min: Math.round(daily.temperature_2m_min[idx] ?? 19),
            max: Math.round(daily.temperature_2m_max[idx] ?? 28),
            rain: Math.round(daily.precipitation_probability_max[idx] ?? 0),
          }
        })

        setWeather({
          temperature: Math.round(cw.temperature),
          condition: WEATHER_CODE_MAP[cw.weathercode] || 'Nublado',
          forecast: forecastList,
        })
      })
      .catch(() => {
        setWeather({
          temperature: 29,
          condition: 'Nublado',
          forecast: [
            { day: 'Hoje', min: 20, max: 32, rain: 83 },
            { day: 'Sáb', min: 19, max: 30, rain: 85 },
            { day: 'Dom', min: 20, max: 30, rain: 89 },
          ],
        })
      })
  }, [])

  return (
    <section aria-label="Data, hora e previsão do tempo de Lavras, Guarulhos" className="bg-primary font-sans text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-2 text-xs">
        {/* Row 1: Date, Time, Location and Weather Header */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <Clock className="h-3.5 w-3.5 shrink-0 opacity-80" />
            <span className="capitalize">{dateFormatted || 'Guarulhos, São Paulo'}</span>
            <time className="w-[8ch] font-bold tabular-nums">{time || '--:--:--'}</time>
            <span>Guarulhos · SP</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">Lavras · Guarulhos</span>
            {weather ? (
              <span>{weather.temperature}°C {weather.condition}</span>
            ) : (
              <span>Carregando previsão…</span>
            )}
          </div>
        </div>

        {/* Row 2: Weather Forecast */}
        {weather && weather.forecast && (
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] opacity-90 border-t border-white/10 pt-1">
            <span className="font-semibold">Previsão do tempo</span>
            {weather.forecast.map((f, i) => (
              <span key={i} className="whitespace-nowrap">
                {f.day}: {f.min}° / {f.max}° {f.rain > 0 && <span className="opacity-80">Chuva {f.rain}%</span>}
              </span>
            ))}
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto underline opacity-80 hover:opacity-100"
            >
              Fonte: Open-Meteo
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
