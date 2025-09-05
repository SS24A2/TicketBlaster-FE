import SecondaryNav from '../components/SecondaryNav'

export default function UserDetails() {
    return (
        <div className="profile-page">
            <div className="title-nav">
                <h2>User Details</h2>
                <SecondaryNav pageSelected={'details'} />
            </div>
            <div>UserDetails</div>
        </div>
    )
}
