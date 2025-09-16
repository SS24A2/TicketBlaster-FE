import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import SecondaryNav from '../components/SecondaryNav'
import Api from '../Api'

import generalAvatar from '../assets/general-avatar.png'
import ModalUsersEvents from '../components/ModalUsersEvents'

import AuthContext from '../context/AuthContext'

export default function UsersAdmin() {
    const [usersList, setUsersList] = useState([])
    const [images, setImages] = useState(null)

    //IU and auth for changed user ??

    const [modal, setModal] = useState(null)

    const { currentUser, handleLogout } = useContext(AuthContext)
    const navigate = useNavigate()

    async function getUsers() {
        try {
            const res = await Api().get('/api/v1/users/list')
            console.log(res)
            setUsersList(res.data.users)
            setImages(res.data.images)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        getUsers()
    }, [])

    async function changeUserRole(id, currentRole) {
        try {
            const res = await Api().put(`/api/v1/users/role/${id}`, {
                role: currentRole === 'admin' ? 'user' : 'admin',
            })
            console.log(res)
            if (id === currentUser.id) {
                //ako admin ja smeni svojata uloga vo user, treba da bide odlogiran i pak da se logira kako obicen user
                handleLogout()
                navigate('/account/login')
            } else {
                getUsers()
            }
        } catch (err) {
            console.log(err)
        }
    }

    async function deleteUser(id) {
        try {
            const res = await Api().put(`/api/v1/users/status/${id}`)
            console.log(res)
            if (id === currentUser.id) {
                //ako admin go izbrishe svojot profil, treba da bide odlogiran i vraten na homepage kako user bez account
                handleLogout()
                navigate('/')
            } else {
                getUsers()
            }
        } catch (err) {
            console.log(err)
        }
    }

    function cancelModal() {
        setModal(null)
    }

    function confirmModal(modal) {
        modal.type === 'deleteUser'
            ? deleteUser(modal.id)
            : changeUserRole(modal.id, modal.role)

        setModal(null)
    }

    return (
        <div className="profile-page">
            <div className="title-nav">
                <h2>Users</h2>
                <SecondaryNav pageSelected={'users'} />
            </div>
            <div>
                {usersList.length === 0 && <div>Loading ... TBC</div>}
                {usersList.length > 0 &&
                    usersList.map((user) => (
                        <div
                            key={user._id}
                            style={{
                                opacity: user.status === 'active' ? '1' : '0.5',
                            }}
                            className="list-user"
                        >
                            <div>
                                <img
                                    src={
                                        images[user._id]
                                            ? `${
                                                  import.meta.env
                                                      .VITE_REACT_APP_BACKEND_API
                                              }/${images[user._id]}`
                                            : generalAvatar
                                    }
                                    alt="avatar"
                                    className="users-avatar"
                                />
                                <span className="user-info">
                                    <p>{user.fullname}</p>
                                    <p>{user.email}</p>
                                </span>
                            </div>

                            {user.status === 'active' && (
                                <div>
                                    <button
                                        onClick={() =>
                                            setModal({
                                                type:
                                                    user.role === 'user'
                                                        ? 'makeAdmin'
                                                        : 'makeUser',
                                                id: user._id,
                                                role: user.role,
                                            })
                                        }
                                        style={{
                                            color:
                                                user.role === 'user'
                                                    ? '#FF48AB'
                                                    : '#000000',
                                            borderColor:
                                                user.role === 'user'
                                                    ? '#000000'
                                                    : ' #EE47A0',
                                        }}
                                    >
                                        Make{' '}
                                        {user.role === 'admin'
                                            ? 'User'
                                            : 'Admin'}
                                    </button>
                                    <button
                                        onClick={() =>
                                            setModal({
                                                type: 'deleteUser',
                                                id: user._id,
                                            })
                                        }
                                    >
                                        Delete User
                                    </button>
                                </div>
                            )}
                            {modal && (
                                <ModalUsersEvents
                                    modal={modal}
                                    cancelModal={cancelModal}
                                    confirmModal={confirmModal}
                                />
                            )}
                        </div>
                    ))}
            </div>
        </div>
    )
}
