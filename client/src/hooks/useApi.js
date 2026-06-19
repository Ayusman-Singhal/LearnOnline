import { useAuth } from '@clerk/clerk-react'
import api from '../lib/api'

export function useApi() {
  const { getToken } = useAuth()

  const authHeaders = async () => {
    const token = await getToken()
    return { Authorization: `Bearer ${token}` }
  }

  return {
    get: async (url, config = {}) => {
      const headers = await authHeaders()
      const res = await api.get(url, { ...config, headers: { ...headers, ...config.headers } })
      return res.data
    },
    post: async (url, data, config = {}) => {
      const headers = await authHeaders()
      const res = await api.post(url, data, { ...config, headers: { ...headers, ...config.headers } })
      return res.data
    },
    put: async (url, data, config = {}) => {
      const headers = await authHeaders()
      const res = await api.put(url, data, { ...config, headers: { ...headers, ...config.headers } })
      return res.data
    },
    patch: async (url, data, config = {}) => {
      const headers = await authHeaders()
      const res = await api.patch(url, data, { ...config, headers: { ...headers, ...config.headers } })
      return res.data
    },
    del: async (url, config = {}) => {
      const headers = await authHeaders()
      const res = await api.delete(url, { ...config, headers: { ...headers, ...config.headers } })
      return res.data
    },
  }
}
