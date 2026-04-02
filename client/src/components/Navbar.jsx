import { NavLink } from 'react-router-dom'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

  .navbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: saturate(180%) blur(12px);
    -webkit-backdrop-filter: saturate(180%) blur(12px);
    border-bottom: 1px solid #ebebE7;
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  .navbar-inner {
    max-width: 780px;
    margin: 0 auto;
    padding: 0 24px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .navbar-logo {
    display: flex;
    align-items: center;
    gap: 9px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .navbar-logo-mark {
    width: 30px;
    height: 30px;
    background: #4f46e5;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(79,70,229,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .navbar-logo:hover .navbar-logo-mark {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(79,70,229,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .navbar-logo-mark svg {
    width: 14px;
    height: 14px;
    color: #ffffff;
  }
  .navbar-logo-name {
    font-size: 15px;
    font-weight: 600;
    color: #0f0f0d;
    letter-spacing: -0.025em;
    line-height: 1;
  }
  .navbar-logo-name span {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    color: #6366f1;
    letter-spacing: -0.01em;
  }

  .navbar-links {
    display: flex;
    align-items: center;
    gap: 2px;
    background: #f5f5f1;
    border-radius: 12px;
    padding: 3px;
  }

  .navbar-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    color: #7c7c78;
    transition: color 0.15s, background 0.15s, box-shadow 0.15s;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }
  .navbar-link:hover {
    color: #3d3d38;
  }
  .navbar-link.active {
    background: #ffffff;
    color: #0f0f0d;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06);
  }
  .navbar-link-icon {
    width: 14px;
    height: 14px;
    opacity: 0.7;
    flex-shrink: 0;
    transition: opacity 0.15s;
  }
  .navbar-link.active .navbar-link-icon,
  .navbar-link:hover .navbar-link-icon {
    opacity: 1;
  }
`

export function Navbar() {
  return (
    <>
      <style>{styles}</style>
      <nav className="navbar">
        <div className="navbar-inner">

          <NavLink to="/" className="navbar-logo">
            <div className="navbar-logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
                <path d="M8 11h6M11 8v6" strokeWidth="2" />
              </svg>
            </div>
            <span className="navbar-logo-name">
              Semantic<span>Search</span>
            </span>
          </NavLink>

          <div className="navbar-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              <svg className="navbar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Search
            </NavLink>

            <NavLink
              to="/documents"
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              <svg className="navbar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="13" y2="17" />
              </svg>
              Documents
            </NavLink>
          </div>

        </div>
      </nav>
    </>
  )
}