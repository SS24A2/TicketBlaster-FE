export default function inputNormalization(inputValue) {
    return inputValue
        .replace(/\s+/g, ' ')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim()
}
