import { Link, Outlet } from 'react-router-dom'
import { useContext } from 'react'

import './styles/homepage.css'

import cartImage from './assets/pink-shopping-cart.svg'
import userImage from './assets/pink-person.svg'
import logoImage from './assets/logo.svg'

import AuthContext from './context/AuthContext'

export default function Root() {
    const { currentUser } = useContext(AuthContext)

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

                    {!currentUser && (
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

                    {currentUser && (
                        <>
                            <Link to="/account/cart">
                                <img
                                    src={cartImage}
                                    alt="cart"
                                    className="cart-img"
                                />
                            </Link>
                            <Link to="/account/profile">
                                <img
                                    src={userImage}
                                    alt="user"
                                    className="user-img"
                                />
                            </Link>
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
