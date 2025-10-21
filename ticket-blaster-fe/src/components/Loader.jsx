export default function Loader() {
    return (
        <div className="modal-users-events-background">
            <div className="modal-users-events">
                <div
                    className="modal-users-events-wrapper"
                    style={{ width: 200, margin: '20px auto' }}
                >
                    <h3 style={{ textAlign: 'center' }}>Loading ...</h3>
                    <div
                        style={{ margin: '50px auto' }}
                        className="loader"
                    ></div>
                </div>
            </div>
        </div>
    )
}
