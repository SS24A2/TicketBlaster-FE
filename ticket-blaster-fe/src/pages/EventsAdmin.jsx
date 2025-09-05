import { Link } from 'react-router-dom'

import SecondaryNav from '../components/SecondaryNav'

export default function EventsAdmin() {
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

                <SecondaryNav pageSelected={'events'} />
            </div>
            <div>Listed events</div>
        </div>
    )
}
