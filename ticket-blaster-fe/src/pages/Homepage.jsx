import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import EventCard from '../components/EventCard'
import Api from '../Api'

import generalAvatar from '../assets/general-avatar.png'
import convertDate from '../convertDate'

export default function Homepage() {
    const [mainEvent, setMainEvent] = useState(null)
    const [concerts, setConcerts] = useState([])
    const [comedies, setComedies] = useState([])

    async function fetchHomepageEvents() {
        try {
            const responseMainEvent = await Api().get(
                `/api/v1/events?page=1&pageSize=1`
            )
            console.log(responseMainEvent)
            setMainEvent(responseMainEvent.data[0])

            let excludedId = ''
            if (responseMainEvent.data[0]._id) {
                excludedId = responseMainEvent.data[0]._id
            }

            const responseConcerts = await Api().get(
                `/api/v1/events?category=Musical%20Concert&excludedId=${excludedId}&page=1&pageSize=5`
            )
            console.log('res2', responseConcerts)
            setConcerts(responseConcerts.data)

            const responseComedies = await Api().get(
                `/api/v1/events?category=Stand-up%20Comedy&excludedId=${excludedId}&page=1&pageSize=5`
            )
            console.log('res3', responseComedies)
            setComedies(responseComedies.data)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        fetchHomepageEvents()
    }, [])

    if (!mainEvent) return <div>LOADING HOMEPAGE</div> //TBC

    return (
        <section className="homepage">
            <div className="main-event">
                <img
                    src={
                        'https://images.pexels.com/photos/949587/pexels-photo-949587.jpeg'
                    }
                    alt="main-img"
                />
                <div className="main-event-inner">
                    <span className="main-event-text">
                        <h1>{mainEvent.name}</h1>
                        <p>
                            {convertDate(mainEvent.date)}, {mainEvent.location}
                        </p>
                    </span>

                    <button>
                        <Link to={`/event/${mainEvent._id}`}>Get tickets</Link>
                    </button>
                </div>
            </div>
            <div className="homepage-events">
                <div className="homepage-concerts">
                    <h3>Musical Concerts</h3>
                    <div>
                        {concerts.map((concert) => (
                            <EventCard key={concert._id} event={concert} />
                        ))}
                    </div>
                    <button>
                        <Link to="/concerts">See All Musical Concerts</Link>
                    </button>
                </div>
                <div className="homepage-comedies">
                    <h3>Stand-up Comedy</h3>
                    <div>
                        {comedies.map((comedy) => (
                            <EventCard key={comedy._id} event={comedy} />
                        ))}
                    </div>
                    <button>
                        <Link to="/comedies">
                            See All Stand-up Comedy Shows
                        </Link>
                    </button>
                </div>
            </div>
        </section>
    )
}
