import axios from 'axios'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import errorHandling from './errorHandling'

export default function ForgotPassword() {
    const [error, setError] = useState('')

    const [email, setEmail] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post(
                'http://localhost:10002/api/v1/auth/forgotPassword',
                { email },
                { headers: { 'Content-Type': 'application/json' } }
            )
            console.log(res)
        } catch (err) {
            console.log('err', err)
            let errorMessage = errorHandling(err)
            setError(`${errorMessage} Try again`)
        }
    }

    return (
        <section className="forgot-password-section">
            <h1>Forgot Password</h1>
            <form className="form-container" onSubmit={handleSubmit}>
                <div className="forgot-password-email">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="pink-button">
                    Send password reset email
                </button>

                <button type="button" className="white-button">
                    <Link to="/account/login">Back to login</Link>
                </button>
            </form>

            {error && <div style={{ color: 'red' }}>{error}</div>}
        </section>
    )
}
