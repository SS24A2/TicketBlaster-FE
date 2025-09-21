import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'

import Api from '../Api'

import SecondaryNav from '../components/SecondaryNav'
import EventCard from '../components/EventCard'
import noImageIcon from '../assets/Image-not-found.png'
import ModalUsersEvents from '../components/ModalUsersEvents'

const pageSize = 10

function Button({ openModal }) {
    return (
        <button className="delete-btn" onClick={openModal}>
            Delete Event
        </button>
    )
}

function LinkToUpdateEvent({ id, children }) {
    return (
        <h4>
            <Link to={`/account/profile/events/update/${id}`}>{children}</Link>
        </h4>
    )
}

export default function EventsAdmin() {
    const [allEvents, setAllEvents] = useState([])
    const [eventsImages, setEventsImages] = useState(null)
    const [nextPage, setNextPage] = useState(null)

    const [searchInput, setSearchInput] = useState('')

    const [modal, setModal] = useState(null)

    const [deleteMessage, setDeleteMessage] = useState(null)

    const getFirstPage = useCallback(async () => {
        try {
            const response = await Api().get(
                `/api/v1/events?search=${searchInput}&page=1&pageSize=${pageSize}`
            )
            console.log('first page ev', response)

            if (response.data.events?.length === pageSize) {
                setNextPage(2)
            } else {
                setNextPage(null)
            }
            if (response.data.events?.length > 0) {
                setAllEvents([...response.data.events])
                setEventsImages({ ...response.data.images })
            } else {
                setAllEvents([])
                setEventsImages(null)
            }
        } catch (err) {
            console.log(err)
        }
    }, [searchInput])

    async function deleteEvent(id) {
        try {
            const res = await Api().delete(`/api/v1/events/${id}`)
            console.log(res)

            if (res.data?.deletedCount === 1) {
                setDeleteMessage({
                    text: 'Event deleted.',
                    eventId: id,
                    isEventDeleted: true,
                })
                setTimeout(() => {
                    getFirstPage()
                    window.scrollTo(0, 0)
                }, 3000)
            }
        } catch (err) {
            console.log(err)
            if (err.message === 'Network Error') {
                setDeleteMessage({
                    text: 'The event cannot be deleted. Check your internet connection and try again.',
                    eventId: id,
                    isEventDeleted: false,
                })
            } else {
                setDeleteMessage({
                    text: `${err.response?.data}. The event cannot be deleted.`,
                    eventId: id,
                    isEventDeleted: false,
                })
            }
        } finally {
            setModal(null)
        }
    }

    function cancelModal() {
        setModal(null)
    }

    function confirmModal(modal) {
        deleteEvent(modal.id)
    }

    useEffect(() => {
        async function getInitialEvents() {
            try {
                const response = await Api().get(
                    `/api/v1/events?search=&page=1&pageSize=${pageSize}` //search is empty string at initial render
                )
                console.log('initial list ev', response)
                if (response.data.events?.length === pageSize) {
                    setNextPage(2)
                }
                if (response.data.events?.length > 0) {
                    setAllEvents([...response.data.events])
                    setEventsImages({ ...response.data.images })
                }
            } catch (err) {
                console.log(err)
            }
        }

        getInitialEvents()
    }, [])

    useEffect(() => {
        async function getMoreEvents() {
            const scrollPosition = window.scrollY + window.innerHeight
            const isScrollNearEnd =
                scrollPosition >= (document.body.scrollHeight * 3) / 4
            if (!isScrollNearEnd) return

            if (!nextPage) return

            try {
                const response = await Api().get(
                    `/api/v1/events?search=${searchInput}&page=${nextPage}&pageSize=${pageSize}`
                )
                console.log('more ev', response)
                if (response.data.events?.length === pageSize) {
                    setNextPage(nextPage + 1)
                } else {
                    setNextPage(null)
                }
                if (response.data.events?.length > 0) {
                    setAllEvents((currentEvents) => [
                        ...currentEvents,
                        ...response.data.events,
                    ])
                    setEventsImages((currentImages) => ({
                        ...currentImages,
                        ...response.data.images,
                    }))
                }
            } catch (err) {
                console.log(err)
            }
        }
        window.addEventListener('scrollend', getMoreEvents)

        return () => {
            window.removeEventListener('scrollend', getMoreEvents)
        }
    }, [nextPage, searchInput])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            getFirstPage()
        }, 200)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [getFirstPage])

    return (
        <div className="profile-page">
            <div className="title-nav">
                <div className="title-nav">
                    <h2>Events</h2>
                    <button className="pink-button">
                        <Link to="/account/profile/events/new">
                            Create Event
                        </Link>
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Search"
                    name="search"
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value)
                    }}
                />

                <SecondaryNav pageSelected={'events'} />
            </div>
            {searchInput && allEvents.length === 0 && (
                <div>
                    No results for what you're looking for. Try another search.
                </div>
            )}
            <div className="events-wrapper">
                {allEvents.map((e) => (
                    <div key={e._id} style={{ position: 'relative' }}>
                        <EventCard
                            event={e}
                            imageSrc={
                                eventsImages[e._id]
                                    ? `${
                                          import.meta.env
                                              .VITE_REACT_APP_BACKEND_API
                                      }/${eventsImages[e._id]}`
                                    : noImageIcon
                            }
                            ButtonComponent={
                                <Button
                                    openModal={() =>
                                        setModal({
                                            type: 'deleteEvent',
                                            id: e._id,
                                        })
                                    }
                                />
                            }
                            UpdateLink={
                                <LinkToUpdateEvent
                                    id={e._id}
                                    children={e.name}
                                />
                            }
                        />
                        {deleteMessage && deleteMessage.eventId === e._id && (
                            <>
                                <span className="delete-event-message">
                                    {deleteMessage.text}
                                </span>
                                {deleteMessage.isEventDeleted && (
                                    <span className="delete-event-loading">
                                        Loading events ...
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                ))}
                {modal && (
                    <ModalUsersEvents
                        modal={modal}
                        cancelModal={cancelModal}
                        confirmModal={confirmModal}
                    />
                )}
            </div>
        </div>
    )
}
