import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'

import Api from '../Api'

export default function Events({ type }) {
    const [events, setEvents] = useState([])
    const [numOfRenderedEvents, setNumOfRenderedEvents] = useState(10)

    async function eventsInitialFetch() {
        try {
            const category =
                type === 'concerts' ? 'Musical%20Concert' : 'Stand-up%20Comedy'
            const response = await Api().get(
                `/api/v1/events?category=${category}&page=1&pageSize=20`
            )
            console.log(response)
            setEvents(response.data)
        } catch (err) {
            console.log(err)
        }
    }

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
            setEvents([...events, ...response.data])
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        eventsInitialFetch()
        return () => {
            setNumOfRenderedEvents(10)
            setEvents([])
        }
    }, [type])

    if (events.length === 0) {
        return <div>LOADING EVENTS</div>
    }

    return (
        <section className="events-page">
            <h1>
                {type === 'concerts' ? 'Musical Concerts' : 'Stand-up Comedy'}
            </h1>

            <div className="all-events">
                {events.map((event, index) =>
                    index < numOfRenderedEvents ? (
                        <EventCard key={event._id} event={event} />
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
