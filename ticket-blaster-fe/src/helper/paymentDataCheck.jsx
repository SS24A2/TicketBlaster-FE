//proverka na paymentDataCheck f-ta;

export default function paymentDataCheck({
    fullname,
    cardNumber,
    cardExpiry,
    pin,
}) {
    console.log('fullname', `${fullname}end`)
    const fullnamePattern = /^[A-Z]{1}[a-z]{1,}(?: [A-Z]{1}[a-z]{1,}){1,3}$/ //The name should contain from 2-4 words (separated with 1 space) each of them starting with capital letter and then at least one lowercase letter
    if (!fullnamePattern.test(fullname)) {
        return 'Incorrect full name!'
    }
    const cardNumPattern = /^(?:\d[ -]*?){16}$/ //16 digits long (Visa, Mastercard), can have spaces or hyphens in between the numbers
    if (!cardNumPattern.test(cardNumber)) {
        return 'Incorrect card number!'
    }

    const dateNow = new Date()
    const dateNowFormated = `${dateNow.getFullYear()}-${dateNow.getMonth() + 1}`
    if (!cardExpiry) {
        return 'Card Expiry must be entered!'
    }
    if (new Date(cardExpiry) < new Date(dateNowFormated)) {
        return 'Credit card expired!'
    }

    const cardPinPattern = /^(\d{4}|\d{6})$/ //4 or 6 digits pin
    if (!cardPinPattern.test(pin)) {
        return 'Incorrect card PIN!'
    }
    return null
}
