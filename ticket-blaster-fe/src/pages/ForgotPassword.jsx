import { useState } from 'react'
import { Link } from 'react-router-dom'

import Api from '../Api'
import errorHandling from './errorHandling'

export default function ForgotPassword() {
    const [error, setError] = useState(null)

    const [email, setEmail] = useState('')

    const [message, setMessage] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const res = await Api().post('/api/v1/auth/forgotPassword', {
                email,
            })
            console.log(res)
            setIsLoading(false)
            setError(null)
            setMessage(res.data)
        } catch (err) {
            console.log('err', err)
            let errorMessage = errorHandling(err)
            setIsLoading(false)
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

                <button
                    type="submit"
                    className="pink-button"
                    disabled={message}
                >
                    Send password reset email
                </button>

                <button type="button" className="white-button">
                    <Link to="/account/login">Back to login</Link>
                </button>
            </form>
            {message && <div>{message}</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {isLoading && (
                <div className="modal-users-events-background">
                    <div className="modal-users-events">
                        <div
                            className="modal-users-events-wrapper"
                            style={{ width: 200, margin: '20px auto' }}
                        >
                            <h3 style={{ textAlign: 'center' }}>Loading ...</h3>
                            <div
                                style={{ margin: '50px auto' }}
                                className="loader"
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
