import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import noImageIcon from '../assets/Image-not-found.png'
import EventCard from '../components/EventCard'
import Api from '../Api'
import nextIcon from '../assets/icon-next.svg'
import previousIcon from '../assets/icon-previous.svg'

function PrintButton({ printTicket, style }) {
    return (
        <button
            onClick={printTicket}
            style={{ ...style, color: 'white', border: 'none' }}
        >
            Print
        </button>
    )
}

export default function CartFinal() {
    const location = useLocation()
    const purchasedTickets = location?.state?.purchasedTickets
    const archivedCart = location?.state?.archivedCart

    const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false)
    const [ticketIndex, setTicketIndex] = useState(0)
    const [allTickets, setAllTickets] = useState([])
    const [ticketsforSelectedEvent, setTicketsforSelectedEvent] = useState([])

    const [cartEvents, setCartEvents] = useState([])
    const [cartImages, setCartImages] = useState(null)

    const [modalBackgroundBlink, setModalBackgroundBlink] = useState(false)

    const [loadingEvents, setLoadingEvents] = useState(false)
    const [loadingTickets, setLoadingTickets] = useState(false)

    const [eventsError, setEventsError] = useState(false)
    const [ticketsError, setTicketsError] = useState(null)

    useEffect(() => {
        async function getEventsFromCart() {
            setLoadingEvents(true)
            try {
                if (!archivedCart || Object.keys(archivedCart).length === 0) {
                    setLoadingEvents(false)
                    setEventsError(true)
                    return
                }

                const eventsIdsArray = Object.keys(archivedCart)
                const eventsIdsString = eventsIdsArray.join(',')

                const response = await Api().get(
                    `/api/v1/events/cart?ids=${eventsIdsString}`
                )
                console.log('cart events response', response)

                if (
                    !response.data?.events ||
                    !response.data?.events.length > 0 ||
                    !response.data?.images
                ) {
                    setLoadingEvents(false)
                    setEventsError(true)
                    return
                }
                setLoadingEvents(false)
                setCartEvents(response.data.events)
                setCartImages(response.data.images)
            } catch (err) {
                console.log(err)
                setLoadingEvents(false)
                setEventsError(true)
            }
        }
        getEventsFromCart()
    }, [archivedCart])

    useEffect(() => {
        async function getTickets() {
            setLoadingTickets(true)
            try {
                if (
                    !purchasedTickets?.length ||
                    purchasedTickets.length === 0
                ) {
                    setLoadingTickets(false)
                    setTicketsError('all')
                    return
                }
                const ticketsIds = purchasedTickets.join(',')
                const response = await Api().get(
                    `/api/v1/ecommerce/tickets/print?ids=${ticketsIds}`
                )
                console.log(response)
                if (!response.data?.length || response.data?.length === 0) {
                    setLoadingTickets(false)
                    setTicketsError('all')
                    return
                }
                setLoadingTickets(false)
                setAllTickets(response.data)
            } catch (err) {
                console.log(err)
                setLoadingTickets(false)
                setTicketsError('all')
            }
        }
        getTickets()
    }, [purchasedTickets])

    return (
        <div>
            {cartEvents.length > 0 && <h1>Thank you for your purchase!</h1>}
            {cartEvents.length > 0 && (
                <div>
                    {cartEvents.map((event) => (
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
                                    <PrintButton
                                        printTicket={() => {
                                            if (ticketsError === 'all') return
                                            if (
                                                allTickets.filter(
                                                    (t) =>
                                                        t.eventId === event._id
                                                ).length === 0
                                            ) {
                                                setTicketsError(event._id)
                                                return
                                            }
                                            setIsTicketsModalOpen(true)
                                            setTicketsError(null)
                                            setTicketsforSelectedEvent([
                                                ...allTickets.filter(
                                                    (t) =>
                                                        t.eventId === event._id
                                                ),
                                            ])
                                        }}
                                        style={{
                                            opacity:
                                                ticketsError === 'all'
                                                    ? '0.5'
                                                    : '1',
                                        }}
                                    />
                                }
                                hideDetails={true}
                            />
                            {ticketsError === event._id && (
                                <p>
                                    Sorry, your tickets are currently
                                    unavailable. Check Tickets History page or
                                    your email to print the tickets.
                                </p>
                            )}
                            <div>
                                <span>
                                    ${archivedCart[event._id] * event.price}.00
                                    USD
                                </span>
                                <span>
                                    {archivedCart[event._id]} x ${event.price}
                                    .00 USD
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {ticketsError === 'all' && !loadingEvents && !eventsError && (
                <p>
                    Sorry, your tickets are currently unavailable. Check Tickets
                    History page or your email to print the tickets.
                </p>
            )}
            {eventsError && (
                <div>
                    The page is currently unavailable. Open the Tickets History
                    page or your email to find the purchased tickets.
                </div>
            )}
            {(loadingEvents || loadingTickets) && !eventsError && (
                <div className="modal-users-events-background">
                    <div className="modal-users-events">
                        <div
                            className="modal-users-events-wrapper"
                            style={{ width: 200, margin: '20px auto' }}
                        >
                            <h3 style={{ textAlign: 'center' }}>Loading ...</h3>
                            <div
                                style={{ margin: '50px auto' }}
                                className="loader"
                            ></div>
                        </div>
                    </div>
                </div>
            )}
            {isTicketsModalOpen && (
                <div
                    className={`modal-tickets-background  ${
                        modalBackgroundBlink ? 'blinking-effect' : ''
                    }`}
                    onClick={() => {
                        setModalBackgroundBlink(true)
                        setTimeout(() => {
                            setModalBackgroundBlink(false)
                        }, 500)
                    }}
                >
                    <div className="modal-tickets">
                        <div
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsTicketsModalOpen(false)
                                setTicketIndex(0)
                            }}
                            dangerouslySetInnerHTML={{
                                __html: ticketsforSelectedEvent[ticketIndex]
                                    .ticket,
                            }}
                        ></div>
                        {ticketsforSelectedEvent.length > 1 &&
                            ticketIndex <
                                ticketsforSelectedEvent.length - 1 && (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setTicketIndex(
                                            (ticketIndex + 1) %
                                                ticketsforSelectedEvent.length
                                        )
                                    }}
                                    className="next-ticket"
                                >
                                    <img src={nextIcon} alt="next" />
                                </span>
                            )}
                        {ticketsforSelectedEvent.length > 1 &&
                            ticketIndex > 0 && (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setTicketIndex(
                                            (ticketIndex +
                                                ticketsforSelectedEvent.length -
                                                1) %
                                                ticketsforSelectedEvent.length
                                        )
                                    }}
                                    className="previous-ticket"
                                >
                                    <img src={previousIcon} alt="previous" />
                                </span>
                            )}
                        {ticketsforSelectedEvent.length > 1 && (
                            <h5 className="ticket-num">
                                Ticket number: {ticketIndex + 1}
                            </h5>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
