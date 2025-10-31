import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import noImageIcon from '../assets/Image-not-found.png'
import EventCard from '../components/EventCard'
import Api from '../Api'
import TicketsModal from '../components/TicketsModal'
import Loader from '../components/Loader'

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
    const [allTickets, setAllTickets] = useState([])
    const [ticketsforSelectedEvent, setTicketsforSelectedEvent] = useState([])

    const [cartEvents, setCartEvents] = useState([])
    const [cartImages, setCartImages] = useState(null)

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
                    !(response.data?.events.length > 0) ||
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
                if (!(purchasedTickets?.length > 0)) {
                    setLoadingTickets(false)
                    setTicketsError(true)
                    return
                }
                const ticketsIds = purchasedTickets.join(',')
                const response = await Api().get(
                    `/api/v1/ecommerce/tickets/print?ids=${ticketsIds}`
                )
                console.log(response)
                if (!(response.data?.length === purchasedTickets.length)) {
                    setLoadingTickets(false)
                    setTicketsError(true)
                    return
                }
                setLoadingTickets(false)
                setAllTickets(response.data)
            } catch (err) {
                console.log(err)
                setLoadingTickets(false)
                setTicketsError(true)
            }
        }
        getTickets()
    }, [purchasedTickets])

    return (
        <div className="cart-final-page">
            {cartEvents.length > 0 && <h1>Thank you for your purchase!</h1>}
            {cartEvents.length > 0 && (
                <div className="all-events">
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
                                            if (ticketsError) return

                                            setIsTicketsModalOpen(true)
                                            setTimeout(
                                                () => window.print(),
                                                100
                                            )
                                            setTicketsforSelectedEvent([
                                                ...allTickets.filter(
                                                    (t) =>
                                                        t.eventId === event._id
                                                ),
                                            ])
                                        }}
                                        style={{
                                            opacity: ticketsError ? '0.5' : '1',
                                        }}
                                    />
                                }
                                hideDetails={true}
                            />

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
            {ticketsError && !loadingEvents && !eventsError && (
                <p>
                    Your tickets cannot be printed at this time. Try again
                    later.
                </p>
            )}
            {eventsError && (
                <div>
                    The page is currently unavailable. Open the Tickets History
                    page or your email to find the purchased tickets.
                </div>
            )}
            {(loadingEvents || loadingTickets) && !eventsError && (
                <Loader>Loading page ... Please wait.</Loader>
            )}
            {isTicketsModalOpen && (
                <TicketsModal
                    ticketsforSelectedEvent={ticketsforSelectedEvent}
                    setIsTicketsModalOpen={setIsTicketsModalOpen}
                />
            )}
        </div>
    )
}
