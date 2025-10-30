import { useEffect, useState } from 'react'

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
        <div>
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
            />
            {searchInput.length === 40 && (
                <span>You have reached maximum number od characters (40).</span>
            )}
            {searchLoadingMessage && searchInput && (
                <p>Loading search results, please wait</p>
            )}
        </div>
    )
}
