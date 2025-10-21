import { useEffect, useRef, useState } from 'react'
import SecondaryNav from '../components/SecondaryNav'
import Api from '../Api'
import EventCard from '../components/EventCard'
import Loader from '../components/Loader'

import noImageIcon from '../assets/Image-not-found.png'
import TicketsModal from '../components/TicketsModal'
import SearchSecondary from '../components/SearchSecondary'

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

export default function TicketsHistory() {
    const [cartEvents, setCartEvents] = useState([])
    const [cartImages, setCartImages] = useState(null)

    const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false)
    const [allTickets, setAllTickets] = useState([])
    const [ticketsforSelectedEvent, setTicketsforSelectedEvent] = useState([])

    const [loadingEvents, setLoadingEvents] = useState(false)
    const [loadingTickets, setLoadingTickets] = useState(false)

    const [eventsError, setEventsError] = useState(null)
    const [ticketsError, setTicketsError] = useState(null)

    const [searchInput, setSearchInput] = useState('')
    const [searchInputError, setSearchInputError] = useState(null)
    const [isSearchLoading, setIsSearchLoading] = useState(false)

    // controller
    let controller = useRef(null)

    const noPurchasedTickets =
        !searchInput &&
        !isSearchLoading &&
        !loadingEvents &&
        !eventsError &&
        cartEvents.length === 0

    useEffect(() => {
        async function getTicketsHistory() {
            setLoadingEvents(true)
            setLoadingTickets(true)
            try {
                const response = await Api().get(
                    `/api/v1/ecommerce/tickets/history`
                )
                console.log('tickets/history', response)

                if (
                    !response.data?.events ||
                    !response.data?.images ||
                    !response.data?.ticketsIds
                ) {
                    setLoadingEvents(false)
                    setLoadingTickets(false)
                    setEventsError('Internal Server Error')
                    return
                }

                if (!(response.data.events.length > 0)) {
                    setLoadingEvents(false)
                    setLoadingTickets(false)
                    return
                }
                setLoadingEvents(false)
                setCartEvents(response.data.events)
                setCartImages(response.data.images)

                if (!(response.data?.ticketsIds?.length > 0)) {
                    setLoadingTickets(false)
                    setTicketsError(true)
                    return
                }
                const tickets = response.data.ticketsIds.join(',')
                const responseTickets = await Api().get(
                    `/api/v1/ecommerce/tickets/print?ids=${tickets}`
                )
                console.log(responseTickets)
                if (
                    !(
                        responseTickets.data?.length ===
                        response.data.ticketsIds.length
                    )
                ) {
                    setLoadingTickets(false)
                    setTicketsError(true)
                    return
                }
                setLoadingTickets(false)
                setAllTickets(responseTickets.data)
            } catch (err) {
                console.log(err)
                setLoadingEvents(false)
                setLoadingTickets(false)
                if (err.config.url.includes('print')) {
                    setTicketsError(true)
                } else {
                    setEventsError(err.response.data.error)
                }
            }
        }
        getTicketsHistory()
    }, [])

    useEffect(() => {
        async function searchTickets() {
            // Cancel the previous request if it exists
            if (controller.current !== null) {
                controller.current.abort()
                setIsSearchLoading(false)

                //reset to null
                controller.current = null
            }

            // Create a new controller for the new request
            controller.current = new AbortController()
            setIsSearchLoading(true)

            try {
                // signal
                const response = await Api().get(
                    `/api/v1/ecommerce/tickets/history?search=${searchInput}`,
                    { signal: controller.current.signal }
                )
                console.log('tickets/history Search', response)

                if (!response.data?.events || !response.data?.images) {
                    setEventsError('Internal Server Error')
                    setIsSearchLoading(false)
                    controller.current = null
                    return
                }

                if (response.data.events?.length > 0) {
                    setCartEvents([...response.data.events])
                    setCartImages({ ...response.data.images })
                    setIsSearchLoading(false)
                    controller.current = null
                } else {
                    setCartEvents([])
                    setCartImages(null)
                    setIsSearchLoading(false)
                    controller.current = null
                }
            } catch (err) {
                console.log(err)
                // catch canceled error
                if (err.name === 'CanceledError') {
                    console.log(
                        `Previous request was canceled. Previous request url:${err.config.url}`
                    )
                    return
                }

                if (err.status === 400) {
                    setSearchInputError(err.response.data.error)
                    setIsSearchLoading(false)
                    controller.current = null
                } else {
                    setEventsError(err.response.data.error)
                    setIsSearchLoading(false)
                    controller.current = null
                }
            }
        }

        if (!searchInput) {
            searchTickets()
            return
        }

        const timeoutId = setTimeout(searchTickets, 200)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [searchInput])

    return (
        <div className="profile-page">
            <div className="title-nav">
                <h2>Tickets History</h2>
                <div
                    style={{
                        display:
                            noPurchasedTickets || eventsError
                                ? 'none'
                                : 'block',
                    }}
                >
                    <SearchSecondary
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        searchInputError={searchInputError}
                        setSearchInputError={setSearchInputError}
                        isSearchLoading={isSearchLoading}
                    />
                </div>

                <SecondaryNav pageSelected={'tickets'} />
            </div>
            {ticketsError && cartEvents.length > 0 && (
                <p>
                    Your tickets cannot be printed at this time. Try again
                    later.
                </p>
            )}
            {cartEvents.length > 0 && (
                <div>
                    {cartEvents.map((event) => (
                        <div
                            key={event._id}
                            style={{
                                opacity:
                                    new Date(event.date) < new Date()
                                        ? '0.5'
                                        : '1',
                            }}
                        >
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
                                            if (
                                                new Date(event.date) <
                                                new Date()
                                            )
                                                return

                                            if (ticketsError) return

                                            setIsTicketsModalOpen(true)
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
                            />
                        </div>
                    ))}
                </div>
            )}

            {eventsError && <div>{eventsError}</div>}
            {(loadingEvents || loadingTickets) && <Loader />}
            {isTicketsModalOpen && (
                <TicketsModal
                    ticketsforSelectedEvent={ticketsforSelectedEvent}
                    setIsTicketsModalOpen={setIsTicketsModalOpen}
                />
            )}
            {noPurchasedTickets && <div>You don't have purchased tickets.</div>}
            {searchInput &&
                !isSearchLoading &&
                !eventsError &&
                cartEvents.length === 0 && (
                    <div>No tickets found. Try another search.</div>
                )}
            {isSearchLoading && !searchInput && <h1>Loading ...</h1>}
        </div>
    )
}
