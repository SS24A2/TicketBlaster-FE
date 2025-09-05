import SecondaryNav from '../components/SecondaryNav'

export default function TicketsHistory() {
    return (
        <div className="profile-page">
            <div className="title-nav">
                <h2>Tickets History</h2>
                <SecondaryNav pageSelected={'tickets'} />
            </div>
            <div>Listed tickets</div>
        </div>
    )
}
