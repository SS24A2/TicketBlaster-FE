import { useNavigate } from 'react-router-dom'
import '../styles/not-found-page.css'

export default function NotFound() {
    const navigate = useNavigate()
    return (
        <div className="not-found-page">
            <h1>404</h1>
            <h2>PAGE NOT FOUND</h2>
            <button onClick={() => navigate('/')} className="pink-button">
                Go to Homepage
            </button>
        </div>
    )
}
