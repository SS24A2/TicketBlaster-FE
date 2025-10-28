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
            <section className="all-tickets">
                {ticketsforSelectedEvent.map((t, index) => (
                    <div
                        className="modal-tickets"
                        key={index}
                        style={{
                            display: index === ticketIndex ? 'block' : 'none',
                        }}
                    >
                        <div
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsTicketsModalOpen(false)
                                setTicketIndex(0)
                            }}
                            dangerouslySetInnerHTML={{
                                __html: ticketsforSelectedEvent[index].ticket,
                            }}
                        ></div>
                        {ticketsforSelectedEvent.length > 1 &&
                            ticketIndex <
                                ticketsforSelectedEvent.length - 1 && (
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
                        {ticketsforSelectedEvent.length > 1 &&
                            ticketIndex > 0 && (
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
                                Ticket number:{index + 1}
                            </h5>
                        )}
                    </div>
                ))}
            </section>
        </div>
    )
}
