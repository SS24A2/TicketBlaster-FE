import { useSearchParams } from 'react-router-dom'
import Homepage from './Homepage'
import ResetPassword from './ResetPassword'

export default function SearchDispatcher() {
    const [searchParams] = useSearchParams()
    const type = searchParams.get('type') // Get the 'view' param (e.g., ?view=list)

    // Conditionally return different components
    if (type === 'reset') return <ResetPassword />

    return <Homepage />
}
