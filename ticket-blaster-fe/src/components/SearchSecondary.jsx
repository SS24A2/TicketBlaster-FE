import { useEffect, useState } from 'react'
import '../styles/secondary-nav.css'

export default function SearchSecondary({
    searchInput,
    setSearchInput,
    isSearchLoading,
}) {
    const [searchLoadingMessage, setSearchLoadingMessage] = useState('')

    //after 300ms check if there are no results from the search, if so, inform the user that the results are loading
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isSearchLoading) setSearchLoadingMessage(true)
        }, 300)
        return () => {
            clearTimeout(timeoutId)
            setSearchLoadingMessage(false)
        }
    }, [isSearchLoading])

    return (
        <div className="secondary-nav">
            <input
                autoComplete="off"
                type="text"
                placeholder="Search"
                name="search"
                value={searchInput}
                onChange={(e) => {
                    if (e.target.value.length <= 40) {
                        setSearchInput(e.target.value)
                    }
                }}
                style={{ paddingRight: 20 }}
            />
            {searchInput.length === 40 && (
                <p
                    style={{
                        margin: 0,
                        position: 'absolute',
                        fontSize: 12,
                        paddingLeft: 10,
                    }}
                >
                    You have reached maximum number od characters (40).
                </p>
            )}
            {searchLoadingMessage && searchInput && (
                <p
                    style={{
                        margin: 0,
                        position: 'absolute',
                        fontSize: 16,
                        bottom: '60%',
                        paddingLeft: 10,
                    }}
                >
                    Loading search results, please wait
                </p>
            )}
        </div>
    )
}
