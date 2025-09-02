import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

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
                    { path: 'concerts/:id', element: <Event /> },
                    {
                        path: 'comedy',
                        element: <Events type="comedy" />,
                    },
                    { path: 'comedy/:id', element: <Event /> },
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
                            { path: 'info', element: <UserDetails /> },
                            { path: 'events', element: <EventsAdmin /> },
                            { path: 'events/create', element: <NewEvent /> },
                            { path: 'users', element: <UsersAdmin /> },
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
        ],
    },
])

export default function App() {
    return <RouterProvider router={router} />
}
