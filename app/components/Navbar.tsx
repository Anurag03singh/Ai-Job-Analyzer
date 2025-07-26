import {Link} from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">AI ANALYZER</p>
            </Link>
            <div className="flex gap-4">
                <Link to="/jobs" className="flex items-center px-4 py-2 text-dark-200 hover:text-black transition-colors">
                    Jobs
                </Link>
                <Link to="/upload" className="primary-button w-fit">
                    Upload Resume
                </Link>
            </div>
        </nav>
    )
}
export default Navbar
