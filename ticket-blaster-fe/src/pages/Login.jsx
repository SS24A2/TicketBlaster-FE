import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import Api from '../Api'
import AuthContext from '../context/AuthContext'
import errorHandling from './errorHandling'

export default function Login() {
    const [error, setError] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const navigate = useNavigate()

    const { handleLogin } = useContext(AuthContext)

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await Api().post('/api/v1/auth/login', {
                email,
                password,
            })
            if (res.data.token) {
                handleLogin(res.data.token)
                navigate('/account/profile', { viewTransition: true })
            } else {
                //in case a token is not send in the response ?
                setError(res.data.error || 'Login error!')
            }
        } catch (err) {
            //NIV; Network; Incorrect email or passsword;
            console.log('err', err)
            let errorMessage = errorHandling(err)
            setError(`${errorMessage} Try again`)
        }
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

                <div>
                    <span className="login-forgot-password">
                        <Link to="/account/password/forgot" viewTransition>
                            Forgot Password?
                        </Link>
                    </span>
                    <button type="submit" className="pink-button">
                        Log In
                    </button>
                </div>

                <button type="button" className="white-button">
                    <Link to="/account/register" viewTransition>
                        Don’t have an account?
                    </Link>
                </button>
            </form>

            {error && <div style={{ color: 'red' }}>{error}</div>}
        </section>
    )
}
