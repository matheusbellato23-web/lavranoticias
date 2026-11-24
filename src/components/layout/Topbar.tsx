'use client'

import { useState, useEffect } from 'react'
import { Clock3, Sun, Moon, Cloud, CloudSun, CloudRain, CloudLightning } from 'lucide-react'

interface CurrentWeather {
  temperature_2m: number
  weather_code: number
  is_day: number
}

interface DailyWeather {
  time: string[]
  weather_code: number[]
  temperature_2m_min: number[]
  temperature_2m_max: number[]
  precipitation_probability_max: number[]
}

interface WeatherData {
  current: CurrentWeather
  daily: DailyWeather
}

function WeatherIcon({ codigo, noite = false }: { codigo: number; noite?: boolean }) {
  const className = "h-5 w-5 shrink-0"
  if (codigo >= 95) return <CloudLightning className={className} aria-hidden="true" />
  if (codigo >= 51) return <CloudRain className={className} aria-hidden="true" />
  if (codigo === 0) return noite ? <Moon className={className} aria-hidden="true" /> : <Sun className={className} aria-hidden="true" />
  if (codigo <= 2) return <CloudSun className={className} aria-hidden="true" />
  return <Cloud className={className} aria-hidden="true" />
}

function weatherCodeDescription(code: number): string {
  if (code === 0) return 'Céu limpo'
  if (code <= 2) return 'Parcialmente nublado'
  if (code === 3) return 'Nublado'
  if (code === 45 || code === 48) return 'Nevoeiro'
  if (code >= 51 && code <= 57) return 'Garoa'
  if (code >= 61 && code <= 67) return 'Chuva'
  if (code >= 71 && code <= 77) return 'Neve'
  if (code >= 80 && code <= 82) return 'Pancadas de chuva'
  if (code === 85 || code === 86) return 'Pancadas de neve'
  if (code >= 95 && code <= 99) return 'Trovoadas'
  return 'Condição indisponível'
}

const LAT = -23.39865
const LON = -46.43146
const OPEN_METEO_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&forecast_days=3`

export default function Topbar() {
  const [time, setTime] = useState('')
  const [dateFormatted, setDateFormatted] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
      const dateText = now.toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        weekday: 'long',
        day: '2-digit',
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
    let active = true
    const fetchWeather = async () => {
      try {
        const res = await fetch(OPEN_METEO_URL)
        if (!res.ok) throw new Error('Falha ao obter previsão')
        const data = await res.json()
        if (active) {
          if (data.current && data.daily) {
            setWeather(data)
            setError(false)
          }
        }
      } catch (err) {
        if (active) setError(true)
      }
    }

    fetchWeather()
    const weatherTimer = setInterval(fetchWeather, 900000) // 15 min
    return () => {
      active = false
      clearInterval(weatherTimer)
    }
  }, [])

  return (
    <section
      aria-label="Data, hora e previsão do tempo de Lavras, Guarulhos"
      className="bg-primary font-sans text-primary-foreground"
    >
      {/* Linha 1: Relógio, Data, Guarulhos SP e Temperatura atual de Lavras */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 text-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="capitalize">{dateFormatted || 'Guarulhos, São Paulo'}</span>
          <time className="w-[8ch] font-bold tabular-nums">{time || '--:--:--'}</time>
          <span>Guarulhos · SP</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold">Lavras · Guarulhos</span>
          {weather?.current ? (
            <>
              <WeatherIcon
                codigo={weather.current.weather_code}
                noite={!weather.current.is_day}
              />
              <span className="text-sm font-bold">
                {Math.round(weather.current.temperature_2m)} °C
              </span>
              <span>{weatherCodeDescription(weather.current.weather_code)}</span>
            </>
          ) : (
            <span>{error ? 'Tempo indisponível no momento' : 'Carregando previsão…'}</span>
          )}
        </div>
      </div>

      {/* Linha 2: Previsão dos 3 dias com ícones e probabilidades */}
      {weather?.daily?.time && (
        <div className="border-t border-primary-foreground/20">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 text-xs">
            <span className="font-bold">Previsão do tempo</span>
            {weather.daily.time.map((dateStr, idx) => {
              const code = weather.daily.weather_code[idx]
              const min = weather.daily.temperature_2m_min[idx]
              const max = weather.daily.temperature_2m_max[idx]
              const rain = weather.daily.precipitation_probability_max[idx]
              const isToday = idx === 0
              const dayLabel = isToday
                ? 'Hoje'
                : new Date(`${dateStr}T12:00:00-03:00`).toLocaleDateString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    weekday: 'short',
                  })

              return (
                <div key={dateStr} className="flex flex-wrap items-center gap-2">
                  <span className="capitalize font-bold">{dayLabel}</span>
                  <WeatherIcon codigo={code} />
                  <span title={weatherCodeDescription(code)}>
                    {Math.round(min)}° / {Math.round(max)}°
                  </span>
                  <span>Chuva {rain}%</span>
                </div>
              )
            })}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[10px] underline underline-offset-2"
            >
              Fonte: Open-Meteo
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
