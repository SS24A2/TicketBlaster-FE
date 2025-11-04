import { useState } from 'react'
import { Link } from 'react-router-dom'

import Api from '../Api'
import errorHandling from '../helper/errorHandling'
import { InvalidMark, ValidMark } from '../components/validationMarks'
import Loader from '../components/Loader'

export default function ForgotPassword() {
    const [error, setError] = useState(null)

    const [email, setEmail] = useState('')

    const [message, setMessage] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const [formDataErrors, setFormDataErrors] = useState({
        email: '',
    })
    const [validationStyle, setValidationStyle] = useState({
        email: false,
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        let validationResult = true
        for (let i in formDataErrors) {
            if (formDataErrors[i]) validationResult = false
        }

        if (!validationResult && email) {
            setError(
                'To request a password reset please ensure your email is correctly filled.'
            )
            return
        }

        if (!email) {
            setError(
                'Please enter your email address to request a password reset.'
            )
            setFormDataErrors({
                email: 'Please fill out this field.',
            })
            return
        }

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
            setValidationStyle({ email: false })
        }
    }

    return (
        <section className="forgot-password-section">
            <h1>Forgot Password</h1>
            <form noValidate className="form-container" onSubmit={handleSubmit}>
                <div className="forgot-password-email" style={{ height: 100 }}>
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

                <button type="submit" className="pink-button">
                    Send password reset email
                </button>

                <button type="button" className="white-button">
                    <Link to="/account/login" viewTransition>
                        Back to login
                    </Link>
                </button>
            </form>
            {message && <div>{message}</div>}
            {error && <div className="auth-error">{error}</div>}
            {isLoading && <Loader></Loader>}
        </section>
    )
}
