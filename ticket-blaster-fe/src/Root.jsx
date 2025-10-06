import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useContext, useState } from 'react'
import EcommerceContext from './context/EcommerceContext'

import './styles/homepage.css'

import cartImage from './assets/pink-shopping-cart.svg'
import userImage from './assets/pink-person.svg'
import logoImage from './assets/logo.svg'

import AuthContext from './context/AuthContext'

export default function Root() {
    const { currentUser } = useContext(AuthContext)

    const [searchInput, setSearchInput] = useState('')
    const { cartState } = useContext(EcommerceContext)

    const navigate = useNavigate()
    return (
        <div>
            <header>
                <nav className="navigation">
                    <Link to="/" viewTransition>
                        <img src={logoImage} alt="logo" className="logo-img" />
                    </Link>
                    <span>
                        <Link to="/concerts" viewTransition>
                            Musical Concerts
                        </Link>
                    </span>
                    <span>
                        <Link to="/comedies" viewTransition>
                            Stand-up Comedy
                        </Link>
                    </span>
                    <input
                        type="text"
                        placeholder="Search"
                        name="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchInput) {
                                navigate(
                                    `/events/search/${searchInput.trim()}`,
                                    { viewTransition: true }
                                )
                                setSearchInput('')
                            }
                        }}
                    />

                    {!currentUser && (
                        <>
                            <button>
                                <Link to="/account/login" viewTransition>
                                    Log in
                                </Link>
                            </button>
                            <button>
                                <Link to="/account/register" viewTransition>
                                    Create Account
                                </Link>
                            </button>
                        </>
                    )}

                    {currentUser && (
                        <>
                            <Link
                                to="/account/profile/cart"
                                style={{ position: 'relative' }}
                                viewTransition
                            >
                                <span
                                    className="cart-state-num"
                                    style={{
                                        display:
                                            Object.keys(cartState).length > 0
                                                ? 'flex'
                                                : 'none',
                                    }}
                                >
                                    {Object.keys(cartState).length}
                                </span>
                                <img
                                    src={cartImage}
                                    alt="cart"
                                    className="cart-img"
                                />
                            </Link>
                            <Link to="/account/profile" viewTransition>
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
