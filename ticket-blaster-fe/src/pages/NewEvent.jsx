import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

import Api from '../Api'

import SecondaryNav from '../components/SecondaryNav'
import EventCard from '../components/EventCard'
import noImageIcon from '../assets/Image-not-found.png'
import convertDate from '../convertDate'

let formData = null
const pageSize = 10

function Button({ removeEvent }) {
    return (
        <button className="remove-btn" type="button" onClick={removeEvent}>
            Remove
        </button>
    )
}

export default function NewEvent({ type }) {
    const navigate = useNavigate()

    const [formState, setFormState] = useState({
        name: '',
        category: 'Musical Concert',
        date: '',
        location: '',
        details: '',
        price: '',
        relatedEvents: [],
        selectedRelatedEvent: '',
        uploadedImg: null,
    })

    const [userError, setUserError] = useState(null)

    const [eventById, setEventById] = useState(null)
    const [allEvents, setAllEvents] = useState([])
    const [eventsImages, setEventsImages] = useState(null)

    let { id } = useParams()

    const [nextPage, setNextPage] = useState(null)

    const [selectSize, setSelectSize] = useState(0)
    const selectRef = useRef(null)

    async function getMoreEvents() {
        try {
            if (!nextPage) return
            const response = await Api().get(
                `/api/v1/events?page=${nextPage}&pageSize=${pageSize}`
            )
            console.log('more ev', response)
            if (response.data.events.length === pageSize) {
                setNextPage(nextPage + 1)
            } else {
                setNextPage(null)
            }
            if (response.data.events.length > 0)
                setAllEvents([...allEvents, ...response.data.events])
        } catch (err) {
            console.log(err)
        }
    }

    async function getRelatedEvent(id) {
        if (formState.relatedEvents.map((ev) => ev._id).includes(id)) {
            setUserError(
                'The event is already added to the list of related events'
            )
            return
        }

        try {
            const response = await Api().get(`/api/v1/events/${id}`)
            console.log(response)
            setFormState({
                ...formState,
                relatedEvents: [
                    ...formState.relatedEvents,
                    response.data.event,
                ],
            })
            setEventsImages({ ...eventsImages, [id]: response.data.images[id] })
        } catch (err) {
            console.log(err)
        }
    }

    function removeEvent(id) {
        setFormState({
            ...formState,
            relatedEvents: [
                ...formState.relatedEvents.filter((i) => i._id !== id),
            ],
        })
    }

    useEffect(() => {
        async function getInitialEvents() {
            try {
                const response = await Api().get(
                    `/api/v1/events?page=1&pageSize=${pageSize}`
                )
                console.log('initial list ev', response)
                if (response.data.events) {
                    if (response.data.events.length === pageSize) {
                        setNextPage(2)
                    }
                    if (response.data.events.length > 0) {
                        setAllEvents(response.data.events)
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }
        getInitialEvents()
    }, [])

    useEffect(() => {
        async function getEventToUpdate() {
            try {
                const response = await Api().get(`/api/v1/events/${id}`)
                console.log(response)
                setEventById(response.data.event)
                setEventsImages(response.data.images)
                setFormState({
                    ...response.data.event,
                    date: response.data.event.date.substring(0, 10),
                })
            } catch (err) {
                console.log(err)
            }
        }

        if (id) getEventToUpdate(id) // if type=create id value is undefined
    }, [id])

    async function handleSubmit() {
        try {
            let relatedEventsIDs = formState.relatedEvents.map((obj) => obj._id)
            if (type === 'create') {
                const res = await Api().post(`/api/v1/events`, {
                    name: formState.name,
                    category: formState.category,
                    date: formState.date,
                    location: formState.location,
                    details: formState.details,
                    price: formState.price,
                    relatedEvents: relatedEventsIDs,
                })
                console.log('res1', res)

                if (formState.uploadedImg) {
                    const res2 = await Api().post(
                        `/api/v1/upload/event/${res.data._id}`,
                        formData,
                        { headers: { 'Content-Type': 'multipart/form-data' } }
                    )
                    console.log('res2', res2)
                }

                navigate('/account/profile/events', { viewTransition: true })
            } else if (type === 'update') {
                const res = await Api().put(`/api/v1/events/${id}`, {
                    name: formState.name,
                    category: formState.category,
                    date: formState.date,
                    location: formState.location,
                    details: formState.details,
                    price: formState.price,
                    relatedEvents: relatedEventsIDs,
                })
                console.log('res1', res)

                if (formState.uploadedImg) {
                    const res2 = await Api().post(
                        `/api/v1/upload/event/${id}`,
                        formData,
                        { headers: { 'Content-Type': 'multipart/form-data' } }
                    )
                    console.log('res2', res2)
                }
                navigate('/account/profile/events', { viewTransition: true })
            }
        } catch (err) {
            console.log(err)
        }
    }

    function changeImage(e) {
        const [imageSelected] = e.target.files
        if (!imageSelected) return

        formData = new FormData()
        formData.append('image', imageSelected)

        let src = URL.createObjectURL(imageSelected)
        setFormState({ ...formState, uploadedImg: src })
    }

    if ((type === 'update' && !eventById) || allEvents.length === 0) {
        return <div>Loading ...</div>
    }

    return (
        <div className="new-event-page">
            <div className="title-nav">
                <h2>Events</h2>
                <SecondaryNav pageSelected={'events'} />
            </div>
            <form>
                <div className="form-first-group">
                    <span>
                        <label>Event Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formState.name}
                            onChange={(e) =>
                                setFormState({
                                    ...formState,
                                    name: e.target.value,
                                })
                            }
                        />
                    </span>
                    <span>
                        <label>Category</label>
                        <select
                            name="category"
                            required
                            value={formState.category}
                            onChange={(e) =>
                                setFormState({
                                    ...formState,
                                    category: e.target.value,
                                })
                            }
                        >
                            <option>Musical Concert</option>
                            <option>Stand-up Comedy</option>
                        </select>
                    </span>
                    <span>
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            required
                            value={formState.date}
                            onChange={(e) =>
                                setFormState({
                                    ...formState,
                                    date: e.target.value,
                                })
                            }
                        />
                    </span>
                    <span>
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            required
                            value={formState.location}
                            onChange={(e) =>
                                setFormState({
                                    ...formState,
                                    location: e.target.value,
                                })
                            }
                        />
                    </span>
                </div>
                <div className="form-second-group">
                    <div>
                        <label htmlFor="event-photo">Upload Event Art</label>
                        <input
                            type="file"
                            id="event-photo"
                            onChange={changeImage}
                            className="upload-input"
                        />
                        <img
                            src={
                                formState.uploadedImg
                                    ? formState.uploadedImg
                                    : type === 'update' && eventsImages[id]
                                    ? `${
                                          import.meta.env
                                              .VITE_REACT_APP_BACKEND_API
                                      }/${eventsImages[id]}`
                                    : noImageIcon
                            }
                            alt="event-photo"
                            className="upload-event-photo"
                        />
                    </div>
                    <div>
                        <span>
                            <label>Event Details</label>
                            <textarea
                                name="details"
                                required
                                value={formState.details}
                                onChange={(e) =>
                                    setFormState({
                                        ...formState,
                                        details: e.target.value,
                                    })
                                }
                            />
                        </span>
                        <span>
                            <label>Ticket Price (USD)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                value={formState.price}
                                onChange={(e) =>
                                    setFormState({
                                        ...formState,
                                        price: e.target.value,
                                    })
                                }
                            />
                        </span>
                    </div>
                </div>
                {userError && (
                    <div
                        className="error-info"
                        style={{
                            position: 'relative',
                            top: '90%',
                            right: '-70% ',
                        }}
                    >
                        {userError}
                    </div>
                )}
                <div className="form-third-group">
                    <h5>Related Events</h5>
                    <select
                        ref={selectRef}
                        size={selectSize}
                        name="related-events"
                        value={formState.selectedRelatedEvent}
                        onChange={(e) => {
                            if (e.target.value.length === 24) {
                                setFormState({
                                    ...formState,
                                    selectedRelatedEvent: e.target.value,
                                })
                                setSelectSize(0)
                                if (selectRef.current) selectRef.current.blur()
                            }
                        }}
                        onScrollEnd={getMoreEvents}
                        onFocus={() => setSelectSize(5)}
                        onBlur={() => setSelectSize(0)}
                    >
                        <option value="">Select related event</option>
                        {allEvents.map((ev) => {
                            if (ev._id && ev._id !== id) {
                                //if type=update exclude the event that is updated from list of events available for selection as related event
                                return (
                                    <option key={ev._id} value={ev._id}>
                                        {ev.name} - {convertDate(ev.date)} -
                                        {ev.location}
                                    </option>
                                )
                            }
                        })}
                    </select>
                    <button
                        onClick={() => {
                            if (formState.selectedRelatedEvent)
                                getRelatedEvent(formState.selectedRelatedEvent)
                        }}
                        type="button"
                    >
                        Add
                    </button>
                </div>
                <div className="form-fourth-group">
                    {formState.relatedEvents[0]?._id &&
                        formState.relatedEvents.map((ev) => (
                            <div className="related-event-card" key={ev._id}>
                                <EventCard
                                    event={ev}
                                    imageSrc={
                                        eventsImages[ev._id]
                                            ? `${
                                                  import.meta.env
                                                      .VITE_REACT_APP_BACKEND_API
                                              }/${eventsImages[ev._id]}`
                                            : noImageIcon
                                    }
                                    ButtonComponent={
                                        <Button
                                            removeEvent={() =>
                                                removeEvent(ev._id)
                                            }
                                        />
                                    }
                                />
                            </div>
                        ))}
                </div>

                <button
                    type="button"
                    className="submit-event"
                    onClick={handleSubmit}
                >
                    Save
                </button>
            </form>
        </div>
    )
}
