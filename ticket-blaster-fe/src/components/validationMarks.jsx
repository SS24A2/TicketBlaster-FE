export function ValidMark() {
    return (
        <span
            style={{
                color: 'green',
                fontSize: 20,
                fontWeight: 900,
            }}
        >
            &#10003;
        </span>
    )
}

export function InvalidMark() {
    return (
        <span
            style={{
                color: 'red',
                fontSize: 20,
                fontWeight: 900,
            }}
        >
            x
        </span>
    )
}

export function ResetPasswordSuccess() {
    return (
        <div
            style={{
                width: 100,
                height: 100,
                border: '3px solid green',
                fontSize: 40,
                fontWeight: 900,
                color: 'green',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            &#10003;
        </div>
    )
}
