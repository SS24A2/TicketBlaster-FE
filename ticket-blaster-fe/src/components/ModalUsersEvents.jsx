function setModalParameters(currentModalType) {
    const parameters = {}
    parameters.text =
        currentModalType === 'deleteEvent'
            ? 'You are about to delete an event from the system. Please proceed with caution.'
            : currentModalType === 'deleteUser'
            ? 'You are about to delete a user. Please proceed with caution.'
            : currentModalType === 'makeAdmin'
            ? 'You are about to make a user administrator of the system. Please proceed with caution.'
            : 'You are about to downgrade a user from administrator. Please proceed with caution.'

    parameters.action =
        currentModalType === 'deleteEvent'
            ? 'Delete event'
            : currentModalType === 'deleteUser'
            ? 'Delete user'
            : currentModalType === 'makeAdmin'
            ? 'Make user admin'
            : 'Downgrade user'

    return parameters
}

export default function ModalUsersEvents({ modal, cancelModal, confirmModal }) {
    if (modal.type === 'deleteSuccess') {
        return (
            <div className="modal-users-events-background">
                <div className="modal-users-events">
                    <div className="modal-users-events-wrapper delete-success">
                        <h4>The selected event was succesfully deleted.</h4>
                        <div className="modal-users-events-buttons">
                            <button onClick={cancelModal}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    if (modal.type === 'deleteFail') {
        return (
            <div className="modal-users-events-background">
                <div className="modal-users-events">
                    <div className="modal-users-events-wrapper delete-fail">
                        <h4>Failed to delete the selected event!</h4>
                        {modal.message && <h3>{modal.message}</h3>}
                        <div className="modal-users-events-buttons">
                            <button onClick={cancelModal}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (modal.type === 'deleteInProgress') {
        return (
            <div className="modal-users-events-background">
                <div className="modal-users-events">
                    <div className="modal-users-events-wrapper delete-loading">
                        <div className="loader"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="modal-users-events-background">
            <div className="modal-users-events">
                <div className="modal-users-events-wrapper">
                    <h4>Are you sure?</h4>
                    <p>{setModalParameters(modal.type).text}</p>
                    <div className="modal-users-events-buttons">
                        <button onClick={cancelModal}>Cancel</button>
                        <button
                            className="modal-users-events-confirm-button"
                            onClick={() => {
                                confirmModal(modal)
                            }}
                        >
                            {setModalParameters(modal.type).action}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
