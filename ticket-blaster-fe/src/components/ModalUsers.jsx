function setModalParameters(currentModalType) {
    const parameters = {}
    parameters.text =
        currentModalType === 'delete'
            ? 'You are about to delete a user. Please proceed with caution.'
            : currentModalType === 'makeAdmin'
            ? 'You are about to make a user administrator of the system. Please proceed with caution.'
            : 'You are about to downgrade a user from administrator. Please proceed with caution.'

    parameters.action =
        currentModalType === 'delete'
            ? 'Delete user'
            : currentModalType === 'makeAdmin'
            ? 'Make user admin'
            : 'Downgrade user'

    return parameters
}

export default function ModalUsers({ modal, cancelModal, confirmModal }) {
    return (
        <div className="modal-users">
            <div className="modal-users-wrapper">
                <h4>Are you sure?</h4>
                <p>{setModalParameters(modal.type).text}</p>
                <div className="modal-users-buttons">
                    <button onClick={cancelModal}>Cancel</button>
                    <button
                        className="modal-users-confirm-button"
                        onClick={() => {
                            confirmModal(modal)
                        }}
                    >
                        {setModalParameters(modal.type).action}
                    </button>
                </div>
            </div>
        </div>
    )
}
