import { Link } from 'react-router-dom'

export default function ButtonGetTickets({ eventId }) {
    return (
        <button className="get-tickets-btn">
            <Link to={`/event/${eventId}`} viewTransition>
                Get tickets
            </Link>
        </button>
    )
}
