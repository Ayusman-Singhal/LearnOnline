import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

api.interceptors.request.use(async (config) => {
  // Clerk token injected by callers via getToken()
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || 'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

export default api
