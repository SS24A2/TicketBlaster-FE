import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'

import Api from '../Api'

import SecondaryNav from '../components/SecondaryNav'
import EventCard from '../components/EventCard'
import noImageIcon from '../assets/Image-not-found.png'
import ModalUsersEvents from '../components/ModalUsersEvents'
import SearchSecondary from '../components/SearchSecondary'
import Loader from '../components/Loader'
import inputNormalization from '../helper/inputNormalization'
import '../styles/events-admin.css'

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
            <Link to={`/account/profile/events/update/${id}`} viewTransition>
                {children}
            </Link>
        </h4>
    )
}

export default function EventsAdmin() {
    const [allEvents, setAllEvents] = useState([])
    const [eventsImages, setEventsImages] = useState(null)
    const [nextPage, setNextPage] = useState(null)

    const [loadingEvents, setLoadingEvents] = useState(false)
    const [eventsError, setEventsError] = useState(null)

    const [modal, setModal] = useState(null)

    const [searchInput, setSearchInput] = useState('')

    // controller
    let controller = useRef(null)

    const getFirstPage = useCallback(async () => {
        // Cancel the previous request if it exists
        if (controller.current !== null) {
            controller.current.abort()
            setLoadingEvents(false)

            //reset to null
            controller.current = null
        }

        // Create a new controller for the new request
        controller.current = new AbortController()
        setLoadingEvents(true)

        try {
            const inputValue = inputNormalization(searchInput)
            const response = await Api().get(
                `/api/v1/events?search=${inputValue}&page=1&pageSize=${pageSize}`,
                { signal: controller.current.signal }
            )
            console.log('first page ev', response)

            if (!response.data?.events || !response.data?.images) {
                setEventsError('Internal Server Error')
                setLoadingEvents(false)
                controller.current = null
                return
            }

            if (response.data.events?.length === pageSize) {
                setNextPage(2)
            } else {
                setNextPage(null)
            }
            if (response.data.events?.length > 0) {
                setLoadingEvents(false)
                setAllEvents([...response.data.events])
                setEventsImages({ ...response.data.images })
                controller.current = null
            } else {
                setLoadingEvents(false)
                setAllEvents([])
                setEventsImages(null)
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
            setEventsError(err.response?.data?.error || 'Internal Server Error')
            setLoadingEvents(false)
            controller.current = null
        }
    }, [searchInput])

    async function deleteEvent(id) {
        setModal({
            type: 'deleteInProgress',
        })
        try {
            const res = await Api().delete(`/api/v1/events/${id}`)
            console.log(res)

            if (res.data?.deletedCount === 1) {
                setModal({
                    type: 'deleteSuccess',
                })
            } else {
                setModal({
                    type: 'deleteFail',
                    message: 'Try again later.',
                })
            }
        } catch (err) {
            console.log(err)
            setModal({
                type: 'deleteFail',
                message: err.response?.data?.error || 'Try again later.',
            })
        }
    }

    function cancelModal() {
        setModal(null)
    }

    function cancelResultModal() {
        setModal(null)
        setNextPage(null)
        getFirstPage()
        window.scrollTo(0, 0)
    }

    function confirmModal(modal) {
        deleteEvent(modal.id)
    }

    useEffect(() => {
        async function getMoreEvents() {
            if (loadingEvents) return

            const scrollPosition = window.scrollY + window.innerHeight
            const isScrollNearEnd =
                scrollPosition >= (document.body.scrollHeight * 3) / 4
            if (!isScrollNearEnd) return

            if (!nextPage) return

            try {
                setLoadingEvents(true)
                const inputValue = inputNormalization(searchInput)
                const response = await Api().get(
                    `/api/v1/events?search=${inputValue}&page=${nextPage}&pageSize=${pageSize}`
                )
                console.log('more ev', response)
                if (response.data.events?.length === pageSize) {
                    setNextPage(nextPage + 1)
                } else {
                    setNextPage(null)
                }
                if (response.data.events?.length > 0) {
                    setLoadingEvents(false)
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
                setLoadingEvents(false)
            }
        }
        window.addEventListener('scrollend', getMoreEvents)

        return () => {
            window.removeEventListener('scrollend', getMoreEvents)
        }
    }, [nextPage, searchInput, loadingEvents])

    useEffect(() => {
        if (!searchInput) {
            getFirstPage()
            return
        }

        const timeoutId = setTimeout(getFirstPage, 200)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [getFirstPage, searchInput])

    return (
        <div className="profile-page">
            <div className="title-nav">
                <div className="title-nav-inner">
                    <h2>Events</h2>
                    <button className="pink-button">
                        <Link to="/account/profile/events/new" viewTransition>
                            Create Event
                        </Link>
                    </button>
                </div>
                <div
                    style={{
                        display: eventsError ? 'none' : 'block',
                    }}
                >
                    <SearchSecondary
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        isSearchLoading={loadingEvents}
                    />
                </div>

                <SecondaryNav pageSelected={'events'} />
            </div>
            {searchInput && allEvents.length === 0 && !loadingEvents && (
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
                            hideDetails={true}
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
                    </div>
                ))}
                {loadingEvents && allEvents.length > 0 && nextPage && (
                    <h2
                        style={{
                            color: '#FF48AB',
                            fontSize: 30,
                            letterSpacing: 2,
                            paddingLeft: 20,
                        }}
                    >
                        .....
                    </h2>
                )}
                {modal && (
                    <ModalUsersEvents
                        modal={modal}
                        cancelModal={
                            modal.type === 'deleteEvent'
                                ? cancelModal
                                : cancelResultModal
                        }
                        confirmModal={confirmModal}
                    />
                )}
                {eventsError && <div>{eventsError}</div>}
            </div>
            {loadingEvents && nextPage === null && !searchInput && <Loader />}
        </div>
    )
}
