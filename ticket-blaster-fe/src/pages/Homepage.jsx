import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import EventCard from '../components/EventCard'
import Api from '../Api'

import noImageIcon from '../assets/Image-not-found.png'
import ButtonGetTickets from '../components/ButtonGetTickets'
import convertDate from '../helper/convertDate'

export default function Homepage() {
    const [mainEvent, setMainEvent] = useState(null)
    const [concerts, setConcerts] = useState([])
    const [comedies, setComedies] = useState([])

    const [mainImg, setMainImg] = useState(null)
    const [concertsImages, setConcertsImages] = useState(null)
    const [comediesImages, setComediesImages] = useState(null)

    async function fetchHomepageEvents() {
        try {
            const responseMainEvent = await Api().get(
                `/api/v1/events?page=1&pageSize=1`
            )
            console.log(responseMainEvent)
            setMainEvent(responseMainEvent.data.events[0])
            setMainImg(responseMainEvent.data.images)

            let excludedId = ''
            if (responseMainEvent.data.events[0]._id) {
                excludedId = responseMainEvent.data.events[0]._id
            }

            const responseConcerts = await Api().get(
                `/api/v1/events?category=Musical%20Concert&excludedId=${excludedId}&page=1&pageSize=5`
            )
            console.log('res2', responseConcerts)
            setConcerts(responseConcerts.data.events)
            setConcertsImages(responseConcerts.data.images)

            const responseComedies = await Api().get(
                `/api/v1/events?category=Stand-up%20Comedy&excludedId=${excludedId}&page=1&pageSize=5`
            )
            console.log('res3', responseComedies)
            setComedies(responseComedies.data.events)
            setComediesImages(responseComedies.data.images)
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
                        mainImg[mainEvent._id]
                            ? `${import.meta.env.VITE_REACT_APP_BACKEND_API}/${
                                  mainImg[mainEvent._id]
                              }`
                            : noImageIcon
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
                        <Link to={`/event/${mainEvent._id}`} viewTransition>
                            Get tickets
                        </Link>
                    </button>
                </div>
            </div>
            <div className="homepage-events">
                <div className="homepage-concerts">
                    <h3>Musical Concerts</h3>
                    <div>
                        {concerts.map((concert) => (
                            <EventCard
                                key={concert._id}
                                event={concert}
                                imageSrc={
                                    concertsImages[concert._id]
                                        ? `${
                                              import.meta.env
                                                  .VITE_REACT_APP_BACKEND_API
                                          }/${concertsImages[concert._id]}`
                                        : noImageIcon
                                }
                                ButtonComponent={
                                    <ButtonGetTickets eventId={concert._id} />
                                }
                            />
                        ))}
                    </div>
                    <button>
                        <Link to="/concerts" viewTransition>
                            See All Musical Concerts
                        </Link>
                    </button>
                </div>
                <div className="homepage-comedies">
                    <h3>Stand-up Comedy</h3>
                    <div>
                        {comedies.map((comedy) => (
                            <EventCard
                                key={comedy._id}
                                event={comedy}
                                imageSrc={
                                    comediesImages[comedy._id]
                                        ? `${
                                              import.meta.env
                                                  .VITE_REACT_APP_BACKEND_API
                                          }/${comediesImages[comedy._id]}`
                                        : noImageIcon
                                }
                                ButtonComponent={
                                    <ButtonGetTickets eventId={comedy._id} />
                                }
                            />
                        ))}
                    </div>
                    <button>
                        <Link to="/comedies" viewTransition>
                            See All Stand-up Comedy Shows
                        </Link>
                    </button>
                </div>
            </div>
        </section>
    )
}
