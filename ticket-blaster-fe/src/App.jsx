import './App.css'
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

import Root from './Root'
import ProtectedRoute from './components/ProtectedRoute'

import Error from './pages/Error'
import Homepage from './pages/Homepage'
import Login from './pages/Login'
import Cart from './pages/Cart'
import CartCheckOut from './pages/CartCheckOut'
import CartFinal from './pages/CartFinal'
import Event from './pages/Event'
import Events from './pages/Events'
import EventsAdmin from './pages/EventsAdmin'
import ForgotPassword from './pages/ForgotPassword'
import NewEvent from './pages/NewEvent'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import TicketsHistory from './pages/TicketsHistory'
import UserDetails from './pages/UserDetails'
import UsersAdmin from './pages/UsersAdmin'

import AuthContext from './context/AuthContext'
import { decodeToken, isExpired } from 'react-jwt'
import Search from './pages/Search'

// TBC!
const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <Error />,
        children: [
            {
                path: '/',
                children: [
                    { index: true, element: <Homepage /> },
                    { path: 'concerts', element: <Events type="concerts" /> },
                    { path: 'event/:id', element: <Event /> },
                    {
                        path: 'comedies',
                        element: <Events type="comedies" />,
                    },
                    { path: 'event/:id', element: <Event /> },
                    {
                        path: `events/search/:searchTerm`,
                        element: <Search />,
                    },
                ],
            },

            {
                path: '/account',
                children: [
                    { path: 'login', element: <Login /> },
                    {
                        path: 'register',
                        element: <Register />,
                    },
                    {
                        path: 'password/forgot',
                        element: <ForgotPassword />,
                    },
                    {
                        path: 'password/reset/:id/:token',
                        element: <ResetPassword />,
                    },
                ],
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: '/account/profile',
                        children: [
                            { index: true, element: <TicketsHistory /> },
                            { path: 'tickets', element: <TicketsHistory /> },
                            { path: 'details', element: <UserDetails /> },
                            { path: 'cart', element: <Cart /> },
                            {
                                path: 'cart/checkout',
                                element: <CartCheckOut />,
                            },
                            { path: 'cart/final', element: <CartFinal /> },
                        ],
                    },
                ],
            },
            {
                element: <ProtectedRoute allowedRoles={['admin']} />,
                children: [
                    {
                        path: '/account/profile',
                        children: [
                            { path: 'events', element: <EventsAdmin /> },
                            { path: 'events/new', element: <NewEvent /> },
                            { path: 'users', element: <UsersAdmin /> },
                        ],
                    },
                ],
            },
            {
                path: '/unauthorized',
                element: (
                    <div>
                        Permission denied
                        <Link to="/">Go back</Link>
                    </div>
                ),
            },
        ],
    },
])

export default function App() {
    const token = localStorage.getItem('token') || null
    const userInitial = token && !isExpired(token) ? decodeToken(token) : null
    console.log('TOKEN CHECKED')
    const [currentUser, setCurrentUser] = useState(userInitial)

    const handleLogout = () => {
        localStorage.removeItem('token')
        setCurrentUser(null)
    }
    const handleLogin = (token) => {
        localStorage.setItem('token', token)
        const user = decodeToken(token)
        setCurrentUser(user)
    }

    useEffect(() => {
        console.log('App component initial render')
    }, [])

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                handleLogout,
                handleLogin,
            }}
        >
            <RouterProvider router={router} />
        </AuthContext.Provider>
    )
}
