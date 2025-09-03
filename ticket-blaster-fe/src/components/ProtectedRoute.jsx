// import { isExpired } from 'react-jwt'
// import { Navigate, Outlet } from 'react-router-dom'

// export default function ProtectedRoute() {
//     const token = localStorage.getItem('token')

//     if (!token || isExpired(token)) {
//         console.log('Token missing or expired')
//         return <Navigate to="/" replace />
//     }

//     return <Outlet />
// }

import { useContext, useEffect } from 'react'
import AuthContext from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
    const { user } = useContext(AuthContext) // returns the value object
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate('/signin')
        }
    })

    if (!user) {
        //also return null so we don't show a glimpse (flicker) of the real stuff
        return null
    }
    console.log('hi') // this will never be printed unless we have a user

    return children
}
