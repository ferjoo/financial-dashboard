import axios from 'axios'
import { mockAdapter } from '@/mock/adapter'

// Demo build: requests never leave the browser; the mock adapter answers them with sample data.
export const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
  adapter: mockAdapter,
})
