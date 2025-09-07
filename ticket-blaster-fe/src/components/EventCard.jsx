import { Link } from 'react-router-dom'
import generalAvatar from '../assets/general-avatar.png'
import convertDate from '../convertDate'

export default function EventCard({ event }) {
    return (
        <div className="event-card">
            <div className="event-image">
                <img src={generalAvatar} alt="event" />
            </div>
            <div className="event-info">
                <h4>{event.name}</h4>
                <h5>{convertDate(event.date)}</h5>
                <p>{event.details.substring(0, 150)}...</p>
                <div>
                    <span>{event.location}</span>
                    <button>
                        <Link to={`/event/${event._id}`}>Get tickets</Link>
                    </button>
                </div>
            </div>
        </div>
    )
}
