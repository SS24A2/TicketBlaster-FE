import { useState } from 'react'

import nextIcon from '../assets/icon-next.svg'
import previousIcon from '../assets/icon-previous.svg'

export default function TicketsModal({
    ticketsforSelectedEvent,
    setIsTicketsModalOpen,
}) {
    const [modalBackgroundBlink, setModalBackgroundBlink] = useState(false)
    const [ticketIndex, setTicketIndex] = useState(0)

    return (
        <div
            className={`modal-tickets-background  ${
                modalBackgroundBlink ? 'blinking-effect' : ''
            }`}
            onClick={() => {
                setModalBackgroundBlink(true)
                setTimeout(() => {
                    setModalBackgroundBlink(false)
                }, 500)
            }}
        >
            <div className="modal-tickets">
                <div
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsTicketsModalOpen(false)
                        setTicketIndex(0)
                    }}
                    dangerouslySetInnerHTML={{
                        __html: ticketsforSelectedEvent[ticketIndex].ticket,
                    }}
                ></div>
                {ticketsforSelectedEvent.length > 1 &&
                    ticketIndex < ticketsforSelectedEvent.length - 1 && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation()
                                setTicketIndex(
                                    (ticketIndex + 1) %
                                        ticketsforSelectedEvent.length
                                )
                            }}
                            className="next-ticket"
                        >
                            <img src={nextIcon} alt="next" />
                        </span>
                    )}
                {ticketsforSelectedEvent.length > 1 && ticketIndex > 0 && (
                    <span
                        onClick={(e) => {
                            e.stopPropagation()
                            setTicketIndex(
                                (ticketIndex +
                                    ticketsforSelectedEvent.length -
                                    1) %
                                    ticketsforSelectedEvent.length
                            )
                        }}
                        className="previous-ticket"
                    >
                        <img src={previousIcon} alt="previous" />
                    </span>
                )}
                {ticketsforSelectedEvent.length > 1 && (
                    <h5 className="ticket-num">
                        Ticket number: {ticketIndex + 1}
                    </h5>
                )}
            </div>
        </div>
    )
}
