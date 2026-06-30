import { Link } from "react-router-dom";

export default function ServiceCard({ service }) {
    return (
        <Link
            to={`/services/${service.id}`}
            className="service-card"
        >
            <h3 className="service-role">{service.title}</h3>
        </Link>
    );
}