import { useEffect, useState } from 'react'

export default function SearchSecondary({
    searchInput,
    setSearchInput,
    searchInputError,
    setSearchInputError,
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
            {searchInputError && (
                <p style={{ width: 200, fontSize: 14 }}>{searchInputError}</p>
            )}
            <input
                autoComplete="off"
                type="text"
                placeholder="Search"
                name="search"
                value={searchInput}
                onChange={(e) => {
                    if (e.target.value === ' ') return

                    setSearchInputError(null)

                    const regex = /^[a-zA-Z0-9 ]*$/g
                    if (!regex.test(e.target.value)) {
                        setSearchInputError(
                            `${e.target.value.at(-1)} is invalid character!`
                        )
                        return
                    }

                    if (
                        e.target.value.at(-1) === ' ' &&
                        e.target.value.at(-2) === ' '
                    ) {
                        setSearchInput(e.target.value.slice(0, -1))
                    } else {
                        setSearchInput(e.target.value)
                    }
                }}
                onBlur={() => setSearchInputError(null)}
            />
            <p style={{ fontSize: 12, maxWidth: 200, fontStyle: 'italic' }}>
                Please enter a search term without any special characters. You
                can use letters, numbers and empty spaces.
            </p>

            {searchLoadingMessage && searchInput && (
                <p>Loading search results, please wait</p>
            )}
        </div>
    )
}
