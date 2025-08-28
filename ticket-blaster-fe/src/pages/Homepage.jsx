import { jwtDecode } from 'jwt-decode'

function getEmailFromToken() {
    const token = localStorage.getItem('token')
    if (!token) return null

    const decoded = jwtDecode(token)
    console.log(decoded)
    // Ako decoded.email ne postoi ke se vrati null
    return decoded?.email
}

export default function Homepage() {
    const email = getEmailFromToken()

    return (
        <div>
            <h1>Welcome</h1>
        </div>
    )
}
