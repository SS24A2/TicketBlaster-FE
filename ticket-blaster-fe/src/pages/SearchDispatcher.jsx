import { useSearchParams } from 'react-router-dom'

export default function SearchDispatcher() {
    const [searchParams] = useSearchParams()
    const type = searchParams.get('type') // Get the 'view' param (e.g., ?view=list)

    // Conditionally return different components
    if (type === 'reset') return <ResetPassword />

    return <Homepage />
}
