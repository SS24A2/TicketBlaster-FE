import { isExpired } from 'react-jwt'
import { Navigate, Outlet, Link } from 'react-router-dom'

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

export default function ProtectedRoute({ allowedRoles }) {
    const { currentUser } = useContext(AuthContext) // returns the value object
    const navigate = useNavigate()

    useEffect(() => {
        console.log('ProtectedRoute component initial render')
        console.log(allowedRoles)
        console.log(currentUser)
        console.log(new Date().toString())
        // console.log(localStorage.getItem('token'))
    }, [])

    useEffect(() => {
        // const token = localStorage.getItem('token')

        // if (!token || isExpired(token)) {
        //     console.log('Token missing or expired')
        //     return <Navigate to="/" replace />
        // }
        if (!currentUser) {
            navigate('/account/login')
        } else if (
            (allowedRoles && !allowedRoles.includes(currentUser.role)) ||
            currentUser.status === 'deleted'
        ) {
            navigate('/unauthorized')
            //navigate to permission denied component and then to homepage
        }
    })

    if (
        !currentUser ||
        (allowedRoles && !allowedRoles.includes(currentUser.role)) ||
        currentUser.status === 'deleted'
    ) {
        //also return null so we don't show a glimpse (flicker) of the real stuff
        return <div>Permission denied</div>
        // return null  //TBC
    }

    return <Outlet />
}
