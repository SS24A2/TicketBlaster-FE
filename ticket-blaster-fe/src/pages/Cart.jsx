import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import EcommerceContext from '../context/EcommerceContext'
import EventCard from '../components/EventCard'
import noImageIcon from '../assets/Image-not-found.png'
import Api from '../Api'

function RemoveButton({ remove }) {
    return (
        <button style={{ color: 'white' }} onClick={remove}>
            Remove
        </button>
    )
}

export default function Cart() {
    const navigate = useNavigate()
    const { cartState, removeFromCart } = useContext(EcommerceContext)

    const [cartEvents, setCartEvents] = useState([])
    const [cartImages, setCartImages] = useState(null)

    const location = useLocation()
    const isBackFromCheckout = location?.state?.isBackFromCheckout

    const [checkoutError, setCheckoutError] = useState('')

    const handleCheckout = async () => {
        try {
            const response = await Api().put('/api/v1/ecommerce/checkout', {
                selectedTickets: cartState,
            })
            console.log('checkout response', response)
            setCheckoutError('')
            navigate('/account/profile/cart/checkout', {
                state: { reservedTickets: response.data },
            })
        } catch (err) {
            console.log(err)
            setCheckoutError(err.response.data.error)
        }
    }

    useEffect(() => {
        const eventsIdsArray = Object.keys(cartState)
        if (eventsIdsArray.length === 0) {
            setCartEvents([])
            setCartImages(null)
            return
        }
        const eventsIdsString = eventsIdsArray.join(',')

        async function getEventsFromCart() {
            try {
                const response = await Api().get(
                    `/api/v1/events/cart?ids=${eventsIdsString}`
                )
                console.log('cart events response', response)

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
            }
        }
        getEventsFromCart()
    }, [cartState, removeFromCart])

    return (
        <div>
            <h1>Shopping Cart</h1>
            {Object.keys(cartState).length > 0 && (
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
                                        ${cartState[event._id] * event.price}.00
                                        USD
                                    </span>
                                    <span>
                                        {cartState[event._id]} x ${event.price}
                                        .00 USD
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            {Object.keys(cartState).length === 0 && <p>No items in cart</p>}
            <div>
                {Object.keys(cartState).length > 0 && (
                    <button
                        onClick={() =>
                            !isBackFromCheckout ? navigate(-1) : navigate('/')
                        }
                    >
                        Back
                    </button>
                )}
                <button
                    onClick={handleCheckout}
                    disabled={Object.keys(cartState).length === 0}
                >
                    Check Out
                </button>
            </div>
            {checkoutError && Object.keys(cartState).length > 0 && (
                <p>{checkoutError}</p>
            )}
        </div>
    )
}
