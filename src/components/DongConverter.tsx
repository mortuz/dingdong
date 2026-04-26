import React, { useState, useEffect } from "react"

// Types for data persistence
interface PersistedRate {
  vndToInr: number
  usdToInr: number
  lastFetched: number
}

const STORAGE_KEY = "vnd_to_inr_v2"
const MS_PER_DAY = 24 * 60 * 60 * 1000
type SourceCurrency = "VND" | "USD"

const isPersistedRate = (value: unknown): value is PersistedRate => {
  if (!value || typeof value !== "object") return false

  const candidate = value as Partial<PersistedRate>

  return (
    typeof candidate.vndToInr === "number" &&
    typeof candidate.usdToInr === "number" &&
    typeof candidate.lastFetched === "number"
  )
}

const DongConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>("")
  const [rates, setRates] = useState<PersistedRate | null>(null)
  const [sourceCurrency, setSourceCurrency] = useState<SourceCurrency>("VND")
  const [status, setStatus] = useState<"loading" | "live" | "offline">(
    "loading",
  )

  useEffect(() => {
    const syncData = async () => {
      const cached = localStorage.getItem(STORAGE_KEY)
      let parsed: PersistedRate | null = null

      if (cached) {
        try {
          const raw = JSON.parse(cached)
          parsed = isPersistedRate(raw) ? raw : null
        } catch {
          parsed = null
        }
      }

      const now = Date.now()

      // Determine if we need a fresh fetch
      const isExpired = !parsed || now - parsed.lastFetched > MS_PER_DAY

      if (isExpired) {
        try {
          const res = await fetch("https://open.er-api.com/v6/latest/VND")
          const data = await res.json()
          const vndToInr = data.rates.INR
          const usdRateFromVnd = data.rates.USD
          const usdToInr = vndToInr / usdRateFromVnd

          const newData: PersistedRate = {
            vndToInr,
            usdToInr,
            lastFetched: now,
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
          setRates(newData)
          setStatus("live")
        } catch (err) {
          // Fallback to local if fetch fails
          if (parsed) {
            setRates(parsed)
            setStatus("offline")
          } else {
            setRates(null)
            setStatus("offline")
          }
        }
      } else if (parsed) {
        setRates(parsed)
        setStatus("live")
      }
    }

    syncData()
  }, [])

  const rate = sourceCurrency === "VND" ? rates?.vndToInr : rates?.usdToInr
  const sourceSymbol = sourceCurrency === "VND" ? "₫" : "$"

  const handleConvert = () => {
    if (!rate || !amount) return "₹0.00"
    return (parseFloat(amount) * rate).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      style: "currency",
      currency: "INR",
    })
  }

  return (
    <div className='converter-card'>
      <div
        className='currency-toggle'
        role='tablist'
        aria-label='Source currency'>
        <button
          type='button'
          className={sourceCurrency === "VND" ? "active" : ""}
          onClick={() => setSourceCurrency("VND")}>
          VND
        </button>
        <button
          type='button'
          className={sourceCurrency === "USD" ? "active" : ""}
          onClick={() => setSourceCurrency("USD")}>
          USD
        </button>
      </div>

      <input
        type='number'
        inputMode='decimal'
        enterKeyHint='done'
        placeholder={`Enter ${sourceCurrency} (${sourceSymbol})`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <div className='result'>
        {rate ? (
          <h2>{handleConvert()}</h2>
        ) : status === "loading" ? (
          <p>Loading rates...</p>
        ) : (
          <p>Rates unavailable right now.</p>
        )}
      </div>

      {rate && (
        <small>
          Rate: 1 {sourceSymbol} = ₹{rate.toFixed(5)}
        </small>
      )}
    </div>
  )
}

export default DongConverter
