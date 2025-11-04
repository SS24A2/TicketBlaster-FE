import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { InvalidMark, ValidMark } from '../components/validationMarks'

import Api from '../Api'
import Loader from '../components/Loader'

export default function ResetPassword() {
    const navigate = useNavigate()
    const { id, token } = useParams()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [isResetPasswordLoading, setIsResetPasswordLoading] = useState(false)
    const [resetPasswordError, setResetPasswordError] = useState(null)

    const [isLinkCheckLoading, setIsLinkCheckLoading] = useState(false)
    const [linkCheckError, setLinkCheckError] = useState(null)

    const [formDataErrors, setFormDataErrors] = useState({
        password: '',
        confirmPassword: '',
    })
    const [validationStyle, setValidationStyle] = useState({
        password: false,
        confirmPassword: false,
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        let validationResult = true
        for (let i in formDataErrors) {
            if (formDataErrors[i]) validationResult = false
        }

        if (!validationResult && password && confirmPassword) {
            setResetPasswordError(
                'Password reset failed. Ensure your password entries are identical and are correctly filled.'
            )
            return
        }

        if (!password || !confirmPassword) {
            setResetPasswordError(
                'Password reset failed. Please fill out all required fields.'
            )
            setFormDataErrors({
                password: !password
                    ? 'Please fill out this field.'
                    : formDataErrors.password,
                confirmPassword: !confirmPassword
                    ? 'Please fill out this field.'
                    : formDataErrors.confirmPassword,
            })
            return
        }

        setIsResetPasswordLoading(true)
        try {
            const res = await Api().put(
                `/api/v1/auth/resetPassword/${id}/${token}`,
                { password, confirmPassword }
            )
            console.log(res)
            if (res.data === 'Password reset successful!') {
                setIsResetPasswordLoading(false)
                navigate(
                    '/account/login',
                    { state: { passwordReset: true } },
                    { viewTransition: true }
                )
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
            setValidationStyle({ password: false, confirmPassword: false })
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
        return <Loader></Loader>
    }

    if (linkCheckError) {
        return (
            <h2 className="reset-password-section" style={{ fontSize: 34 }}>
                {linkCheckError}
            </h2>
        )
    }

    return (
        <section className="reset-password-section">
            <h1>Reset Password</h1>
            <form noValidate className="form-container" onSubmit={handleSubmit}>
                <div className="reset-password">
                    <label htmlFor="password">Password</label>
                    <div>
                        <input
                            style={{
                                borderWidth: 2,
                                borderColor: formDataErrors.password
                                    ? 'red'
                                    : validationStyle.password && password
                                    ? 'green'
                                    : 'black',
                            }}
                            autoComplete="off"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                            type="password"
                            required
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,12}$"
                            onInput={(e) => {
                                setResetPasswordError('')
                                if (e.target.validity.patternMismatch) {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        password:
                                            'Please match the requested format: 8-12 characters, at least one uppercase letter, one lowercase letter and one number.',
                                    })
                                } else if (e.target.validity.valueMissing) {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        password: e.target.validationMessage,
                                    })
                                } else if (
                                    confirmPassword &&
                                    e.target.value !== confirmPassword
                                ) {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        confirmPassword:
                                            'Passwords do not match!',
                                        password: '',
                                    })
                                } else if (!confirmPassword) {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        confirmPassword:
                                            'Please fill out this field.',
                                        password: '',
                                    })
                                } else {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        password: '',
                                        confirmPassword: '',
                                    })
                                }
                            }}
                            onBlur={() =>
                                setValidationStyle({
                                    ...validationStyle,
                                    password: true,
                                })
                            }
                        />
                        {formDataErrors.password && validationStyle.password ? (
                            <InvalidMark />
                        ) : validationStyle.password && password ? (
                            <ValidMark />
                        ) : null}
                    </div>

                    {validationStyle.password ? (
                        <span className="validation-message">
                            {formDataErrors.password}
                        </span>
                    ) : (
                        <span className="validation-message-empty"></span>
                    )}
                </div>
                <div className="reset-password">
                    <label htmlFor="confirmPassword">Re-type password</label>
                    <div>
                        <input
                            style={{
                                borderWidth: 2,
                                borderColor: formDataErrors.confirmPassword
                                    ? 'red'
                                    : validationStyle.confirmPassword &&
                                      confirmPassword
                                    ? 'green'
                                    : 'black',
                            }}
                            autoComplete="off"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            id="confirmPassword"
                            type="password"
                            required
                            onInput={(e) => {
                                setResetPasswordError('')
                                if (e.target.validity.valueMissing) {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        confirmPassword:
                                            e.target.validationMessage,
                                    })
                                } else if (
                                    password &&
                                    e.target.value !== password
                                ) {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        confirmPassword:
                                            'Passwords do not match!',
                                    })
                                } else {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        confirmPassword: '',
                                    })
                                }
                            }}
                            onBlur={() =>
                                setValidationStyle({
                                    ...validationStyle,
                                    confirmPassword: true,
                                })
                            }
                        />
                        {formDataErrors.confirmPassword &&
                        validationStyle.confirmPassword ? (
                            <InvalidMark />
                        ) : validationStyle.confirmPassword &&
                          confirmPassword ? (
                            <ValidMark />
                        ) : null}
                    </div>

                    {validationStyle.confirmPassword ? (
                        <span className="validation-message">
                            {formDataErrors.confirmPassword}
                        </span>
                    ) : (
                        <span className="validation-message-empty"></span>
                    )}
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

            {isResetPasswordLoading && <Loader></Loader>}
            {resetPasswordError && (
                <p className="auth-error">{resetPasswordError}</p>
            )}
        </section>
    )
}
