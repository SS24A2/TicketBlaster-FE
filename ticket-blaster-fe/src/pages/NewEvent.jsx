import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import '../styles/new-event.css'
import Api from '../Api'

import SecondaryNav from '../components/SecondaryNav'
import EventCard from '../components/EventCard'
import noImageIcon from '../assets/Image-not-found.png'
import { InvalidMark, ValidMark } from '../components/validationMarks'
import convertDate from '../helper/convertDate'
import Loader from '../components/Loader'

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
        category: '',
        date: '',
        location: '',
        details: '',
        price: '',
        numOfTickets: '',
        relatedEvents: [],
        selectedRelatedEvent: '',
        uploadedImg: null,
    })

    const [formDataErrors, setFormDataErrors] = useState({
        name: '',
        category: '',
        date: '',
        location: '',
        details: '',
        price: '',
        numOfTickets: '',
        relatedEvents: '',
        selectedRelatedEvent: '',
        uploadedImg: '',
    })
    const [validationStyle, setValidationStyle] = useState({
        name: false,
        category: false,
        date: false,
        location: false,
        details: false,
        price: false,
        numOfTickets: false,
        relatedEvents: false,
        selectedRelatedEvent: false,
        uploadedImg: false,
    })

    const [allEvents, setAllEvents] = useState([])
    const [eventsImages, setEventsImages] = useState(null)

    let { id } = useParams()

    const [nextPage, setNextPage] = useState(null)

    const [selectSize, setSelectSize] = useState(0)
    const selectRef = useRef(null)

    const [loadingMoreRelatedEvents, setLoadingMoreRelatedEvents] =
        useState(false)

    const [submitMessage, setSubmitMessage] = useState('')
    const [loadingEventData, setLoadingEventData] = useState(false)
    const [errorOnSubmit, setErrorOnSubmit] = useState('')

    const [eventsListError, setEventsListError] = useState(null)
    const [eventToUpdateError, setEventToUpdateError] = useState(null)

    async function getMoreEvents() {
        setLoadingMoreRelatedEvents(true)
        try {
            if (!nextPage) {
                setLoadingMoreRelatedEvents(false)
                return
            }

            const response = await Api().get(
                `/api/v1/events?category=${formState.category}&page=${nextPage}&pageSize=${pageSize}`
            )
            console.log('more ev', response)
            if (response.data.events.length === pageSize) {
                setNextPage(nextPage + 1)
            } else {
                setNextPage(null)
            }
            if (response.data.events.length > 0) {
                setAllEvents([...allEvents, ...response.data.events])
            }
            setLoadingMoreRelatedEvents(false)
        } catch (err) {
            console.log(err)
            setLoadingMoreRelatedEvents(false)
        }
    }

    async function getRelatedEvent(id) {
        if (formState.relatedEvents.map((ev) => ev._id).includes(id)) {
            setFormDataErrors({
                ...formDataErrors,
                selectedRelatedEvent:
                    'The event is already added to the list of related events',
            })
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
            setFormDataErrors({
                ...formDataErrors,
                selectedRelatedEvent:
                    'Something went wrong. The event cannot be added to the list of related events. Try again later',
            })
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
                    `/api/v1/events?category=${formState.category}&page=1&pageSize=${pageSize}`
                )
                console.log('initial list ev', response)
                if (response.data.events) {
                    if (response.data.events.length === pageSize) {
                        setNextPage(2)
                    }
                    if (response.data.events.length > 0) {
                        setAllEvents(response.data.events)
                    } else {
                        setEventsListError('The list is currently unavailable')
                    }
                }
            } catch (err) {
                console.log(err)
                setAllEvents([])
                setEventsListError('The list is currently unavailable')
            }
        }
        getInitialEvents()
    }, [formState.category])

    useEffect(() => {
        async function getEventToUpdate() {
            setLoadingEventData(true)
            try {
                const response = await Api().get(`/api/v1/events/${id}`)
                console.log(response)
                setEventsImages(response.data.images)
                setFormState({
                    ...response.data.event,
                    date: response.data.event.date.substring(0, 10),
                    selectedRelatedEvent: '',
                })
                setLoadingEventData(false)
            } catch (err) {
                console.log(err)
                setLoadingEventData(false)
                setEventToUpdateError(
                    err?.response?.data?.error ||
                        'Something went wrong. The event cannot be updated at the moment. Try again later.'
                )
            }
        }

        if (id) getEventToUpdate(id) // if type=create id value is undefined
    }, [id])

    async function handleSubmit(e) {
        e.preventDefault()

        let validationResult = true
        for (let i in formDataErrors) {
            if (formDataErrors[i] && i !== 'selectedRelatedEvent')
                validationResult = false
        }

        if (formDataErrors.uploadedImg) {
            setErrorOnSubmit(
                'Image upload issue. Please upload an image type PNG, JPEG or JPG with size up to 10mb or clear the error to go back to the current event image.'
            )
            setSubmitMessage('')
            return
        }

        const emptyFields = () => {
            let emptyInputs = []
            for (let i in formState) {
                if (i !== 'selectedRelatedEvent' && formState[i] === '') {
                    emptyInputs.push(i)
                }
            }
            return emptyInputs.length
        }

        if (
            !validationResult &&
            !formDataErrors.uploadedImg &&
            emptyFields() === 0
        ) {
            setErrorOnSubmit(
                'Failed to save event data. Ensure all the data are correctly filled.'
            )
            setSubmitMessage('')
            return
        }

        if (emptyFields() > 0) {
            setErrorOnSubmit(
                'Failed to save event data. Please fill out all required fields.'
            )
            setSubmitMessage('')
            setValidationStyle({
                name: true,
                category: true,
                date: true,
                location: true,
                details: true,
                price: true,
                numOfTickets: true,
                relatedEvents: true,
                selectedRelatedEvent: true,
                uploadedImg: true,
            })
            setFormDataErrors({
                name: !formState.name
                    ? 'Please fill out this field.'
                    : formDataErrors.name,
                category: !formState.category
                    ? 'Please fill out this field.'
                    : formDataErrors.category,
                date: !formState.date
                    ? 'Please fill out this field.'
                    : formDataErrors.date,
                location: !formState.location
                    ? 'Please fill out this field.'
                    : formDataErrors.location,
                details: !formState.details
                    ? 'Please fill out this field.'
                    : formDataErrors.details,
                price: !formState.price
                    ? 'Please fill out this field.'
                    : formDataErrors.price,
                numOfTickets: !formState.numOfTickets
                    ? 'Please fill out this field.'
                    : formDataErrors.numOfTickets,
            })

            return
        }

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
                    numOfTickets: formState.numOfTickets,
                    relatedEvents: relatedEventsIDs,
                })
                console.log('res1', res)

                //changed image
                if (formState.uploadedImg) {
                    const res2 = await Api().post(
                        `/api/v1/upload/event/${res.data._id}`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    )
                    console.log('res2', res2)
                }
                setSubmitMessage('Event saved.')
                setTimeout(
                    () =>
                        navigate('/account/profile/events', {
                            viewTransition: true,
                        }),
                    2000
                )
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
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    )
                    console.log('res2', res2)
                }
                setSubmitMessage('Event updated.')
                setTimeout(
                    () =>
                        navigate('/account/profile/events', {
                            viewTransition: true,
                        }),
                    2000
                )
            }
        } catch (err) {
            console.log(err)
            if (err.status === 422) {
                setErrorOnSubmit('Ensure all the data are correctly filled!')
                return
            }
            setErrorOnSubmit(
                err?.response?.data?.error ||
                    'Something went wrong, please try again'
            )
            setSubmitMessage('')
        }
    }

    function changeImage(e) {
        setValidationStyle({
            ...validationStyle,
            uploadedImg: true,
        })
        setErrorOnSubmit('')
        setSubmitMessage('')

        if (e.target.files.length === 0) {
            setFormDataErrors({
                ...formDataErrors,
                uploadedImg: 'No file was uploaded.',
            })

            setFormState({ ...formState, uploadedImg: null })
            return
        }

        if (e.target.files[0].size > 10 * 1024 * 1024) {
            setFormDataErrors({
                ...formDataErrors,
                uploadedImg:
                    'The selected image exceeds the maximal allowed file size.',
            })

            setFormState({ ...formState, uploadedImg: null })
            return
        }

        if (
            !['image/jpeg', 'image/jpg', 'image/png'].includes(
                e.target.files[0].type
            )
        ) {
            setFormDataErrors({
                ...formDataErrors,
                uploadedImg:
                    'Invalid file type. Only PNG, JPEG and JPG files are accepted.',
            })

            setFormState({ ...formState, uploadedImg: null })
            return
        }

        setFormDataErrors({
            ...formDataErrors,
            uploadedImg: '',
        })
        const [imageSelected] = e.target.files
        if (imageSelected) {
            formData = new FormData()
            formData.append('image', imageSelected)
        }

        let src = URL.createObjectURL(imageSelected)
        setFormState({ ...formState, uploadedImg: src })
    }

    if (type === 'update' && loadingEventData) {
        return <Loader></Loader>
    }

    if (type === 'update' && eventToUpdateError) {
        return <h1>{eventToUpdateError}</h1>
    }

    return (
        <div className="new-event-page" style={{ position: 'relative' }}>
            <div className="title-nav">
                <h2>Events</h2>
                <SecondaryNav pageSelected={'events'} />
            </div>
            {errorOnSubmit && <h3 className="submit-error">{errorOnSubmit}</h3>}
            <form noValidate onSubmit={handleSubmit}>
                <div className="form-first-group">
                    <span className="event-name">
                        <label htmlFor="event-name">Event Name*</label>
                        <div>
                            <input
                                style={{
                                    borderWidth: 2,
                                    borderColor: formDataErrors.name
                                        ? 'red'
                                        : validationStyle.name && formState.name
                                        ? 'green'
                                        : 'black',
                                    paddingRight: 25,
                                }}
                                autoComplete="off"
                                value={formState.name}
                                onChange={(e) =>
                                    setFormState({
                                        ...formState,
                                        name: e.target.value,
                                    })
                                }
                                id="event-name"
                                type="text"
                                required
                                maxLength={40}
                                minLength={2}
                                onInput={(e) => {
                                    setErrorOnSubmit('')
                                    setSubmitMessage('')
                                    if (
                                        e.target.validity.valueMissing ||
                                        e.target.validity.tooShort
                                    ) {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            name: e.target.validationMessage,
                                        })
                                    } else {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            name: '',
                                        })
                                    }
                                }}
                                onBlur={() =>
                                    setValidationStyle({
                                        ...validationStyle,
                                        name: true,
                                    })
                                }
                            />
                            {formDataErrors.name && validationStyle.name ? (
                                <InvalidMark />
                            ) : validationStyle.name && formState.name ? (
                                <ValidMark />
                            ) : null}
                            {formState.name.length === 40 && (
                                <p style={{ fontSize: 14 }}>
                                    You have reached maximum number od
                                    characters (40).
                                </p>
                            )}
                        </div>
                        {validationStyle.name && (
                            <span style={{ color: 'red', fontSize: 14 }}>
                                {formDataErrors.name}
                            </span>
                        )}
                    </span>

                    <span className="event-category">
                        <label htmlFor="category">Category*</label>
                        <div>
                            <select
                                style={{
                                    borderWidth: 2,
                                    borderColor: formDataErrors.category
                                        ? 'red'
                                        : validationStyle.category &&
                                          formState.category
                                        ? 'green'
                                        : 'black',
                                }}
                                id="category"
                                required
                                value={formState.category}
                                onChange={(e) => {
                                    setFormState({
                                        ...formState,
                                        category: e.target.value,
                                    })
                                    setErrorOnSubmit('')
                                    setSubmitMessage('')
                                    if (e.target.validity.valueMissing) {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            category:
                                                e.target.validationMessage,
                                        })
                                    } else {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            category: '',
                                        })
                                    }
                                }}
                            >
                                <option value={''} disabled>
                                    Select category ...
                                </option>
                                <option value={'Musical Concert'}>
                                    Musical Concert
                                </option>
                                <option value={'Stand-up Comedy'}>
                                    Stand-up Comedy
                                </option>
                            </select>

                            {formDataErrors.category &&
                            validationStyle.category ? (
                                <InvalidMark />
                            ) : validationStyle.category &&
                              formState.category ? (
                                <ValidMark />
                            ) : null}
                        </div>
                        {validationStyle.category && (
                            <span style={{ color: 'red', fontSize: 14 }}>
                                {formDataErrors.category}
                            </span>
                        )}
                    </span>

                    <span className="event-date">
                        <label htmlFor="date">Date*</label>
                        <div>
                            <input
                                style={{
                                    borderStyle: 'solid',
                                    borderWidth: 2,
                                    borderColor: formDataErrors.date
                                        ? 'red'
                                        : validationStyle.date && formState.date
                                        ? 'green'
                                        : 'black',
                                }}
                                value={formState.date}
                                onChange={(e) =>
                                    setFormState({
                                        ...formState,
                                        date: e.target.value,
                                    })
                                }
                                id="date"
                                type="date"
                                required
                                max={`${new Date().getFullYear() + 2}-12-31`}
                                min={`${new Date().getFullYear()}-01-01`}
                                onInput={(e) => {
                                    setErrorOnSubmit('')
                                    setSubmitMessage('')
                                    if (e.target.validity.valueMissing) {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            date: e.target.validationMessage,
                                        })
                                    } else if (
                                        new Date(e.target.value) < new Date()
                                    ) {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            date: 'Event date is in the past!',
                                        })
                                    } else {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            date: '',
                                        })
                                    }
                                }}
                                onBlur={() =>
                                    setValidationStyle({
                                        ...validationStyle,
                                        date: true,
                                    })
                                }
                            />
                            {formDataErrors.date && validationStyle.date ? (
                                <InvalidMark />
                            ) : validationStyle.date && formState.date ? (
                                <ValidMark />
                            ) : null}
                        </div>
                        {validationStyle.date && (
                            <span style={{ color: 'red', fontSize: 14 }}>
                                {formDataErrors.date}
                            </span>
                        )}
                    </span>

                    <span className="event-location">
                        <label htmlFor="event-location">Location*</label>
                        <div>
                            <input
                                style={{
                                    borderWidth: 2,
                                    borderColor: formDataErrors.location
                                        ? 'red'
                                        : validationStyle.location &&
                                          formState.location
                                        ? 'green'
                                        : 'black',
                                    paddingRight: 25,
                                }}
                                autoComplete="off"
                                value={formState.location}
                                onChange={(e) =>
                                    setFormState({
                                        ...formState,
                                        location: e.target.value,
                                    })
                                }
                                id="event-location"
                                type="text"
                                required
                                maxLength={40}
                                minLength={5}
                                onInput={(e) => {
                                    setErrorOnSubmit('')
                                    setSubmitMessage('')
                                    if (
                                        e.target.validity.valueMissing ||
                                        e.target.validity.tooShort
                                    ) {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            location:
                                                e.target.validationMessage,
                                        })
                                    } else {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            location: '',
                                        })
                                    }
                                }}
                                onBlur={() =>
                                    setValidationStyle({
                                        ...validationStyle,
                                        location: true,
                                    })
                                }
                            />
                            {formDataErrors.location &&
                            validationStyle.location ? (
                                <InvalidMark />
                            ) : validationStyle.location &&
                              formState.location ? (
                                <ValidMark />
                            ) : null}
                            {formState.location.length === 40 && (
                                <p style={{ fontSize: 14 }}>
                                    You have reached maximum number od
                                    characters (40).
                                </p>
                            )}
                        </div>
                        {validationStyle.location && (
                            <span style={{ color: 'red', fontSize: 14 }}>
                                {formDataErrors.location}
                            </span>
                        )}
                    </span>
                </div>
                <div className="form-second-group">
                    <div className="event-photo">
                        <label htmlFor="event-photo">Upload Event Art</label>
                        <div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    id="event-photo"
                                    onChange={changeImage}
                                    className="upload-input"
                                    accept="image/jpeg, image/jpg, image/png"
                                />
                                {formDataErrors.uploadedImg ? (
                                    <InvalidMark />
                                ) : null}
                            </div>

                            <img
                                src={
                                    formDataErrors.uploadedImg
                                        ? noImageIcon
                                        : formState.uploadedImg
                                        ? formState.uploadedImg
                                        : type === 'update' &&
                                          eventsImages &&
                                          eventsImages[id]
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
                        <span style={{ color: 'red', fontSize: 14 }}>
                            {formDataErrors.uploadedImg}
                        </span>
                        {formDataErrors.uploadedImg && (
                            <button
                                className="white-button"
                                style={{
                                    fontWeight: 700,
                                    fontSize: 18,
                                    border: '2px solid red',
                                    height: 36,
                                }}
                                onClick={() => {
                                    setFormDataErrors({
                                        ...formDataErrors,
                                        uploadedImg: '',
                                    })
                                    setSubmitMessage('')
                                    setErrorOnSubmit('')
                                }}
                            >
                                Clear error
                            </button>
                        )}
                    </div>

                    <div>
                        <span className="event-details">
                            <label htmlFor="event-details">
                                Event Details*
                            </label>
                            <div style={{ position: 'relative' }}>
                                {formDataErrors.details &&
                                validationStyle.details ? (
                                    <InvalidMark />
                                ) : validationStyle.details &&
                                  formState.details ? (
                                    <ValidMark />
                                ) : null}
                                <textarea
                                    style={{
                                        display: 'block',
                                        borderWidth: 2,
                                        borderColor: formDataErrors.details
                                            ? 'red'
                                            : validationStyle.details &&
                                              formState.details
                                            ? 'green'
                                            : 'black',
                                    }}
                                    autoComplete="off"
                                    value={formState.details}
                                    onChange={(e) =>
                                        setFormState({
                                            ...formState,
                                            details: e.target.value,
                                        })
                                    }
                                    id="event-details"
                                    required
                                    maxLength={300}
                                    minLength={10}
                                    onInput={(e) => {
                                        setErrorOnSubmit('')
                                        setSubmitMessage('')
                                        if (
                                            e.target.validity.valueMissing ||
                                            e.target.validity.tooShort
                                        ) {
                                            setFormDataErrors({
                                                ...formDataErrors,
                                                details:
                                                    e.target.validationMessage,
                                            })
                                        } else {
                                            setFormDataErrors({
                                                ...formDataErrors,
                                                details: '',
                                            })
                                        }
                                    }}
                                    onBlur={() =>
                                        setValidationStyle({
                                            ...validationStyle,
                                            details: true,
                                        })
                                    }
                                />
                                {formState.details.length === 300 && (
                                    <span
                                        style={{
                                            display: 'block',
                                            fontSize: 14,
                                        }}
                                    >
                                        You have reached maximum number od
                                        characters (300).
                                    </span>
                                )}
                            </div>
                            {validationStyle.details && (
                                <span style={{ color: 'red', fontSize: 14 }}>
                                    {formDataErrors.details}
                                </span>
                            )}
                        </span>
                        <span className="event-price">
                            <label htmlFor="price">Ticket Price (USD)*</label>
                            <div>
                                <input
                                    style={{
                                        borderWidth: 2,
                                        borderColor: formDataErrors.price
                                            ? 'red'
                                            : validationStyle.price &&
                                              formState.price
                                            ? 'green'
                                            : 'black',
                                    }}
                                    autoComplete="off"
                                    type="number"
                                    id="price"
                                    value={formState.price}
                                    onChange={(e) =>
                                        setFormState({
                                            ...formState,
                                            price: e.target.value,
                                        })
                                    }
                                    required
                                    min={1}
                                    step={0.01}
                                    onInput={(e) => {
                                        setErrorOnSubmit('')
                                        setSubmitMessage('')

                                        if (
                                            e.target.validity.valueMissing ||
                                            e.target.validity.rangeUnderflow ||
                                            e.target.validity.stepMismatch
                                        ) {
                                            setFormDataErrors({
                                                ...formDataErrors,
                                                price: e.target
                                                    .validationMessage,
                                            })
                                        } else {
                                            setFormDataErrors({
                                                ...formDataErrors,
                                                price: '',
                                            })
                                        }
                                    }}
                                    onBlur={() =>
                                        setValidationStyle({
                                            ...validationStyle,
                                            price: true,
                                        })
                                    }
                                />
                                {formDataErrors.price &&
                                validationStyle.price ? (
                                    <InvalidMark />
                                ) : validationStyle.price && formState.price ? (
                                    <ValidMark />
                                ) : null}
                            </div>
                            {validationStyle.price && (
                                <span style={{ color: 'red', fontSize: 14 }}>
                                    {formDataErrors.price}
                                </span>
                            )}
                        </span>
                        {type === 'create' && (
                            <span className="tickets-num">
                                <label htmlFor="tickets-num">
                                    Number of tickets*
                                </label>
                                <div>
                                    <input
                                        style={{
                                            borderWidth: 2,
                                            borderColor:
                                                formDataErrors.numOfTickets
                                                    ? 'red'
                                                    : validationStyle.numOfTickets &&
                                                      formState.numOfTickets
                                                    ? 'green'
                                                    : 'black',
                                        }}
                                        autoComplete="off"
                                        type="number"
                                        id="tickets-num"
                                        value={formState.numOfTickets}
                                        onChange={(e) =>
                                            setFormState({
                                                ...formState,
                                                numOfTickets: e.target.value,
                                            })
                                        }
                                        required
                                        min={1}
                                        step={1}
                                        onInput={(e) => {
                                            setErrorOnSubmit('')
                                            setSubmitMessage('')

                                            if (
                                                e.target.validity
                                                    .valueMissing ||
                                                e.target.validity
                                                    .rangeUnderflow ||
                                                e.target.validity.stepMismatch
                                            ) {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    numOfTickets:
                                                        e.target
                                                            .validationMessage,
                                                })
                                            } else {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    numOfTickets: '',
                                                })
                                            }
                                        }}
                                        onBlur={() =>
                                            setValidationStyle({
                                                ...validationStyle,
                                                numOfTickets: true,
                                            })
                                        }
                                    />
                                    {formDataErrors.numOfTickets &&
                                    validationStyle.numOfTickets ? (
                                        <InvalidMark />
                                    ) : validationStyle.numOfTickets &&
                                      formState.numOfTickets ? (
                                        <ValidMark />
                                    ) : null}
                                </div>

                                {validationStyle.numOfTickets && (
                                    <span
                                        style={{ color: 'red', fontSize: 14 }}
                                    >
                                        {formDataErrors.numOfTickets}
                                    </span>
                                )}
                            </span>
                        )}
                    </div>
                </div>

                <div className="form-third-group">
                    <label
                        htmlFor="related-events"
                        style={{ display: 'block' }}
                    >
                        Related Events
                    </label>
                    <select
                        style={{
                            borderBottomRightRadius: selectSize === 0 ? 21 : 0,
                        }}
                        ref={selectRef}
                        size={selectSize}
                        id="related-events"
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
                        onFocus={() => {
                            setSelectSize(5)
                            setFormDataErrors({
                                ...formDataErrors,
                                selectedRelatedEvent: '',
                            })
                        }}
                        onBlur={() => setSelectSize(0)}
                    >
                        <option value="" disabled>
                            Select related event
                        </option>
                        {eventsListError && (
                            <option disabled>{eventsListError}</option>
                        )}
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
                        {loadingMoreRelatedEvents ? (
                            <option
                                style={{
                                    fontWeight: '900',
                                    letterSpacing: '3px',
                                    color: 'black',
                                    marginLeft: 10,
                                }}
                                disabled
                            >
                                .....
                            </option>
                        ) : (
                            <option></option>
                        )}
                    </select>
                    {validationStyle.selectedRelatedEvent && (
                        <p
                            style={{
                                color: 'red',
                                fontSize: 14,
                                margin: '5px 0 0 15px',
                            }}
                        >
                            {formDataErrors.selectedRelatedEvent}
                        </p>
                    )}
                    <button
                        onClick={() => {
                            if (formState.selectedRelatedEvent) {
                                getRelatedEvent(formState.selectedRelatedEvent)
                            } else {
                                setFormDataErrors({
                                    ...formDataErrors,
                                    selectedRelatedEvent:
                                        'No event selected. Please select an event to add to the list of related events.',
                                })
                            }
                            setValidationStyle({
                                ...validationStyle,
                                selectedRelatedEvent: true,
                            })
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
                                    hideDetails={true}
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
                    type="submit"
                    className="submit-event"
                    onClick={handleSubmit}
                >
                    Save
                </button>
            </form>
            {submitMessage && (
                <h3 className="submit-message">
                    <ValidMark /> {submitMessage}
                </h3>
            )}
        </div>
    )
}
