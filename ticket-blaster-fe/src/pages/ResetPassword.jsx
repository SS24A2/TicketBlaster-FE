import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'

import Api from '../Api'
import errorHandling from './errorHandling'

export default function ResetPassword() {
    const [error, setError] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const navigate = useNavigate()
    const [componentStatus, setComponentStatus] = useState('loading') //TBC

    const { id, token } = useParams()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await Api().put(
                `/api/v1/auth/resetPassword/${id}/${token}`,
                { password, confirmPassword }
            )
            console.log(res)
            navigate('/account/login', { viewTransition: true })
        } catch (err) {
            console.log('err', err)
            let errorMessage = errorHandling(err)
            setError(`${errorMessage} Try again`)
        }
    }

    useEffect(() => {
        const checkResetPasswordLink = async () => {
            try {
                const res = await Api().get(
                    `/api/v1/auth/resetPassword/${id}/${token}`
                )
                console.log(res)
                if (res.data === 'Token is valid') {
                    //TBC
                    setComponentStatus('ok')
                }
            } catch (err) {
                console.log('err', err)
                let errorMessage = errorHandling(err) //TBC
                setError(`${errorMessage} Try again`) //TBC
                setComponentStatus('error')
            }
        }

        checkResetPasswordLink()
    }, [id, token])

    if (componentStatus === 'loading') return <div>LOADING</div>
    if (componentStatus === 'error')
        return <div>{error && <div style={{ color: 'red' }}>{error}</div>}</div>

    if (componentStatus === 'ok')
        return (
            <section className="reset-password-section">
                <h1>Reset Password</h1>
                <form className="form-container" onSubmit={handleSubmit}>
                    <div className="reset-password">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="reset-password">
                        <label>Re-type Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="pink-button">
                        Reset Password
                    </button>

                    <button type="button" className="white-button">
                        <Link to="/account/login" viewTransition>
                            Back to login
                        </Link>
                    </button>
                </form>

                {error && <div style={{ color: 'red' }}>{error}</div>}
            </section>
        )
}
