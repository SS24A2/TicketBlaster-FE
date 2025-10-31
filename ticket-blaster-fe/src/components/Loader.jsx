import '../styles/loader.css'

export default function Loader({ children }) {
    return (
        <div
            style={{
                position: 'fixed',
                width: '100vw',
                height: '100vh',
                top: 0,
                background: '#0d0d0d30',
                display: 'flex',
                flexDirection: 'column',
                gap: 30,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <h2
                style={{
                    color: 'deeppink',
                }}
            >
                {children}
            </h2>
            <div className="loader"></div>
        </div>
    )
}
