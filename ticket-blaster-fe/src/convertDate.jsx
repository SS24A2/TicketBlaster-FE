export default function convertDate(dateFromDB) {
    let options = { year: 'numeric', month: 'long', day: 'numeric' }
    let date = new Date(dateFromDB)
    return date.toLocaleDateString('en-US', options)
}
