import { Link } from "react-router-dom";

export default function PersonCard({ person }) {
    return (
        <Link
            to={`/people/${person.id}`}
            className="person-card"
        >
            <img
                src={person.photo}
                alt={person.name}
                className="person-photo"
            />

            <h3>{person.name}</h3>

            <p className="profile-role" style={{ color: '#2E4E6A' }}>
                {person.title}
            </p>
        </Link>
    );
}