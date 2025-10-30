export default function errorHandling(err) {
    let errorMessage = null
    if (err.response?.status && err.response.status === 422) {
        errorMessage =
            err.response.data.fullname?.message ||
            err.response.data.email?.message ||
            err.response.data.password?.message ||
            err.response.data.confirmPassword?.message
    } else {
        errorMessage = err.response?.data || err.message
        if (errorMessage === 'MailgunAPIError')
            errorMessage = 'Confirmation email cannot be send!'
    }
    return errorMessage
}
