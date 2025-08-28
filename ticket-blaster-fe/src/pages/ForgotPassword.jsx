import axios from 'axios'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function ForgotPassword() {
    // const [error, setError] = useState('')

    const [email, setEmail] = useState('')
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
        </section>
    )
}
