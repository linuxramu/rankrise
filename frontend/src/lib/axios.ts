import axios from 'axios'

// Determine API base URL based on environment
const getApiBaseURL = () => {
  // Production deployment (Cloudflare Pages)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://rankrise-backend.ramuoncloud.workers.dev/api'
  }
  // Development
  return 'http://localhost:8787/api'
}

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: { 'Content-Type': 'application/json' },
})

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
