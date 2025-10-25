import { useEffect, useRef, useState } from 'react'
import Api from '../Api'
import { Link, useParams } from 'react-router-dom'

export default function VerificationOutcomePage() {
    const [loadingVerificationResult, setLoadingVerificationResult] =
        useState(true)
    const [isMailVerificationSuccessful, setIsMailVerificationSuccessful] =
        useState(false)

    const [isVerificationCompleted, setIsVerificationCompleted] =
        useState(false)

    const { id, token } = useParams()

    const [verificationFailMessage, setVerificationFailMessage] = useState('')
    const [resendStatusMessage, setResendStatusMessage] = useState('')

    // controller
    let controller = useRef(null)

    useEffect(() => {
        const checkVerificationLink = async () => {
            // Cancel the previous request if it exists
            if (controller.current !== null) {
                controller.current.abort()
                setLoadingVerificationResult(false)

                //reset to null
                controller.current = null
            }

            // Create a new controller for the new request
            controller.current = new AbortController()
            setLoadingVerificationResult(true)

            try {
                const res = await Api().get(
                    `/api/v1/auth/verify/${id}/${token}`,
                    { signal: controller.current.signal }
                )
                console.log(res)
                if (res.data === 'Token is valid') {
                    setLoadingVerificationResult(false)
                    setIsMailVerificationSuccessful(true)
                    localStorage.removeItem('unverifiedAccount')
                    controller.current = null
                }
            } catch (err) {
                console.log('err', err)
                if (err.name === 'CanceledError') {
                    console.log(
                        `Previous request was canceled. Previous request url:${err.config.url}`
                    )
                    return
                }
                if (err.response?.data?.error === 'Verification completed') {
                    setIsVerificationCompleted(true)
                    setLoadingVerificationResult(false)
                    controller.current = null
                    return
                }
                if (err.status === 500) {
                    setLoadingVerificationResult(false)
                    setIsMailVerificationSuccessful(false)
                    setVerificationFailMessage('Internal server error')
                    controller.current = null
                    return
                }
                if (err.response?.data?.error === 'User not found!') {
                    setLoadingVerificationResult(false)
                    setIsMailVerificationSuccessful(false)
                    setVerificationFailMessage(
                        'Account not found! Please create a new account.'
                    )
                    controller.current = null
                    return
                }
                setLoadingVerificationResult(false)
                setIsMailVerificationSuccessful(false)
                setVerificationFailMessage(
                    'The verification link is either invalid or has expired.'
                )
                controller.current = null
            }
        }

        checkVerificationLink()
    }, [id, token])

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
            setResendStatusMessage(
                'Unfortunately, we are unable to send your verification email at this time. Please try again later.'
            )
        }
    }

    if (loadingVerificationResult) {
        return (
            <div>
                <h3>Verification is in progress, please wait.</h3>
                <div className="loader"></div>
            </div>
        )
    }

    if (isVerificationCompleted) {
        return (
            <div>
                <h2>
                    The email address has already been verified, you can login
                    now.
                </h2>
                <button>
                    <Link to="/account/login" viewTransition>
                        Log in
                    </Link>
                </button>
            </div>
        )
    }

    if (verificationFailMessage === 'Internal server error') {
        return (
            <div>
                <h1>500</h1>
                <h2>Internal Server Error!</h2>
            </div>
        )
    }

    if (
        verificationFailMessage ===
        'Account not found! Please create a new account.'
    ) {
        return (
            <div>
                <h2>Verification Failed!</h2>
                {verificationFailMessage && <h5>{verificationFailMessage}</h5>}
                <button>
                    <Link to="/account/register" viewTransition>
                        Create Account
                    </Link>
                </button>
            </div>
        )
    }

    if (isMailVerificationSuccessful) {
        return (
            <div>
                <h2>Verified!</h2>
                <h4>Your account has been successfully verified.</h4>
                <button>
                    <Link to="/account/login" viewTransition>
                        Log in
                    </Link>
                </button>
            </div>
        )
    } else {
        return (
            <div>
                <h2>Verification Failed!</h2>
                {verificationFailMessage && <h5>{verificationFailMessage}</h5>}
                <p>Please request a new verification email.</p>

                <button onClick={resendVerificationMail}>
                    Resend verification email
                </button>
                {resendStatusMessage && <p>{resendStatusMessage}</p>}
            </div>
        )
    }
}
