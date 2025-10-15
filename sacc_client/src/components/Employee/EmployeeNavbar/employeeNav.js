import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import apiList from "../../../lib/apiList";
import banklogo from "../../../images/banklogo.jpg";
import "./employeeNav.css";

const EmployeeNavbar = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [showLoanSubMenu, setShowLoanSubMenu] = useState(false);
    const [showMoreSubMenu, setShowMoreSubMenu] = useState(false);
    const navigate = useNavigate();

    const loanRef = useRef(null);
    const moreRef = useRef(null);

    const handleLogout = (e) => {
        e.preventDefault();
        const isProduction = process.env.NODE_ENV === 'production';
        const domain = isProduction ? '.sacb.co.in' : 'localhost';
        
        // Remove all tokens
        Cookies.remove("employee_token", { domain });
        Cookies.remove("token_type", { domain });
        
        // Also remove any potential conflicting tokens
        Cookies.remove("admin_token", { domain });
        Cookies.remove("scholar_token", { domain });
        
        navigate("/employee/login", { replace: true });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                loanRef.current && !loanRef.current.contains(event.target) &&
                moreRef.current && !moreRef.current.contains(event.target)
            ) {
                setShowLoanSubMenu(false);
                setShowMoreSubMenu(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const token = Cookies.get("employee_token");
        if (!token) {
            navigate("/employee/login");
            return;
        }

        try {
            const response = await axios.post(
                apiList.userSearch,
                { searchElement: query },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.status === "success") {
                setSearchResults(response.data.data);
                setShowResults(true);
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        } catch (error) {
            console.error("Error during search:", error);
        }
    };

    const handleResultClick = (userId) => {
        setShowResults(false);
        navigate(`/employee/details/${userId}`);
    };

    const closeMobileMenu = () => {
        setIsMobileOpen(false);
    };

    const toggleLoanSubMenu = (event) => {
        event.stopPropagation();
        setShowLoanSubMenu(!showLoanSubMenu);
        setShowMoreSubMenu(false);
    };

    const toggleMoreSubMenu = (event) => {
        event.stopPropagation();
        setShowMoreSubMenu(!showMoreSubMenu);
        setShowLoanSubMenu(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    return (
        <nav className="employeeNav">
            <div className="employeeNav_container">
                {/* Logo */}
                <div className="employeeNav_logoContainer">
                    <img className="employeeNav_logoImage" src={banklogo} alt="Bank Logo" />
                    <h3 className="employeeNav_logoText">SACCFBL</h3>
                </div>

                {/* Search Bar */}
                <div className="employeeNav_searchContainer">
                    <input
                        type="text"
                        placeholder="Search user details"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="employeeNav_searchInput"
                    />
                </div>

                {/* Navbar Links */}
                <ul className={isMobileOpen ? "employeeNav_linksMobile" : "employeeNav_links"}>
                    <li><Link to="/employee/dashboard" className="employeeNav_link" onClick={closeMobileMenu}>Home</Link></li>
                    <li><Link to="/employee/membershipopening" className="employeeNav_link" onClick={closeMobileMenu}>Membership</Link></li>
                    <li ref={loanRef}>
                        <div className="employeeNav_link" onClick={toggleLoanSubMenu}>Loan</div>
                        <ul className={`employeeNav_subMenu ${showLoanSubMenu ? "show" : ""}`}>
                            <li><Link to="/employee/loanapplication" className="employeeNav_subLink" onClick={closeMobileMenu}>Loan</Link></li>
                            <li><Link to="/employee/allapprovedloan" className="employeeNav_subLink" onClick={closeMobileMenu}>All Loans</Link></li>
                            <li><Link to="/employee/pendingloan" className="employeeNav_subLink" onClick={closeMobileMenu}>Pending Loans</Link></li>
                            <li><Link to="/employee/runningloan" className="employeeNav_subLink" onClick={closeMobileMenu}>Running Loans</Link></li>
                            <li><Link to="/employee/paidloan" className="employeeNav_subLink" onClick={closeMobileMenu}>Paid Loans</Link></li>
                            <li><Link to="/employee/rejectedloan" className="employeeNav_subLink" onClick={closeMobileMenu}>Rejected Loans</Link></li>
                        </ul>
                    </li>

                    <li><Link to="/employee/accountopening" className="employeeNav_link" onClick={closeMobileMenu}>Account Opening</Link></li>
                    
                    <li ref={moreRef}>
                        <div className="employeeNav_link" onClick={toggleMoreSubMenu}>Account Actions</div>
                        <ul className={`employeeNav_subMenu ${showMoreSubMenu ? "show" : ""}`}>
                            <li><Link to="/deposit" className="employeeNav_subLink" onClick={closeMobileMenu}>Deposit</Link></li>
                            <li><Link to="/transfer" className="employeeNav_subLink" onClick={closeMobileMenu}>Transfer</Link></li>
                            <li><Link to="/withdraw" className="employeeNav_subLink" onClick={closeMobileMenu}>Withdraw</Link></li>
                            <li><Link to="/transactions" className="employeeNav_subLink" onClick={closeMobileMenu}>Transactions</Link></li>
                        </ul>
                    </li>
                    <li><button className="employeeNav_link" onClick={handleLogout} style={{ border: 'none', background: 'none' }}>Logout</button></li>
                </ul>

                {/* Mobile Menu Icon */}
                <div className="employeeNav_mobileMenuIcon" onClick={toggleMobileMenu}>
                    ☰
                </div>
            </div>

            {/* Full-Page Search Results */}
            {showResults && (
                <div className="employeeNav_searchResults">
                    <button className="employeeNav_closeSearch" onClick={() => setShowResults(false)}>✖</button>
                    {searchResults.length > 0 ? (
                        searchResults.map((result) => (
                            <div key={result._id} className="employeeNav_searchResultItem" onClick={() => handleResultClick(result._id)}>
                                <p><strong>Name:</strong> {result.name}</p>
                                <p><strong>Email:</strong> {result.email_id}</p>
                                <p><strong>Phone:</strong> {result.phone_number}</p>
                                <p><strong>Membership ID:</strong> {result.membership_id}</p>
                            </div>
                        ))
                    ) : (
                        <p className="employeeNav_noResults">No results found</p>
                    )}
                </div>
            )}
        </nav>
    );
};

export default EmployeeNavbar;
