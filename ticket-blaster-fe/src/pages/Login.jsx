import { useState, useContext } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import '../styles/auth-user.css'

import Api from '../Api'
import AuthContext from '../context/AuthContext'
import errorHandling from '../helper/errorHandling'

import {
    InvalidMark,
    ValidMark,
    ResetPasswordSuccess,
} from '../components/validationMarks'

export default function Login() {
    const [error, setError] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [formDataErrors, setFormDataErrors] = useState({
        email: '',
        password: '',
    })
    const [validationStyle, setValidationStyle] = useState({
        email: false,
        password: false,
    })

    const navigate = useNavigate()
    const location = useLocation()
    const passwordReset = location?.state?.passwordReset
    const emailChanged = location?.state?.emailChanged

    const { handleLogin } = useContext(AuthContext)

    const handleSubmit = async (e) => {
        e.preventDefault()

        let validationResult = true
        for (let i in formDataErrors) {
            if (formDataErrors[i]) validationResult = false
        }

        if (!validationResult && email && password) {
            setError(
                'Login failed. Ensure your email and password are correctly filled.'
            )
            return
        }

        if (!email || !password) {
            setError('Login failed. Please fill out all required fields.')
            setFormDataErrors({
                email: !email
                    ? 'Please fill out this field.'
                    : formDataErrors.email,
                password: !password
                    ? 'Please fill out this field.'
                    : formDataErrors.password,
            })
            return
        }

        try {
            const res = await Api().post('/api/v1/auth/login', {
                email,
                password,
            })
            if (res.data.token) {
                handleLogin(res.data.token)
                navigate('/account/profile', { viewTransition: true })
            } else {
                setError(res.data.error || 'Login error!')
            }
        } catch (err) {
            console.log('err', err)
            let errorMessage = errorHandling(err)
            setError(`${errorMessage} Try again`)
            setValidationStyle({ email: false, password: false })
        }
    }

    return (
        <section className="login-section">
            <h1>Log In</h1>
            {passwordReset && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 60,
                        marginTop: -50,
                    }}
                >
                    <ResetPasswordSuccess />
                    <h2 style={{ margin: 0 }}>Password changed!</h2>
                    <h3 style={{ margin: 0 }}>
                        Your password has been changed successfully. Please log
                        in using your new password.
                    </h3>
                </div>
            )}
            {emailChanged && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 60,
                        marginTop: -50,
                    }}
                >
                    <ResetPasswordSuccess />
                    <h2 style={{ margin: 0 }}>Email changed!</h2>
                    <h3 style={{ margin: 0 }}>
                        Your email has been changed successfully. Please log in
                        using your new email.
                    </h3>
                </div>
            )}
            <form noValidate className="form-container" onSubmit={handleSubmit}>
                <div className="login-email">
                    <label htmlFor="email">Email</label>
                    <div>
                        <input
                            style={{
                                borderWidth: 2,
                                borderColor: formDataErrors.email
                                    ? 'red'
                                    : validationStyle.email && email
                                    ? 'green'
                                    : 'black',
                            }}
                            autoComplete="off"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            type="email"
                            required
                            minLength={5}
                            onInput={(e) => {
                                setError('')

                                if (
                                    e.target.validity.typeMismatch ||
                                    e.target.validity.valueMissing ||
                                    e.target.validity.tooShort
                                ) {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        email: e.target.validationMessage,
                                    })
                                } else {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        email: '',
                                    })
                                }
                            }}
                            onBlur={() =>
                                setValidationStyle({
                                    ...validationStyle,
                                    email: true,
                                })
                            }
                        />
                        {formDataErrors.email && validationStyle.email ? (
                            <InvalidMark />
                        ) : validationStyle.email && email ? (
                            <ValidMark />
                        ) : null}
                    </div>
                    {validationStyle.email ? (
                        <span className="validation-message">
                            {formDataErrors.email}
                        </span>
                    ) : (
                        <span className="validation-message-empty"></span>
                    )}
                </div>

                <div className="login-password">
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
                                setError('')
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
                                } else {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        password: '',
                                    })
                                }
                            }}
                            onBlur={() => {
                                setValidationStyle({
                                    ...validationStyle,
                                    password: true,
                                })
                            }}
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

                <button type="submit" className="white-button">
                    <Link to="/account/register" viewTransition>
                        Don’t have an account?
                    </Link>
                </button>
            </form>

            {error && <div className="auth-error">{error}</div>}
        </section>
    )
}
