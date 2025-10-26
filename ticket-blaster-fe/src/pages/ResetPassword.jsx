import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'

import Api from '../Api'

export default function ResetPassword() {
    const navigate = useNavigate()
    const { id, token } = useParams()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [isResetPasswordLoading, setIsResetPasswordLoading] = useState(false)
    const [resetPasswordError, setResetPasswordError] = useState(null)

    const [isLinkCheckLoading, setIsLinkCheckLoading] = useState(false)
    const [linkCheckError, setLinkCheckError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsResetPasswordLoading(true)
        try {
            const res = await Api().put(
                `/api/v1/auth/resetPassword/${id}/${token}`,
                { password, confirmPassword }
            )
            console.log(res)
            if (res.data === 'Password reset successful!') {
                setIsResetPasswordLoading(false)
                navigate('/account/login', { viewTransition: true })
            }
        } catch (err) {
            console.log('err', err)
            if (
                ['Unauthorized. Token not valid', 'User not found!'].includes(
                    err.response?.data?.error
                )
            ) {
                setResetPasswordError(
                    'The reset password link is either invalid or has expired. Please submit a new password reset request.'
                )
                setIsResetPasswordLoading(false)
                return
            }
            if (
                ['Passwords do not match!'].includes(err.response?.data?.error)
            ) {
                setResetPasswordError(
                    'The retyped password does not match the original password. Please try again.'
                )
                setIsResetPasswordLoading(false)
                return
            }

            setResetPasswordError(
                err.response?.data?.error || 'Internal Server Error!'
            )
            setIsResetPasswordLoading(false)
        }
    }

    useEffect(() => {
        const checkResetPasswordLink = async () => {
            setIsLinkCheckLoading(true)
            try {
                const res = await Api().get(
                    `/api/v1/auth/resetPassword/${id}/${token}`
                )
                console.log(res)
                if (res.data === 'Token is valid') {
                    setIsLinkCheckLoading(false)
                }
            } catch (err) {
                console.log('err', err)
                if (
                    [
                        'Unauthorized. Token not valid',
                        'User not found!',
                    ].includes(err.response?.data?.error)
                ) {
                    setLinkCheckError(
                        'The reset password link is either invalid or has expired. Please submit a new password reset request.'
                    )
                    setIsLinkCheckLoading(false)
                    return
                }
                setIsLinkCheckLoading(false)
                setLinkCheckError(
                    err.response?.data?.error || 'Internal Server Error'
                )
            }
        }

        checkResetPasswordLink()
    }, [id, token])

    if (isLinkCheckLoading) {
        return <h2>The reset password link is being verified, please wait.</h2>
    }

    if (linkCheckError) {
        return <h2>{linkCheckError}</h2>
    }

    return (
        <section className="reset-password-section">
            <h1>Reset Password</h1>
            <form className="form-container" onSubmit={handleSubmit}>
                <div className="reset-password">
                    <label>Password</label>
                    <input
                        autoComplete="off"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="reset-password">
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
                    Reset Password
                </button>

                <button type="button" className="white-button">
                    <Link to="/account/login" viewTransition>
                        Back to login
                    </Link>
                </button>
            </form>

            {isResetPasswordLoading && (
                <p>Reset password in progress, please wait.</p>
            )}
            {resetPasswordError && (
                <p style={{ color: 'red' }}>{resetPasswordError}</p>
            )}
        </section>
    )
}
