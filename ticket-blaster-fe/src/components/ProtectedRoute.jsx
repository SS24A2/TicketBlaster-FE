import { useNavigate, Outlet } from 'react-router-dom'
import { useContext, useEffect } from 'react'
import AuthContext from '../context/AuthContext'

export default function ProtectedRoute({ allowedRoles }) {
    const { currentUser } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (!currentUser) {
            navigate('/account/login', { viewTransition: true })
            return
        }
        if (
            allowedRoles &&
            allowedRoles.length > 0 &&
            !allowedRoles.includes(currentUser.role)
        ) {
            navigate('/unauthorized', { viewTransition: true })
            return
        }
    })

    if (!currentUser) {
        return null
    }
    if (
        allowedRoles &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(currentUser.role)
    ) {
        return null
    }

    return <Outlet />
}
