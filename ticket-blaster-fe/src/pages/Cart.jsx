import { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import EcommerceContext from '../context/EcommerceContext'
import EventCard from '../components/EventCard'
import noImageIcon from '../assets/Image-not-found.png'
import Api from '../Api'
import Loader from '../components/Loader'

function RemoveButton({ remove }) {
    return (
        <button style={{ color: 'white' }} onClick={remove}>
            Remove
        </button>
    )
}

export default function Cart() {
    const navigate = useNavigate()
    const { cartState, removeFromCart, changeNumTickets } =
        useContext(EcommerceContext)

    const [cartEvents, setCartEvents] = useState([])
    const [cartImages, setCartImages] = useState(null)

    const location = useLocation()
    const isBackFromCheckout = location?.state?.isBackFromCheckout

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [checkoutInProgress, setCheckoutInProgress] = useState(false)
    const [checkoutError, setCheckoutError] = useState('')

    const [newCartState, setNewCartState] = useState(cartState)

    useEffect(() => {
        //save new num of tickets to context on page leave, before that it is stored locally
        return () => {
            if (window.location.pathname !== '/account/profile/cart') {
                let cartStateUpdated = {}
                //events are taken from cartState and the number of tickets is taken from newCartState (cartState stores the events ids and newCartState stores the num of tickets)
                for (let event of Object.keys(cartState)) {
                    cartStateUpdated[event] = newCartState[event]
                }
                changeNumTickets(cartStateUpdated)
            }
        }
    }, [cartState, newCartState, changeNumTickets])

    const handleCheckout = async () => {
        let cartStateUpdated = {}
        //events are taken from cartState and the number of tickets is taken from newCartState (cartState stores the events ids and newCartState stores the num of tickets)
        for (let event of Object.keys(cartState)) {
            cartStateUpdated[event] = newCartState[event]
        }
        setCheckoutInProgress(true)
        try {
            const response = await Api().put('/api/v1/ecommerce/checkout', {
                selectedTickets: cartStateUpdated,
            })
            const reservationTime = Date.now()
            console.log('checkout response', response)

            if (!response.data || !(response.data.length > 0)) {
                setCheckoutInProgress(false)
                setCheckoutError('Something went wrong. Try again later.')
                return
            }

            navigate(
                '/account/profile/cart/checkout',
                {
                    state: {
                        reservedTickets: response.data,
                        reservationTime: reservationTime,
                    },
                },
                { viewTransition: true }
            )
        } catch (err) {
            console.log(err)
            setCheckoutInProgress(false)
            setCheckoutError(
                err.response?.data?.error || 'Something went wrong. Try again.'
            )
        }
    }

    useEffect(() => {
        async function getEventsFromCart() {
            setIsLoading(true)
            setCheckoutError('')
            try {
                if (!cartState) {
                    setIsLoading(false)
                    setError(
                        'The page is currently unavailable. Try again later.'
                    )
                    return
                }
                const eventsIdsArray = Object.keys(cartState)
                if (eventsIdsArray.length === 0) {
                    setIsLoading(false)
                    setCartEvents([])
                    setCartImages(null)
                    return
                }

                for (let event in cartState) {
                    if (!(cartState[event] > 0)) {
                        removeFromCart(event)
                        return
                    }
                }

                const eventsIdsString = eventsIdsArray.join(',')
                const response = await Api().get(
                    `/api/v1/events/cart?ids=${eventsIdsString}`
                )
                console.log('cart events response', response)

                if (!response.data?.events || !response.data?.images) {
                    setIsLoading(false)
                    setError('Internal server error. Try again later.')
                    return
                }

                setIsLoading(false)
                setCartEvents(response.data.events)
                setCartImages(response.data.images)

                const eventsIdsArrayFromDB = response.data.events.map(
                    (e) => e._id
                )

                //removes events that already occured from local storage (the data from DB contains only events that are about to happen and serves as a reference to find past events). Events not found in DB are either in the past or deleted from DB, in each case such event should not be listed in the cart (should be unavaliable for checkout)
                for (let id of eventsIdsArray) {
                    if (!eventsIdsArrayFromDB.find((i) => i === id)) {
                        removeFromCart(id)
                    }
                }
            } catch (err) {
                console.log(err)
                setIsLoading(false)
                setError(
                    err.response?.data?.error ||
                        'The page is currently unavailable. Try again later.'
                )
            }
        }
        getEventsFromCart()
    }, [cartState, removeFromCart])

    if (isLoading) {
        return (
            <div className="modal-users-events-background">
                <div className="modal-users-events">
                    <div
                        className="modal-users-events-wrapper"
                        style={{ width: 200, margin: '20px auto' }}
                    >
                        <h3 style={{ textAlign: 'center' }}>Loading</h3>
                        <div
                            style={{ margin: '50px auto' }}
                            className="loader"
                        ></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return <section>{error}</section>
    }

    return (
        <div>
            <h1>Shopping Cart</h1>
            {cartEvents.length > 0 && (
                <div>
                    {cartEvents.map((event) => {
                        return (
                            <div key={event._id}>
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
                                    ButtonComponent={
                                        <RemoveButton
                                            remove={() => {
                                                removeFromCart(event._id)
                                            }}
                                        />
                                    }
                                    hideDetails={true}
                                />
                                <div>
                                    <span>
                                        ${newCartState[event._id] * event.price}
                                        .00 USD
                                    </span>
                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            margin: 20,
                                        }}
                                    >
                                        <span
                                            style={{
                                                marginRight: 10,
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                        >
                                            <i
                                                onClick={() => {
                                                    setNewCartState({
                                                        ...newCartState,
                                                        [event._id]:
                                                            newCartState[
                                                                event._id
                                                            ] + 1,
                                                    })
                                                }}
                                                className="arrow-up"
                                            ></i>
                                            <i
                                                onClick={() => {
                                                    if (
                                                        newCartState[
                                                            event._id
                                                        ] > 1
                                                    )
                                                        setNewCartState({
                                                            ...newCartState,
                                                            [event._id]:
                                                                newCartState[
                                                                    event._id
                                                                ] - 1,
                                                        })
                                                }}
                                                className="arrow-down"
                                            ></i>
                                        </span>
                                        <span>{newCartState[event._id]}</span>
                                        <span>
                                            x ${event.price}
                                            .00 USD
                                        </span>
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            {cartEvents.length === 0 && <p>No items in cart</p>}
            <div>
                {cartEvents.length > 0 && (
                    <button
                        onClick={() =>
                            !isBackFromCheckout
                                ? navigate(-1, { viewTransition: true })
                                : navigate('/', { viewTransition: true })
                        }
                    >
                        Back
                    </button>
                )}

                <button
                    onClick={handleCheckout}
                    disabled={cartEvents.length === 0}
                >
                    Check Out
                </button>
            </div>
            {checkoutError && cartEvents.length > 0 && <p>{checkoutError}</p>}
            {checkoutInProgress && (
                <Loader>Checking Tickets Availability ... Please wait.</Loader>
            )}
            <p>
                Events that have already occurred or have been cancelled are
                automatically removed from your cart since tickets for these
                events cannot be purchased.
            </p>
        </div>
    )
}
