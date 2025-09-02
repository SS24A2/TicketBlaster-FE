import { Link, Outlet, useNavigate } from 'react-router-dom'

import './styles/homepage.css'

import cartImage from './assets/pink-shopping-cart.svg'
import userImage from './assets/pink-person.svg'
import logoImage from './assets/logo.svg'

export default function Root() {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/') // TBC
    }

    const isLoggedIn = !!localStorage.getItem('token') // TBC

    return (
        <div>
            <header>
                <nav className="navigation">
                    <Link to="/">
                        <img src={logoImage} alt="logo" className="logo-img" />
                    </Link>
                    <span>
                        <Link to="/concerts">Musical Concerts</Link>
                    </span>
                    <span>
                        <Link to="/comedy">Stand-up Comedy</Link>
                    </span>
                    <input type="text" placeholder="Search" name="search" />

                    {!isLoggedIn && (
                        <>
                            <button>
                                <Link to="/account/login">Log in</Link>
                            </button>
                            <button>
                                <Link to="/account/register">
                                    Create Account
                                </Link>
                            </button>
                        </>
                    )}

                    {isLoggedIn && (
                        <>
                            <Link to="/account/cart">
                                <img
                                    src={cartImage}
                                    alt="cart"
                                    className="cart-img"
                                />
                            </Link>
                            <Link to="/account/tickets">
                                <img
                                    src={userImage}
                                    alt="user"
                                    className="user-img"
                                />
                            </Link>

                            {/* <button onClick={handleLogout}>Logout</button> */}
                        </>
                    )}
                </nav>
            </header>

            <main>
                <Outlet />
            </main>
            <footer>
                <div className="footer-wrapper">
                    <img src={logoImage} alt="logo" className="logo-img" />
                    <span>Musical Concerts</span>
                    <span>Stand-up Comedy</span>
                    <span>Copyright TicketBlaster 2023</span>
                </div>
            </footer>
        </div>
    )
}
