import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'

import convertDate from '../convertDate'
import Api from '../Api'
import AuthContext from '../context/AuthContext'
import EcommerceContext from '../context/EcommerceContext'
import EventCard from '../components/EventCard'
import noImageIcon from '../assets/Image-not-found.png'
import ButtonGetTickets from '../components/ButtonGetTickets'

export default function Event() {
    const navigate = useNavigate()
    const { currentUser } = useContext(AuthContext)
    const { addToCart, cartState } = useContext(EcommerceContext)

    const [eventById, setEventById] = useState(null)
    const [relatedEvents, setRelatedEvents] = useState([])
    const [eventsImages, setEventsImages] = useState(null)

    const [numOfTickets, setNumOfTickets] = useState(1)
    const [cartError, setCartError] = useState('')

    let { id } = useParams()

    async function handleAddToCart() {
        try {
            if (!currentUser)
                return setCartError(
                    'Log in or create an account to buy tickets.'
                )

            const response = await Api().get(`api/v1/ecommerce/${id}`)
            // response.data - tickets not sold or reserved in DB; cartState[id] - tickets already selected by the user
            const numAvailableTickets = cartState[id]
                ? response.data - parseInt(cartState[id])
                : response.data
            if (numOfTickets > numAvailableTickets) {
                if (cartState[id]) {
                    numAvailableTickets === 0
                        ? setCartError(
                              `You already have ${cartState[id]} tickets in your cart. No more tickets are available at the moment! Check again later!`
                          )
                        : setCartError(
                              `You already have ${cartState[id]} tickets in your cart. Only ${numAvailableTickets} more tickets are available at the moment!`
                          )
                } else {
                    numAvailableTickets === 0
                        ? setCartError(
                              `No tickets available at the moment! Check again later!`
                          )
                        : setCartError(
                              `Only ${numAvailableTickets} tickets are available at the moment!`
                          )
                }
                return
            }
            setCartError('')
            addToCart(id, numOfTickets)
            navigate('/account/profile/cart')
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        async function fetchEvent() {
            try {
                const response = await Api().get(`/api/v1/events/${id}`)
                console.log(response)
                setEventById(response.data.event)
                setEventsImages(response.data.images)
                if (
                    response.data.event.relatedEvents?.length > 0 &&
                    response.data.event.relatedEvents[0]?._id
                ) {
                    setRelatedEvents(response.data.event.relatedEvents)
                } else {
                    setRelatedEvents([])
                }
            } catch (err) {
                console.log(err)
            }
        }
        fetchEvent(id)
    }, [id])

    if (!eventById) {
        return <div>LOADING EVENT PAGE</div>
    }

    return (
        <div className="event-page">
            <div className="event-main-details">
                <h1>{eventById.name}</h1>
                <span>{convertDate(eventById.date)}</span>
                <span>{eventById.location}</span>
            </div>
            <div className="event-details">
                <img
                    src={
                        eventsImages[eventById._id]
                            ? `${import.meta.env.VITE_REACT_APP_BACKEND_API}/${
                                  eventsImages[eventById._id]
                              }`
                            : noImageIcon
                    }
                    alt="event-image"
                />
                <div className="event-about-tickets">
                    <div className="event-about">
                        <h4>About</h4>
                        <p>{eventById.details}</p>
                    </div>
                    <div className="event-tickets">
                        <div className="tickets-price">
                            <span>Tickets</span>
                            <span>${eventById.price}.00 USD</span>
                        </div>
                        <div className="tickets-cart">
                            <span
                                onClick={() => {
                                    if (numOfTickets > 1)
                                        setNumOfTickets(numOfTickets - 1)
                                }}
                            >
                                -
                            </span>
                            <span style={{ margin: 20 }}>{numOfTickets}</span>
                            <span
                                onClick={() =>
                                    setNumOfTickets(numOfTickets + 1)
                                }
                            >
                                +
                            </span>
                            <button onClick={handleAddToCart}>
                                Add to cart
                            </button>
                            {cartError && <p>{cartError}</p>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="related-events">
                <h4>Related Acts</h4>

                {relatedEvents.length > 0 ? (
                    <div>
                        {relatedEvents.map((relE) => (
                            <EventCard
                                key={relE._id}
                                event={relE}
                                imageSrc={
                                    eventsImages[relE._id]
                                        ? `${
                                              import.meta.env
                                                  .VITE_REACT_APP_BACKEND_API
                                          }/${eventsImages[relE._id]}`
                                        : noImageIcon
                                }
                                ButtonComponent={
                                    <ButtonGetTickets eventId={relE._id} />
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{}}>
                        No Related Acts available for this Event
                    </div>
                )}
            </div>
        </div>
    )
}
