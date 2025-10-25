import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import Api from '../Api'
import errorHandling from './errorHandling'

export default function Register() {
    const [error, setError] = useState('')
    const [fullname, setFullname] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await Api().post('/api/v1/auth/register', {
                fullname,
                email,
                password,
                confirmPassword,
            })

            console.log('res', res)

            const id = res.data?.id
            if (!id) {
                setError('Account creation failed! Try again later.')
                return
            }
            localStorage.setItem('unverifiedAccount', id)

            navigate(
                '/account/verify',
                { state: { isVerificationMailSent: true } },
                { viewTransition: true }
            )
        } catch (err) {
            console.log('err', err)
            if (err.status === 403) {
                navigate(
                    '/account/verify',
                    { state: { isVerificationMailSent: false } },
                    { viewTransition: true }
                )
            }
            let errorMessage = errorHandling(err)
            setError(`${errorMessage} Try again`)
        }
    }

    return (
        <section className="register-section">
            <h1>Create account</h1>
            <form className="form-container" onSubmit={handleSubmit}>
                <div className="register-name">
                    <label>Full Name</label>
                    <input
                        autoComplete="off"
                        type="text"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                    />
                </div>

                <div className="register-email">
                    <label>Email</label>
                    <input
                        autoComplete="off"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="register-password">
                    <label>Password</label>
                    <input
                        autoComplete="off"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="register-password">
                    <label>Re-type Password</label>
                    <input
                        autoComplete="off"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="pink-button">
                    Create account
                </button>

                <button type="button" className="white-button">
                    <Link to="/account/login" viewTransition>
                        Already have an account?
                    </Link>
                </button>
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </section>
    )
}
