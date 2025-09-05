import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import SecondaryNav from '../components/SecondaryNav'
import generalAvatar from '../assets/general-avatar.png'
import Api from '../Api'
import AuthContext from '../context/AuthContext'

let formData = new FormData()

export default function UserDetails() {
    const navigate = useNavigate()
    const { currentUser, handleLogout } = useContext(AuthContext)

    const [user, setUser] = useState(null)
    const [image, setImage] = useState(null)

    const [uploadedImg, setUploadedImg] = useState(null)
    const [fullname, setFullname] = useState(currentUser.fullname)
    const [email, setEmail] = useState(currentUser.email)

    const [isPasswordFormShown, setIsPasswordFormShown] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    async function getUser() {
        try {
            const res = await Api().get(`/api/v1/users/user`)
            console.log(res)
            setUser(res.data.user)
            setImage(res.data.image)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getUser()
    }, [])

    async function handleDetailsChange(e) {
        e.preventDefault()
        try {
            if (uploadedImg) {
                const res2 = await Api().post(
                    `/api/v1/upload/user/${user._id}`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                console.log('res2', res2)
            }

            if (fullname !== user.fullname || email !== user.email) {
                const res = await Api().put(`/api/v1/users/details`, {
                    fullname,
                    email,
                })
                console.log('res1', res)
                handleLogout()
                navigate('/account/login')
            }
        } catch (err) {
            console.log(err)
        }
    }

    async function handlePasswordChange(e) {
        e.preventDefault()
        try {
            const res = await Api().put(`/api/v1/users/password`, {
                password,
                confirmPassword,
            })
            console.log(res)
            handleLogout()
            navigate('/account/login')
        } catch (err) {
            console.log(err)
        }
    }

    function changeAvatar(e) {
        const [imageSelected] = e.target.files
        if (imageSelected) formData.append('image', imageSelected)
        let src = URL.createObjectURL(imageSelected)
        setUploadedImg(src)
    }

    if (!user) {
        return <div>Loading ... TBC</div>
    }

    return (
        <div className="profile-page">
            <div className="title-nav">
                <h2>User Details</h2>
                <SecondaryNav pageSelected={'details'} />
            </div>
            <div>
                <form onSubmit={handleDetailsChange}>
                    <div>
                        <div>
                            <img
                                style={{ width: 50 }}
                                src={
                                    uploadedImg
                                        ? uploadedImg
                                        : image
                                        ? `${
                                              import.meta.env
                                                  .VITE_REACT_APP_BACKEND_API
                                          }/${image}`
                                        : generalAvatar
                                }
                                alt="user-avatar"
                            />

                            <label htmlFor="avatar">Upload Avatar</label>
                            <input
                                type="file"
                                id="avatar"
                                onChange={changeAvatar}
                                className="file-input-user"
                            />
                        </div>
                        <div>
                            <div>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={fullname}
                                    onChange={(e) =>
                                        setFullname(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit">Submit</button>
                </form>

                <div>
                    <h3>Password</h3>
                    <button
                        onClick={() => setIsPasswordFormShown(true)}
                        className="pink-button"
                    >
                        Change Password
                    </button>
                </div>
                {isPasswordFormShown && (
                    <form onSubmit={handlePasswordChange}>
                        <div>
                            <div>
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <label>Re-type Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit">Submit</button>
                    </form>
                )}
            </div>
        </div>
    )
}
