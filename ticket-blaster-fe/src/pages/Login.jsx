import axios from 'axios'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { decodeToken } from 'react-jwt'

export default function Login() {
    // const [error, setError] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    // const navigate = useNavigate()

    const handleSubmit = async (e) => {
        //     e.preventDefault()
        //     try {
        //         const res = await axios.post(
        //             'http://localhost:10000/api/v1/login',
        //             { email, password },
        //             { headers: { 'Content-Type': 'application/json' } }
        //         )
        //         // { success: true, token: "nasiot token" }
        //         if (res.data.token) {
        //             localStorage.setItem('token', res.data.token)
        //             const decoded = decodeToken(res.data.token)
        //             if (decoded.role === 'admin') {
        //                 navigate('/users')
        //             } else {
        //                 navigate('/')
        //             }
        //         } else {
        //             setError(res.data.error || 'Login error!')
        //         }
        //     } catch (err) {
        //         console.log(err)
        //         setError('Server erorr!')
        //     }
    }

    return (
        <section className="login-section">
            <h1>Log In</h1>
            <form className="form-container" onSubmit={handleSubmit}>
                <div className="login-email">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="login-password">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* {error && (
                    <div style={{ color: 'red' }}>{error}</div>
                )} */}
                <div>
                    <span className="login-forgot-password">
                        <Link to="/account/password/forgot">
                            Forgot Password?
                        </Link>
                    </span>
                    <button type="submit" className="pink-button">
                        Log In
                    </button>
                </div>

                <button type="button" className="white-button">
                    <Link to="/account/register">Don’t have an account?</Link>
                </button>
            </form>
        </section>
    )
}
