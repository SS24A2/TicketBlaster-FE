import { Link, useLocation } from 'react-router-dom'
import Api from '../Api'
import { useEffect, useState } from 'react'

export default function VerificationInfoPage() {
    const location = useLocation()
    const isVerificationMailSent = location?.state?.isVerificationMailSent

    const [id, setId] = useState(
        localStorage.getItem('unverifiedAccount') || null
    )
    const [isVerificationCompleted, setIsVerificationCompleted] = useState(
        id ? false : true
    )

    const [resendStatusMessage, setResendStatusMessage] = useState('')

    useEffect(() => {
        const readLSData = (e) => {
            if (
                e.storageArea === localStorage &&
                e.key === 'unverifiedAccount'
            ) {
                setId(localStorage.getItem('unverifiedAccount') || null)
                setIsVerificationCompleted(
                    localStorage.getItem('unverifiedAccount') ? false : true
                )
            }
        }
        window.addEventListener('storage', readLSData)
        return () => window.removeEventListener('storage', readLSData)
    }, [])

    async function resendVerificationMail() {
        setResendStatusMessage(
            'We are sending a new verification email, please wait.'
        )
        try {
            const response = await Api().get(`api/v1/auth/verifyResend/${id}`)
            console.log(response)

            if (response.data) setResendStatusMessage(response.data)
        } catch (err) {
            console.log(err)
            if (err.response?.data?.error === 'Verification completed') {
                setIsVerificationCompleted(true)
                return
            }
            if (err.response?.data?.error === 'User not found!') {
                setResendStatusMessage(
                    'Account not found! Please create a new account.'
                )
                return
            }
            setResendStatusMessage(
                'Unfortunately, we are unable to send your verification email at this time. Please try again later.'
            )
        }
    }

    if (isVerificationCompleted && isVerificationMailSent) {
        return (
            <div>
                <h2>The email address has been verified, you can login now.</h2>
                <button>
                    <Link to="/account/login" viewTransition>
                        Log in
                    </Link>
                </button>
            </div>
        )
    }

    if (isVerificationMailSent) {
        return (
            <div>
                <h2>Verify your account</h2>
                <p>
                    A verification email has been sent to your email address.
                    Please check your mailbox to verify the account before you
                    log in.
                </p>
                <button onClick={resendVerificationMail}>
                    Resend verification email
                </button>
                {resendStatusMessage && <p>{resendStatusMessage}</p>}
            </div>
        )
    } else {
        return (
            <div>
                <h2>
                    Unfortunately, we are unable to send your verification email
                    at this time. Please try again later, or visit our support
                    page if the problem persists.
                </h2>
                <button>
                    <Link to="/account/register" viewTransition>
                        Go Back
                    </Link>
                </button>
            </div>
        )
    }
}
