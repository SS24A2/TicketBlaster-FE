import { Link } from 'react-router-dom'
import { useContext } from 'react'

import AuthContext from '../context/AuthContext'

export default function SecondaryNav({ pageSelected }) {
    const { currentUser, handleLogout } = useContext(AuthContext)

    const textStyle = (pageSelected, page) => {
        return pageSelected === page ? 'pink' : 'black'
    }

    return (
        <nav className="secondary-navigation">
            {currentUser.role === 'admin' && (
                <>
                    <span className={textStyle(pageSelected, 'events')}>
                        <Link to="/account/profile/events">Events</Link>
                    </span>
                    <span className={textStyle(pageSelected, 'users')}>
                        <Link to="/account/profile/users">Users</Link>
                    </span>
                </>
            )}
            <>
                <span className={textStyle(pageSelected, 'tickets')}>
                    <Link to="/account/profile/tickets">Tickets History</Link>
                </span>
                <span className={textStyle(pageSelected, 'details')}>
                    <Link to="/account/profile/details">User Details</Link>
                </span>
                <span onClick={handleLogout}>Log Out</span>
            </>
        </nav>
    )
}
