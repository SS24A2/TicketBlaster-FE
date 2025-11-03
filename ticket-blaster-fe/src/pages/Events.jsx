import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import '../styles/events.css'

import Api from '../Api'
import noImageIcon from '../assets/Image-not-found.png'
import ButtonGetTickets from '../components/ButtonGetTickets'
import Loader from '../components/Loader'

export default function Events({ type }) {
    const [events, setEvents] = useState([])
    const [images, setImages] = useState(null)
    const [numOfRenderedEvents, setNumOfRenderedEvents] = useState(10)

    async function fetchNewEvents() {
        try {
            if (events.length < numOfRenderedEvents + 10) {
                setNumOfRenderedEvents(events.length)
                //all events are already fetched
                return
            }
            const category =
                type === 'concerts' ? 'Musical%20Concert' : 'Stand-up%20Comedy'

            setNumOfRenderedEvents(numOfRenderedEvents + 10)

            // + 20 is adeded in order to skip the initialy fetched 20 results
            const response = await Api().get(
                `/api/v1/events?category=${category}&page=${
                    (numOfRenderedEvents + 20) / 10
                }&pageSize=10`
            )
            console.log(response)
            setEvents([...events, ...response.data.events])
            setImages({ ...images, ...response.data.images })
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        async function eventsInitialFetch() {
            try {
                const category =
                    type === 'concerts'
                        ? 'Musical%20Concert'
                        : 'Stand-up%20Comedy'
                const response = await Api().get(
                    `/api/v1/events?category=${category}&page=1&pageSize=20`
                )
                console.log(response)
                setEvents(response.data.events)
                setImages(response.data.images)
            } catch (err) {
                console.log(err)
            }
        }
        eventsInitialFetch()
        return () => {
            setNumOfRenderedEvents(10)
            setEvents([])
            setImages(null)
        }
    }, [type])

    if (events.length === 0) {
        return <Loader></Loader>
    }

    return (
        <section className="events-page">
            <h1>
                {type === 'concerts' ? 'Musical Concerts' : 'Stand-up Comedy'}
            </h1>

            <div className="all-events">
                {events.map((event, index) =>
                    index < numOfRenderedEvents ? (
                        <EventCard
                            key={event._id}
                            event={event}
                            imageSrc={
                                images[event._id]
                                    ? `${
                                          import.meta.env
                                              .VITE_REACT_APP_BACKEND_API
                                      }/${images[event._id]}`
                                    : noImageIcon
                            }
                            ButtonComponent={
                                <ButtonGetTickets eventId={event._id} />
                            }
                        />
                    ) : null
                )}
            </div>
            <button
                style={{
                    display:
                        events.length <= numOfRenderedEvents
                            ? 'none'
                            : 'inline-block',
                }}
                onClick={fetchNewEvents}
            >
                Load More{' '}
                {type === 'concerts'
                    ? 'Musical Concerts'
                    : 'Stand-up Comedy Shows'}
            </button>
        </section>
    )
}
