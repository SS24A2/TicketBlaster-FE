import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import '../styles/search.css'

import Api from '../Api'

import EventCard from '../components/EventCard'
import noImageIcon from '../assets/Image-not-found.png'
import ButtonGetTickets from '../components/ButtonGetTickets'
import Loader from '../components/Loader'

export default function Search() {
    const [eventsResults, setEventsResults] = useState([])
    const [imagesResults, setImagesResults] = useState(null)
    const [loadingEvents, setLoadingEvents] = useState(false)

    const { searchTerm } = useParams()

    useEffect(() => {
        async function fetchSearchResults() {
            setLoadingEvents(true)
            try {
                const response = await Api().get(
                    `/api/v1/events?search=${searchTerm}&page=1&pageSize=20`
                )
                console.log('res', response)
                setEventsResults(response.data.events)
                setImagesResults(response.data.images)
                setLoadingEvents(false)
            } catch (err) {
                console.log(err)
                setLoadingEvents(false)
            }
        }
        fetchSearchResults()
    }, [searchTerm])

    if (loadingEvents) return <Loader></Loader>

    if (searchTerm && eventsResults.length === 0 && !loadingEvents) {
        return (
            <div className="search-results">
                <h1>Search Results for: {searchTerm}</h1>
                <h2 className="empty-card-text">
                    No results for what you're looking for. Try another search.
                </h2>
            </div>
        )
    }

    return (
        <section className="search-results">
            <h1>Search Results for: {searchTerm}</h1>
            <div className="search-result-inner">
                {eventsResults.map((event) => (
                    <EventCard
                        key={event._id}
                        event={event}
                        imageSrc={
                            imagesResults[event._id]
                                ? `${
                                      import.meta.env.VITE_REACT_APP_BACKEND_API
                                  }/${imagesResults[event._id]}`
                                : noImageIcon
                        }
                        ButtonComponent={
                            <ButtonGetTickets eventId={event._id} />
                        }
                    />
                ))}
            </div>
        </section>
    )
}
