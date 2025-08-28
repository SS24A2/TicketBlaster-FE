import { isExpired } from 'react-jwt'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
    const token = localStorage.getItem('token')

    if (!token || isExpired(token)) {
        console.log('Token missing or expired')
        return <Navigate to="/" replace />
    }

    return <Outlet />
}
