import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import Api from '../Api'
import { InvalidMark, ValidMark } from '../components/validationMarks'
import errorHandling from '../helper/errorHandling'

export default function Register() {
    const [error, setError] = useState('')
    const [fullname, setFullname] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const navigate = useNavigate()

    const [formDataErrors, setFormDataErrors] = useState({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [validationStyle, setValidationStyle] = useState({
        fullname: false,
        email: false,
        password: false,
        confirmPassword: false,
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        let validationResult = true
        for (let i in formDataErrors) {
            if (formDataErrors[i]) validationResult = false
        }

        if (
            !validationResult &&
            email &&
            password &&
            fullname &&
            confirmPassword
        ) {
            setError(
                'Registration failed. Ensure all the data are correctly filled.'
            )
            return
        }

        if (!email || !password || !fullname || !confirmPassword) {
            setError(
                'Registration failed. Please fill out all required fields.'
            )
            setFormDataErrors({
                fullname: !fullname
                    ? 'Please fill out this field.'
                    : formDataErrors.fullname,
                email: !email
                    ? 'Please fill out this field.'
                    : formDataErrors.email,
                password: !password
                    ? 'Please fill out this field.'
                    : formDataErrors.password,
                confirmPassword: !confirmPassword
                    ? 'Please fill out this field.'
                    : formDataErrors.confirmPassword,
            })
            setValidationStyle({
                fullname: true,
                email: true,
                password: true,
                confirmPassword: true,
            })
            return
        }

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
            setValidationStyle({
                fullname: false,
                email: false,
                password: false,
                confirmPassword: false,
            })
        }
    }

    return (
        <section className="register-section">
            <h1>Create account</h1>
            <form noValidate className="form-container" onSubmit={handleSubmit}>
                <div className="register-name" style={{ height: 100 }}>
                    <label htmlFor="fullname">Full Name</label>
                    <div>
                        <input
                            style={{
                                borderWidth: 2,
                                borderColor: formDataErrors.fullname
                                    ? 'red'
                                    : validationStyle.fullname && fullname
                                    ? 'green'
                                    : 'black',
                                paddingRight: 25,
                            }}
                            autoComplete="off"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            id="fullname"
                            type="text"
                            required
                            pattern="^[A-Z]{1}[a-z]{1,}(?: [A-Z]{1}[a-z]{1,}){1,3}$"
                            maxLength={40}
                            onInput={(e) => {
                                setError('')
                                if (e.target.validity.valueMissing) {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        fullname: e.target.validationMessage,
                                    })
                                } else if (e.target.validity.patternMismatch) {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        fullname:
                                            'Please match the requested format: 2-4 words (separated with 1 space) each of them starting with capital letter and then at least one lowercase letter.',
                                    })
                                } else {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        fullname: '',
                                    })
                                }
                            }}
                            onBlur={() =>
                                setValidationStyle({
                                    ...validationStyle,
                                    fullname: true,
                                })
                            }
                        />
                        {formDataErrors.fullname && validationStyle.fullname ? (
                            <InvalidMark />
                        ) : validationStyle.fullname && fullname ? (
                            <ValidMark />
                        ) : null}
                        {fullname.length === 40 && (
                            <span style={{ marginLeft: 10, fontSize: 14 }}>
                                You have reached maximum number od characters
                                (40).
                            </span>
                        )}
                    </div>
                    {validationStyle.fullname ? (
                        <span className="validation-message">
                            {formDataErrors.fullname}
                        </span>
                    ) : (
                        <span className="validation-message-empty"></span>
                    )}
                </div>

                <div className="register-email">
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

                <div className="register-password">
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
                                    setValidationStyle({
                                        ...validationStyle,
                                        confirmPassword: true,
                                    })
                                } else if (!confirmPassword) {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        confirmPassword:
                                            'Please fill out this field.',
                                        password: '',
                                    })
                                    setValidationStyle({
                                        ...validationStyle,
                                        confirmPassword: true,
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
                <div className="register-password">
                    <label htmlFor="confirmPassword">Re-type password</label>
                    <div>
                        <input
                            style={{
                                borderWidth: 2,
                                borderColor:
                                    formDataErrors.confirmPassword &&
                                    validationStyle.confirmPassword
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
                                setError('')
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
                            onBlur={() => {
                                if (password && !formDataErrors.password)
                                    setValidationStyle({
                                        ...validationStyle,
                                        confirmPassword: true,
                                    })
                            }}
                        />
                        {formDataErrors.confirmPassword &&
                        validationStyle.confirmPassword ? (
                            <InvalidMark />
                        ) : validationStyle.confirmPassword &&
                          confirmPassword &&
                          password ? (
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
