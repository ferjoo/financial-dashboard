import { createContext, useContext, useState, type ReactNode } from 'react'

type CurrencyMode = 'Q' | 'USD'

interface CurrencyContextValue {
  currency: CurrencyMode
  toggle: () => void
  fmt: (value: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export const GTQ_RATE = 7.5

export function fmtQ(value: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function fmtUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / GTQ_RATE)
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyMode>('Q')
  const toggle = () => setCurrency((c) => (c === 'Q' ? 'USD' : 'Q'))
  const fmt = (value: number) => (currency === 'Q' ? fmtQ(value) : fmtUSD(value))

  return (
    <CurrencyContext.Provider value={{ currency, toggle, fmt }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
