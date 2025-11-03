import { useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation, useBlocker } from 'react-router-dom'

import EventCard from '../components/EventCard'
import EcommerceContext from '../context/EcommerceContext'
import noImageIcon from '../assets/Image-not-found.png'
import { InvalidMark, ValidMark } from '../components/validationMarks'
import '../App.css'
import '../styles/modal.css'
import '../styles/tickets.css'
import '../styles/checkout.css'

import Api from '../Api'
import Loader from '../components/Loader'

export default function CartCheckOut() {
    const navigate = useNavigate()
    const { cartState, emptyCart } = useContext(EcommerceContext)

    const location = useLocation()
    const reservedTickets = location?.state?.reservedTickets
    const reservationTime = location?.state?.reservationTime

    const [fullname, setFullname] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [cardExpiry, setCardExpiry] = useState('')
    const [pin, setPin] = useState('')

    const [cartEvents, setCartEvents] = useState([])
    const [cartImages, setCartImages] = useState(null)

    const [eventsLoading, setEventsLoading] = useState(false)
    const [eventsError, setEventsError] = useState(null)

    const [checkoutExpired, setCheckoutExpired] = useState(false)
    const [goBackModal, setGoBackModal] = useState(false)

    const [paymentLoading, setPaymentLoading] = useState(false)
    const [paymentError, setPaymentError] = useState(null)

    const [formDataErrors, setFormDataErrors] = useState({
        fullname: '',
        cardNumber: '',
        cardExpiry: '',
        pin: '',
    })
    const [validationStyle, setValidationStyle] = useState({
        fullname: false,
        cardNumber: false,
        cardExpiry: false,
        pin: false,
    })

    const shouldBlock = useCallback(
        ({ nextLocation }) =>
            !checkoutExpired &&
            !eventsError &&
            nextLocation.pathname !== '/account/profile/cart/final',
        [checkoutExpired, eventsError]
    )
    const blocker = useBlocker(shouldBlock)

    if (blocker.state === 'blocked' && !goBackModal) {
        setGoBackModal(true)
    }

    const handlePayment = async (e) => {
        e.preventDefault()

        let validationResult = true
        for (let i in formDataErrors) {
            if (formDataErrors[i]) validationResult = false
        }

        if (!validationResult && fullname && cardNumber && cardExpiry && pin) {
            setPaymentError(
                'Payment failed. Ensure all the data are correctly filled.'
            )
            return
        }

        if (!fullname || !cardNumber || !cardExpiry || !pin) {
            setPaymentError(
                'Payment failed. Please fill out all required fields.'
            )
            setFormDataErrors({
                fullname: !fullname
                    ? 'Please fill out this field.'
                    : formDataErrors.fullname,
                cardNumber: !cardNumber
                    ? 'Please fill out this field.'
                    : formDataErrors.cardNumber,
                cardExpiry: !cardExpiry
                    ? 'Please fill out this field.'
                    : formDataErrors.cardExpiry,
                pin: !pin ? 'Please fill out this field.' : formDataErrors.pin,
            })
            setValidationStyle({
                fullname: true,
                cardNumber: true,
                cardExpiry: true,
                pin: true,
            })
            return
        }

        setPaymentLoading(true)

        try {
            const response = await Api().put('/api/v1/ecommerce/payment', {
                reservedTickets: reservedTickets,
            })
            console.log(response)

            navigate(
                '/account/profile/cart/final',
                {
                    state: {
                        archivedCart: cartState,
                        purchasedTickets: reservedTickets,
                    },
                },
                { viewTransition: true }
            )

            emptyCart()
        } catch (err) {
            console.log(err)
            setPaymentLoading(false)
            setPaymentError(
                err?.response?.data?.error ||
                    'Something went wrong, please try again.'
            )
            if (
                err?.response?.data?.error ===
                'Tickets reservation has expired!'
            )
                setCheckoutExpired(true)
        }
    }

    useEffect(() => {
        return () => {
            const cancelReservation = async () => {
                try {
                    const response = await Api().put(
                        '/api/v1/ecommerce/checkout/cancel'
                    )
                    console.log(response)
                } catch (err) {
                    console.log(err)
                }
            }
            if (
                window.location.pathname !== '/account/profile/cart/checkout' &&
                window.location.pathname !== '/account/profile/cart/final'
            )
                cancelReservation()
        }
    }, [])

    useEffect(() => {
        // Check every second if the reservation expired
        const timerId = setInterval(() => {
            const timeNow = Date.now()
            //reservation expired (after 10 minutes)
            if (timeNow >= reservationTime + 600000) {
                setCheckoutExpired(true)
                clearInterval(timerId) // Stop the interval after execution
            }
        }, 1000)

        return () => {
            clearInterval(timerId)
        }
    }, [reservationTime])

    useEffect(() => {
        async function getEventsFromCart() {
            setEventsLoading(true)
            try {
                if (!cartState || Object.keys(cartState).length === 0) {
                    setEventsLoading(false)
                    setEventsError(
                        'Something went wrong. Add the tickets to your cart again before initiating the checkout process.'
                    )
                    return
                }

                const eventsIdsArray = Object.keys(cartState)
                const eventsIdsString = eventsIdsArray.join(',')

                const response = await Api().get(
                    `/api/v1/events/cart?ids=${eventsIdsString}`
                )
                console.log('checkout events response', response)

                if (!response?.data?.events || !response?.data?.images) {
                    setEventsLoading(false)
                    setEventsError('Internal Server Error')
                    return
                }

                setEventsLoading(false)
                setCartEvents(response.data.events)
                setCartImages(response.data.images)
            } catch (err) {
                console.log(err)
                setEventsLoading(false)
                setEventsError(
                    err?.response?.data?.error ||
                        'Something went wrong. Go back to your cart and try again.'
                )
            }
        }
        getEventsFromCart()
    }, [cartState])

    if (eventsLoading) return <Loader></Loader>
    if (eventsError) return <h2 className="checkout-page">{eventsError}</h2>

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>
            <div className="checkout-page-wrapper">
                <div className="checkout-inner-tickets">
                    <div className="checkout-inner-tickets-all">
                        {cartEvents.map((event) => (
                            <div className="event-card-wrapper" key={event._id}>
                                <EventCard
                                    event={event}
                                    imageSrc={
                                        cartImages[event._id]
                                            ? `${
                                                  import.meta.env
                                                      .VITE_REACT_APP_BACKEND_API
                                              }/${cartImages[event._id]}`
                                            : noImageIcon
                                    }
                                    hideDetails={true}
                                />
                                <div className="tickets-price">
                                    <span>
                                        $
                                        {(
                                            cartState[event._id] * event.price
                                        ).toFixed(2)}{' '}
                                        USD
                                    </span>
                                    <span>
                                        {cartState[event._id]} x $
                                        {event.price.toFixed(2)} USD
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="total-price">
                        <span>Total:</span>
                        <span>
                            $
                            {cartEvents
                                .reduce(
                                    (accumulator, currentValue) =>
                                        accumulator +
                                        cartState[currentValue._id] *
                                            currentValue.price,
                                    0
                                )
                                .toFixed(2)}{' '}
                            USD
                        </span>
                    </div>
                </div>
                <form
                    className="checkout-inner-form"
                    noValidate
                    onSubmit={handlePayment}
                >
                    <div className="checkout-name">
                        <label htmlFor="fullname">Full Name</label>
                        <div className="input-wrapper">
                            <input
                                style={{
                                    borderStyle: 'solid',
                                    borderWidth: 2,
                                    borderColor: formDataErrors.fullname
                                        ? 'red'
                                        : validationStyle.fullname && fullname
                                        ? 'green'
                                        : 'black',
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
                                    setPaymentError('')
                                    if (e.target.validity.valueMissing) {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            fullname:
                                                e.target.validationMessage,
                                        })
                                    } else if (
                                        e.target.validity.patternMismatch
                                    ) {
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
                            {formDataErrors.fullname &&
                            validationStyle.fullname ? (
                                <InvalidMark />
                            ) : validationStyle.fullname && fullname ? (
                                <ValidMark />
                            ) : null}
                            {fullname.length === 40 && (
                                <span
                                    style={{
                                        fontSize: 12,
                                        paddingLeft: 10,
                                        position: 'absolute',
                                        left: 360,
                                        bottom: 14,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    You have reached maximum number od
                                    characters (40).
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
                    <div className="checkout-cardNum">
                        <label htmlFor="cardNum">Card No.</label>
                        <div className="input-wrapper">
                            <input
                                style={{
                                    borderStyle: 'solid',
                                    borderWidth: 2,
                                    borderColor: formDataErrors.cardNumber
                                        ? 'red'
                                        : validationStyle.cardNumber &&
                                          cardNumber
                                        ? 'green'
                                        : 'black',
                                }}
                                autoComplete="off"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                id="cardNum"
                                type="text"
                                required
                                pattern="^(?:\d[\-\s]*?){16}$"
                                onInput={(e) => {
                                    setPaymentError('')
                                    if (e.target.validity.valueMissing) {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            cardNumber:
                                                e.target.validationMessage,
                                        })
                                    } else if (
                                        e.target.validity.patternMismatch
                                    ) {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            cardNumber:
                                                'Enter a 16-digit number, optionally separated by spaces or hyphens',
                                        })
                                    } else {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            cardNumber: '',
                                        })
                                    }
                                }}
                                onBlur={() =>
                                    setValidationStyle({
                                        ...validationStyle,
                                        cardNumber: true,
                                    })
                                }
                            />
                            {formDataErrors.cardNumber &&
                            validationStyle.cardNumber ? (
                                <InvalidMark />
                            ) : validationStyle.cardNumber && cardNumber ? (
                                <ValidMark />
                            ) : null}
                        </div>
                        {validationStyle.cardNumber ? (
                            <span className="validation-message">
                                {formDataErrors.cardNumber}
                            </span>
                        ) : (
                            <span className="validation-message-empty"></span>
                        )}
                    </div>
                    <div className="checkout-cardExpiry">
                        <label htmlFor="cardExpiry">Expires</label>
                        <div className="input-wrapper">
                            <input
                                style={{
                                    borderStyle: 'solid',
                                    borderWidth: 2,
                                    borderColor: formDataErrors.cardExpiry
                                        ? 'red'
                                        : validationStyle.cardExpiry &&
                                          cardExpiry
                                        ? 'green'
                                        : 'black',
                                }}
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                id="cardExpiry"
                                type="month"
                                required
                                max={`${new Date().getFullYear() + 5}-12`}
                                min={`${new Date().getFullYear()}-01`}
                                onInput={(e) => {
                                    setPaymentError('')
                                    if (e.target.validity.valueMissing) {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            cardExpiry:
                                                e.target.validationMessage,
                                        })
                                    } else if (
                                        new Date(e.target.value) <
                                        new Date(
                                            `${new Date().getFullYear()}-${
                                                new Date().getMonth() + 1
                                            }`
                                        )
                                    ) {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            cardExpiry: 'Credit card expired!',
                                        })
                                    } else {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            cardExpiry: '',
                                        })
                                    }
                                }}
                                onBlur={() =>
                                    setValidationStyle({
                                        ...validationStyle,
                                        cardExpiry: true,
                                    })
                                }
                            />
                            {formDataErrors.cardExpiry &&
                            validationStyle.cardExpiry ? (
                                <InvalidMark />
                            ) : validationStyle.cardExpiry && cardExpiry ? (
                                <ValidMark />
                            ) : null}
                        </div>

                        {validationStyle.cardExpiry ? (
                            <span className="validation-message">
                                {formDataErrors.cardExpiry}
                            </span>
                        ) : (
                            <span className="validation-message-empty"></span>
                        )}
                    </div>
                    <div className="checkout-pin">
                        <label htmlFor="pin">PIN</label>
                        <div className="input-wrapper">
                            <input
                                autoComplete="off"
                                style={{
                                    borderStyle: 'solid',
                                    borderWidth: 2,
                                    borderColor: formDataErrors.pin
                                        ? 'red'
                                        : validationStyle.pin && pin
                                        ? 'green'
                                        : 'black',
                                }}
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                id="pin"
                                type="text"
                                required
                                pattern="^(\d{4}|\d{6})$"
                                onInput={(e) => {
                                    setPaymentError('')
                                    if (e.target.validity.valueMissing) {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            pin: e.target.validationMessage,
                                        })
                                    } else if (
                                        e.target.validity.patternMismatch
                                    ) {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            pin: 'Enter a 4 or 6-digit number. Only numbers are allowed.',
                                        })
                                    } else {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            pin: '',
                                        })
                                    }
                                }}
                                onBlur={() =>
                                    setValidationStyle({
                                        ...validationStyle,
                                        pin: true,
                                    })
                                }
                            />
                            {formDataErrors.pin && validationStyle.pin ? (
                                <InvalidMark />
                            ) : validationStyle.pin && pin ? (
                                <ValidMark />
                            ) : null}
                        </div>

                        {validationStyle.pin ? (
                            <span className="validation-message">
                                {formDataErrors.pin}
                            </span>
                        ) : (
                            <span className="validation-message-empty"></span>
                        )}
                    </div>

                    <div className="checkout-buttons">
                        <button
                            type="button"
                            onClick={() => {
                                navigate(
                                    '/account/profile/cart',
                                    {
                                        state: { isBackFromCheckout: true },
                                    },
                                    { viewTransition: true }
                                )
                            }}
                        >
                            Back
                        </button>
                        <button type="submit">Pay Now</button>
                    </div>
                    {paymentError && (
                        <h2 className="payment-error">{paymentError}</h2>
                    )}
                </form>
            </div>
            {paymentLoading && <Loader></Loader>}

            {checkoutExpired && (
                <div className="modal-users-events-background">
                    <div className="modal-users-events">
                        <div className="modal-users-events-wrapper">
                            <h4>Checkout session expired!</h4>
                            <p>
                                Sorry, your session has expired. Go back to your
                                shopping cart and initiate a new purchase.
                            </p>

                            <button
                                className="modal-users-events-confirm-button"
                                onClick={() => {
                                    navigate(
                                        '/account/profile/cart',
                                        {
                                            state: {
                                                isBackFromCheckout: true,
                                            },
                                        },
                                        { viewTransition: true }
                                    )
                                }}
                            >
                                Back to cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {!checkoutExpired && goBackModal && (
                <div className="modal-users-events-background">
                    <div className="modal-users-events">
                        <div className="modal-users-events-wrapper">
                            <h4>Are you sure you want to leave this page?</h4>
                            <p>
                                If you leave the checkout page, your tickets
                                reservation will be canceled.
                            </p>
                            <div
                                className="modal-users-events-buttons"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <button
                                    onClick={() => {
                                        setGoBackModal(false)
                                        if (blocker.state === 'blocked') {
                                            blocker.reset()
                                        }
                                    }}
                                >
                                    No
                                </button>
                                <button
                                    className="modal-users-events-confirm-button"
                                    onClick={() => {
                                        setGoBackModal(false)
                                        if (blocker.state === 'blocked') {
                                            setTimeout(
                                                () => blocker.proceed(),
                                                1000
                                            )
                                        }
                                    }}
                                >
                                    Yes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
