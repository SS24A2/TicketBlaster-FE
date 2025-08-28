import axios from 'axios'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
    // const [error, setError] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    // const navigate = useNavigate()

    const handleSubmit = async (e) => {
        //     e.preventDefault()
        //     try {
        //         const res = await axios.post(
        //             'http://localhost:10000/api/v1/login',
        //             { email, password },
        //             { headers: { 'Content-Type': 'application/json' } }
        //         )
        //         // { success: true, token: "nasiot token" }
        //         if (res.data.token) {
        //             localStorage.setItem('token', res.data.token)
        //             const decoded = decodeToken(res.data.token)
        //             if (decoded.role === 'admin') {
        //                 navigate('/users')
        //             } else {
        //                 navigate('/')
        //             }
        //         } else {
        //             setError(res.data.error || 'Login error!')
        //         }
        //     } catch (err) {
        //         console.log(err)
        //         setError('Server erorr!')
        //     }
    }

    return (
        <section className="register-section">
            <h1>Create account</h1>
            <form className="form-container" onSubmit={handleSubmit}>
                <div className="register-name">
                    <label>Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="register-email">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="register-password">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="register-password">
                    <label>Re-type Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                {/* {error && (
                    <div style={{ color: 'red' }}>{error}</div>
                )} */}
                <button type="submit" className="pink-button">
                    Create account
                </button>

                <button type="button" className="white-button">
                    <Link to="/account/login">Already have an account?</Link>
                </button>
            </form>
        </section>
    )
}
