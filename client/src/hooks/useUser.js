import { useUser as useClerkUser, useAuth } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export function useUser() {
  const { user: clerkUser, isLoaded } = useClerkUser()
  const { getToken } = useAuth()

  const { data: dbUser, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    enabled: !!clerkUser,
    queryFn: async () => {
      const token = await getToken()
      const res = await api.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data
    },
  })

  return {
    clerkUser,
    user: dbUser,
    role: dbUser?.role || 'student',
    isLoaded: isLoaded && !isLoading,
    isAuthenticated: !!clerkUser,
  }
}
