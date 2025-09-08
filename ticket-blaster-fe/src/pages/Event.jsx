import { useParams } from 'react-router-dom'

export default function Event() {
    let { id } = useParams()
    return <div>{id}</div>
}
