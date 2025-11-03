import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import SecondaryNav from '../components/SecondaryNav'
import generalAvatar from '../assets/general-avatar.png'
import noImageIcon from '../assets/Image-not-found.png'
import Api from '../Api'
import AuthContext from '../context/AuthContext'
import { InvalidMark, ValidMark } from '../components/validationMarks'
import Loader from '../components/Loader'

let formData = null

export default function UserDetails() {
    const navigate = useNavigate()
    const { handleLogout } = useContext(AuthContext)

    const [user, setUser] = useState(null)
    const [image, setImage] = useState(null)

    const [uploadedImg, setUploadedImg] = useState(null)
    const [fullname, setFullname] = useState('')
    const [email, setEmail] = useState('')
    const [isUploadedImgChanged, setIsUploadedImgChanged] = useState(false)

    const [isPasswordFormShown, setIsPasswordFormShown] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [submitMessage, setSubmitMessage] = useState('')
    const [loadingUserData, setLoadingUserData] = useState(false)
    const [errorOnSubmitFormOne, setErrorOnSubmitFormOne] = useState('')
    const [errorOnSubmitFormTwo, setErrorOnSubmitFormTwo] = useState('')

    const [formDataErrors, setFormDataErrors] = useState({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
        uploadedImg: '',
    })
    const [validationStyle, setValidationStyle] = useState({
        fullname: false,
        email: false,
        password: false,
        confirmPassword: false,
        uploadedImg: false,
    })

    async function getUser() {
        setLoadingUserData(true)
        try {
            const res = await Api().get(`/api/v1/users/user`)
            console.log(res)
            setUser(res.data.user)
            setImage(res.data.image)
            setFullname(res.data.user.fullname)
            setEmail(res.data.user.email)
            setLoadingUserData(false)
        } catch (err) {
            console.log(err)
            setLoadingUserData(false)
        }
    }

    useEffect(() => {
        getUser()
    }, [])

    async function handleDetailsChange(e) {
        e.preventDefault()

        let validationResult = true
        if (
            formDataErrors.fullname ||
            formDataErrors.email ||
            formDataErrors.uploadedImg
        ) {
            validationResult = false
        }

        if (formDataErrors.uploadedImg) {
            setErrorOnSubmitFormOne(
                'Failed to change user details due to image upload issue. Please upload an image type PNG, JPEG or JPG with size up to 10mb or clear the error to go back to your current avatar.'
            )
            setSubmitMessage('')
            return
        }

        if (
            !validationResult &&
            email &&
            fullname &&
            !formDataErrors.uploadedImg
        ) {
            setErrorOnSubmitFormOne(
                'Failed to change user details. Ensure all the data are correctly filled.'
            )

            setSubmitMessage('')
            return
        }

        if (!email || !fullname) {
            setErrorOnSubmitFormOne(
                'Failed to change user details. Please fill out all required fields.'
            )
            setSubmitMessage('')
            return
        }
        try {
            //changed image
            if (uploadedImg) {
                if (
                    !isUploadedImgChanged &&
                    fullname === user.fullname &&
                    email === user.email
                ) {
                    setSubmitMessage('No changes were made.')
                    setErrorOnSubmitFormOne('')
                    return
                }
                const res2 = await Api().post(
                    `/api/v1/upload/user/${user._id}`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                console.log('res2', res2)
                setIsUploadedImgChanged(false)
                if (fullname === user.fullname && email === user.email) {
                    setErrorOnSubmitFormOne('')
                    setSubmitMessage('Avatar successfully changed.')
                    return
                }
            }
            //changed fullname
            if (fullname !== user.fullname && email === user.email) {
                const res = await Api().put(`/api/v1/users/details`, {
                    fullname,
                })
                console.log('res1', res)
                setErrorOnSubmitFormOne('')
                setSubmitMessage(
                    uploadedImg && isUploadedImgChanged
                        ? 'Fullname and avatar successfully changed.'
                        : 'Fullname successfully changed.'
                )
                getUser()
                return
            }
            //changed email
            if (fullname === user.fullname && email !== user.email) {
                const res = await Api().put(`/api/v1/users/details`, {
                    email,
                })
                console.log('res1', res)
                handleLogout()
                navigate(
                    '/account/login',
                    { state: { emailChanged: true } },
                    { viewTransition: true }
                )
                return
            }
            //changed fullname and email
            if (fullname !== user.fullname && email !== user.email) {
                const res = await Api().put(`/api/v1/users/details`, {
                    fullname,
                    email,
                })
                console.log('res1', res)
                handleLogout()
                navigate(
                    '/account/login',
                    { state: { emailChanged: true } },
                    { viewTransition: true }
                )
                return
            }
            //none of the details are changed
            if (
                fullname === user.fullname &&
                email === user.email &&
                !uploadedImg
            ) {
                setSubmitMessage('No changes were made.')
                setErrorOnSubmitFormOne('')
            }
        } catch (err) {
            console.log(err)
            setErrorOnSubmitFormOne(
                err.response?.data?.error ||
                    'Something went wrong, please try again.'
            )
            setValidationStyle({
                ...validationStyle,
                fullname: false,
                email: false,
                uploadedImg: false,
            })
            setSubmitMessage('')
        }
    }

    async function handlePasswordChange(e) {
        e.preventDefault()

        let validationResult = true
        if (formDataErrors.password || formDataErrors.confirmPassword) {
            validationResult = false
        }

        if (!password || !confirmPassword) {
            setErrorOnSubmitFormTwo(
                'Failed to change your password. Please fill out all required fields.'
            )
            setFormDataErrors({
                ...formDataErrors,
                password: 'Please fill out this field!',
                confirmPassword: 'Please fill out this field!',
            })
            setValidationStyle({
                ...validationStyle,
                password: true,
                confirmPassword: true,
            })
            setSubmitMessage('')
            return
        }

        if (!validationResult) {
            setErrorOnSubmitFormTwo(
                'Failed to change your password. Ensure your password entries are identical and are correctly filled.'
            )
            setSubmitMessage('')
            return
        }

        try {
            const res = await Api().put(`/api/v1/users/password`, {
                password,
                confirmPassword,
            })
            console.log(res)
            handleLogout()
            navigate(
                '/account/login',
                { state: { passwordReset: true } },
                { viewTransition: true }
            )
        } catch (err) {
            console.log(err)
            setErrorOnSubmitFormTwo(
                err.response?.data?.error ||
                    'Something went wrong, please try again.'
            )
            setValidationStyle({
                ...validationStyle,
                password: false,
                confirmPassword: false,
            })
            setSubmitMessage('')
        }
    }

    function changeAvatar(e) {
        console.log(e.target.files, uploadedImg)
        setValidationStyle({
            ...validationStyle,
            uploadedImg: true,
        })
        setErrorOnSubmitFormOne('')
        setSubmitMessage('')

        if (e.target.files.length === 0) {
            setFormDataErrors({
                ...formDataErrors,
                uploadedImg: 'No file was uploaded.',
            })
            setIsUploadedImgChanged(false)
            setUploadedImg(null)
            return
        }

        if (e.target.files[0].size > 10 * 1024 * 1024) {
            setFormDataErrors({
                ...formDataErrors,
                uploadedImg:
                    'The selected image exceeds the maximal allowed file size.',
            })
            setIsUploadedImgChanged(false)
            setUploadedImg(null)
            return
        }

        if (
            !['image/jpeg', 'image/jpg', 'image/png'].includes(
                e.target.files[0].type
            )
        ) {
            setFormDataErrors({
                ...formDataErrors,
                uploadedImg:
                    'Invalid file type. Only PNG, JPEG and JPG files are accepted.',
            })
            setIsUploadedImgChanged(false)
            setUploadedImg(null)
            return
        }
        setFormDataErrors({
            ...formDataErrors,
            uploadedImg: '',
        })
        const [imageSelected] = e.target.files
        if (imageSelected) {
            formData = new FormData()
            formData.append('image', imageSelected)
        }
        let src = URL.createObjectURL(imageSelected)
        setUploadedImg(src)
        setIsUploadedImgChanged(true)
    }
    //only shown on initial render not on subsequent getUser calls
    if (!fullname && loadingUserData) {
        return <Loader></Loader>
    }

    return (
        <div className="profile-page">
            <div className="title-nav">
                <h2>User Details</h2>
                <SecondaryNav pageSelected={'details'} />
            </div>

            {errorOnSubmitFormOne &&
                !formDataErrors.fullname &&
                !formDataErrors.email &&
                !formDataErrors.uploadedImg && (
                    <h3
                        style={{ top: '80%', right: '23%' }}
                        className="user-details-submit-error"
                    >
                        {errorOnSubmitFormOne}
                    </h3>
                )}
            {errorOnSubmitFormTwo &&
                !formDataErrors.password &&
                !formDataErrors.confirmPassword && (
                    <h3
                        style={{ top: '80%', right: '23%' }}
                        className="user-details-submit-error"
                    >
                        {errorOnSubmitFormTwo}
                    </h3>
                )}
            {submitMessage && (
                <h3 className="user-details-submit-message">{submitMessage}</h3>
            )}
            <div>
                <form noValidate onSubmit={handleDetailsChange}>
                    <div
                        className="profile-first-form"
                        style={{ position: 'relative' }}
                    >
                        <div className="upload-avatar-wrapper">
                            <img
                                src={
                                    formDataErrors.uploadedImg
                                        ? noImageIcon
                                        : uploadedImg
                                        ? uploadedImg
                                        : image
                                        ? `${
                                              import.meta.env
                                                  .VITE_REACT_APP_BACKEND_API
                                          }/${image}`
                                        : generalAvatar
                                }
                                alt="user-avatar"
                                className="user-avatar"
                            />
                            <label htmlFor="avatar">Upload Avatar</label>
                            <span
                                className="validation-message"
                                style={{ height: 60, textAlign: 'center' }}
                            >
                                {formDataErrors.uploadedImg}
                            </span>
                            {formDataErrors.uploadedImg && (
                                <button
                                    onClick={() => {
                                        setFormDataErrors({
                                            ...formDataErrors,
                                            uploadedImg: '',
                                        })
                                        setSubmitMessage('')
                                        setErrorOnSubmitFormOne('')
                                    }}
                                >
                                    Clear error
                                </button>
                            )}

                            <input
                                type="file"
                                id="avatar"
                                onChange={changeAvatar}
                                className="file-input-user"
                                accept="image/jpeg, image/jpg, image/png"
                            />
                        </div>
                        <div className="user-details">
                            <div
                                className="details-name"
                                style={{ display: 'block', height: 100 }}
                            >
                                <label htmlFor="fullname">Full Name</label>
                                <div
                                    style={{
                                        display: 'block',
                                        position: 'relative',
                                    }}
                                >
                                    <input
                                        style={{
                                            borderWidth: 2,
                                            borderColor: formDataErrors.fullname
                                                ? 'red'
                                                : validationStyle.fullname &&
                                                  fullname
                                                ? 'green'
                                                : 'black',
                                            marginBottom: 10,
                                            marginTop: 12,
                                            paddingRight: 25,
                                        }}
                                        autoComplete="off"
                                        value={fullname}
                                        onChange={(e) =>
                                            setFullname(e.target.value)
                                        }
                                        id="fullname"
                                        type="text"
                                        required
                                        pattern="^[A-Z]{1}[a-z]{1,}(?: [A-Z]{1}[a-z]{1,}){1,3}$"
                                        maxLength={40}
                                        onInput={(e) => {
                                            setErrorOnSubmitFormOne('')
                                            setSubmitMessage('')
                                            if (
                                                e.target.validity.valueMissing
                                            ) {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    fullname:
                                                        e.target
                                                            .validationMessage,
                                                })
                                            } else if (
                                                e.target.validity
                                                    .patternMismatch
                                            ) {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    fullname:
                                                        'Please match the requested format: 2-4 words (separated with 1 space) each of them starting with capital letter and then at least one lowercase letter.',
                                                })
                                            } else {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    fullname: '',
                                                })
                                            }
                                        }}
                                        onBlur={() =>
                                            setValidationStyle({
                                                ...validationStyle,
                                                fullname: true,
                                            })
                                        }
                                    />
                                    {formDataErrors.fullname &&
                                    validationStyle.fullname ? (
                                        <InvalidMark />
                                    ) : validationStyle.fullname && fullname ? (
                                        <ValidMark />
                                    ) : null}
                                    {fullname.length === 40 && (
                                        <span
                                            style={{
                                                marginLeft: 10,
                                                fontSize: 14,
                                            }}
                                        >
                                            You have reached maximum number od
                                            characters (40).
                                        </span>
                                    )}
                                </div>

                                {validationStyle.fullname ? (
                                    <span className="validation-message">
                                        {formDataErrors.fullname}
                                    </span>
                                ) : (
                                    <span className="validation-message-empty"></span>
                                )}
                            </div>

                            <div
                                className="details-email"
                                style={{ display: 'block' }}
                            >
                                <label htmlFor="email">Email</label>
                                <div
                                    style={{
                                        display: 'block',
                                        position: 'relative',
                                    }}
                                >
                                    <input
                                        style={{
                                            borderWidth: 2,
                                            borderColor: formDataErrors.email
                                                ? 'red'
                                                : validationStyle.email && email
                                                ? 'green'
                                                : 'black',
                                            marginBottom: 10,
                                            marginTop: 12,
                                        }}
                                        autoComplete="off"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        id="email"
                                        type="email"
                                        required
                                        minLength={5}
                                        onInput={(e) => {
                                            setErrorOnSubmitFormOne('')
                                            setSubmitMessage('')
                                            if (
                                                e.target.validity
                                                    .typeMismatch ||
                                                e.target.validity
                                                    .valueMissing ||
                                                e.target.validity.tooShort
                                            ) {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    email: e.target
                                                        .validationMessage,
                                                })
                                            } else {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    email: '',
                                                })
                                            }
                                        }}
                                        onBlur={() =>
                                            setValidationStyle({
                                                ...validationStyle,
                                                email: true,
                                            })
                                        }
                                    />
                                    {formDataErrors.email &&
                                    validationStyle.email ? (
                                        <InvalidMark />
                                    ) : validationStyle.email && email ? (
                                        <ValidMark />
                                    ) : null}
                                </div>
                                {validationStyle.email ? (
                                    <span className="validation-message">
                                        {formDataErrors.email}
                                    </span>
                                ) : (
                                    <span className="validation-message-empty"></span>
                                )}
                            </div>
                        </div>
                        {errorOnSubmitFormOne &&
                            (formDataErrors.fullname ||
                                formDataErrors.email ||
                                formDataErrors.uploadedImg) && (
                                <h3
                                    style={{ top: '-62px' }}
                                    className="user-details-submit-error"
                                >
                                    {errorOnSubmitFormOne}
                                </h3>
                            )}
                    </div>

                    <button type="submit">Submit</button>
                </form>

                <div className="password-change-state">
                    <h3>Password</h3>
                    <button
                        onClick={() => setIsPasswordFormShown(true)}
                        className="pink-button"
                    >
                        Change Password
                    </button>
                </div>
                {isPasswordFormShown && (
                    <form
                        noValidate
                        onSubmit={handlePasswordChange}
                        style={{ position: 'relative' }}
                    >
                        <div
                            className="password-inputs"
                            style={{ height: 130 }}
                        >
                            <div
                                className="register-password"
                                style={{ display: 'block', maxWidth: 270 }}
                            >
                                <label htmlFor="password">Password</label>
                                <div className="password-user-input">
                                    <input
                                        style={{
                                            borderWidth: 2,
                                            borderColor: formDataErrors.password
                                                ? 'red'
                                                : validationStyle.password &&
                                                  password
                                                ? 'green'
                                                : 'black',
                                            flexDirection: 'row !important',
                                        }}
                                        autoComplete="off"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        id="password"
                                        type="password"
                                        required
                                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,12}$"
                                        onInput={(e) => {
                                            setErrorOnSubmitFormTwo('')
                                            setSubmitMessage('')
                                            if (
                                                e.target.validity
                                                    .patternMismatch
                                            ) {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    password:
                                                        'Please match the requested format: 8-12 characters, at least one uppercase letter, one lowercase letter and one number.',
                                                })
                                            } else if (
                                                e.target.validity.valueMissing
                                            ) {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    password:
                                                        e.target
                                                            .validationMessage,
                                                })
                                            } else if (
                                                confirmPassword &&
                                                e.target.value !==
                                                    confirmPassword
                                            ) {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    confirmPassword:
                                                        'Passwords do not match!',
                                                    password: '',
                                                })
                                                setValidationStyle({
                                                    ...validationStyle,
                                                    confirmPassword: true,
                                                })
                                            } else if (!confirmPassword) {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    confirmPassword:
                                                        'Please fill out this field.',
                                                    password: '',
                                                })
                                                setValidationStyle({
                                                    ...validationStyle,
                                                    confirmPassword: true,
                                                })
                                            } else {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    password: '',
                                                    confirmPassword: '',
                                                })
                                            }
                                        }}
                                        onBlur={() =>
                                            setValidationStyle({
                                                ...validationStyle,
                                                password: true,
                                            })
                                        }
                                    />
                                    {formDataErrors.password &&
                                    validationStyle.password ? (
                                        <InvalidMark />
                                    ) : validationStyle.password && password ? (
                                        <ValidMark />
                                    ) : (
                                        <span
                                            style={{
                                                width: 15,
                                                paddingLeft: 1,
                                            }}
                                        ></span>
                                    )}
                                </div>

                                {validationStyle.password ? (
                                    <span
                                        style={{ maxWidth: 250, height: 55 }}
                                        className="validation-message"
                                    >
                                        {formDataErrors.password}
                                    </span>
                                ) : (
                                    <span
                                        style={{ maxWidth: 250, height: 55 }}
                                        className="validation-message-empty"
                                    ></span>
                                )}
                            </div>
                            <div
                                className="register-password"
                                style={{ display: 'block', maxWidth: 270 }}
                            >
                                <label htmlFor="confirmPassword">
                                    Re-type password
                                </label>
                                <div className="password-user-input">
                                    <input
                                        style={{
                                            borderWidth: 2,
                                            borderColor:
                                                formDataErrors.confirmPassword &&
                                                validationStyle.confirmPassword
                                                    ? 'red'
                                                    : validationStyle.confirmPassword &&
                                                      confirmPassword
                                                    ? 'green'
                                                    : 'black',
                                        }}
                                        autoComplete="off"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        onInput={(e) => {
                                            setErrorOnSubmitFormTwo('')
                                            setSubmitMessage('')
                                            if (
                                                e.target.validity.valueMissing
                                            ) {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    confirmPassword:
                                                        e.target
                                                            .validationMessage,
                                                })
                                            } else if (
                                                password &&
                                                e.target.value !== password
                                            ) {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    confirmPassword:
                                                        'Passwords do not match!',
                                                })
                                            } else {
                                                setFormDataErrors({
                                                    ...formDataErrors,
                                                    confirmPassword: '',
                                                })
                                            }
                                        }}
                                        onBlur={() => {
                                            if (
                                                password &&
                                                !formDataErrors.password
                                            )
                                                setValidationStyle({
                                                    ...validationStyle,
                                                    confirmPassword: true,
                                                })
                                        }}
                                    />
                                    {formDataErrors.confirmPassword &&
                                    validationStyle.confirmPassword ? (
                                        <InvalidMark />
                                    ) : validationStyle.confirmPassword &&
                                      confirmPassword &&
                                      password ? (
                                        <ValidMark />
                                    ) : (
                                        <span
                                            style={{
                                                width: 15,
                                                paddingLeft: 1,
                                            }}
                                        ></span>
                                    )}
                                </div>

                                {validationStyle.confirmPassword ? (
                                    <span
                                        style={{ maxWidth: 250 }}
                                        className="validation-message"
                                    >
                                        {formDataErrors.confirmPassword}
                                    </span>
                                ) : (
                                    <span
                                        style={{ maxWidth: 250 }}
                                        className="validation-message-empty"
                                    ></span>
                                )}
                            </div>
                        </div>

                        <button type="submit">Submit</button>
                        {errorOnSubmitFormTwo &&
                            (formDataErrors.password ||
                                formDataErrors.confirmPassword) && (
                                <h3
                                    style={{ top: '110%' }}
                                    className="user-details-submit-error"
                                >
                                    {errorOnSubmitFormTwo}
                                </h3>
                            )}
                    </form>
                )}
            </div>
        </div>
    )
}
