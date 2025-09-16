import convertDate from '../convertDate'

export default function EventCard({
    event,
    imageSrc,
    ButtonComponent,
    UpdateLink,
}) {
    return (
        <div className="event-card">
            <div className="event-image">
                <img src={imageSrc} alt="event" />
            </div>
            <div className="event-info">
                {!UpdateLink ? <h4>{event.name}</h4> : UpdateLink}
                <h5>{convertDate(event.date)}</h5>
                <p>{event.details.substring(0, 150)}...</p>
                <div>
                    <span>{event.location}</span>
                    {ButtonComponent}
                </div>
            </div>
        </div>
    )
}
