import { useNavigate } from 'react-router-dom'

export default function NotFound() {
    const navigate = useNavigate()
    return (
        <div>
            <h1>404</h1>
            <h2>PAGE NOT FOUND</h2>
            <button onClick={() => navigate('/')} className="pink-button">
                Go to Homepage
            </button>
        </div>
    )
}
