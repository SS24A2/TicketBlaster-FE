import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'

import convertDate from '../convertDate'
import Api from '../Api'
import AuthContext from '../context/AuthContext'
import EventCard from '../components/EventCard'
import noImageIcon from '../assets/Image-not-found.png'
import ButtonGetTickets from '../components/ButtonGetTickets'

export default function Event() {
    const navigate = useNavigate()
    const { currentUser } = useContext(AuthContext)

    const [eventById, setEventById] = useState(null)
    const [relatedEvents, setRelatedEvents] = useState([])
    const [eventsImages, setEventsImages] = useState(null)

    const [numOfTickets, setNumOfTickets] = useState(1)

    let { id } = useParams()

    async function fetchEvent(eventId) {
        try {
            const response = await Api().get(`/api/v1/events/${eventId}`)
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

    async function addToCart(numTickets, eventID) {
        if (!currentUser) {
            console.log('user is not logged in to buy tickets')
            return
        }
        // add to cart logic
        console.log('addTocart Data', numTickets, eventID)
    }

    useEffect(() => {
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
                            <input
                                type="number"
                                min="1"
                                name="tickets"
                                value={numOfTickets}
                                onChange={(e) =>
                                    setNumOfTickets(e.target.value)
                                }
                            />
                            <button onClick={() => addToCart(numOfTickets, id)}>
                                {currentUser ? (
                                    <Link to="/account/profile/cart">
                                        Add to cart
                                    </Link>
                                ) : (
                                    <span
                                        onClick={
                                            () =>
                                                alert(
                                                    'Login in or register to buy cards'
                                                )
                                            //switch to modal
                                        }
                                    >
                                        Add to cart
                                    </span>
                                )}
                            </button>
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
