import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import Api from '../Api'

import EventCard from '../components/EventCard'
import noImageIcon from '../assets/Image-not-found.png'

export default function Search() {
    const [eventsResults, setEventsResults] = useState([])
    const [imagesResults, setImagesResults] = useState(null)

    const { searchTerm } = useParams()

    async function fetchSearchResults() {
        try {
            const response = await Api().get(
                `/api/v1/events?search=${searchTerm}&page=1&pageSize=20`
            )
            console.log('res', response)
            setEventsResults(response.data.events)
            setImagesResults(response.data.images)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        fetchSearchResults()
    }, [searchTerm])

    return (
        <section className="search-results">
            <h1>Search Results for:{searchTerm}</h1>
            <div>
                {eventsResults.map((event) => (
                    <EventCard
                        event={event}
                        key={event._id}
                        imageSrc={
                            imagesResults[event._id]
                                ? `${
                                      import.meta.env.VITE_REACT_APP_BACKEND_API
                                  }/${imagesResults[event._id]}`
                                : noImageIcon
                        }
                    />
                ))}
            </div>
        </section>
    )
}
