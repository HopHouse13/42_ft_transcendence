import { NavLink } from 'react-router-dom'

function Nav() {
  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: '0.5rem 1rem',
    textDecoration: 'none',
    color: isActive ? '#ffd54f' : '#eee',
    fontWeight: isActive ? ('bold' as const) : ('normal' as const),
  })

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #333', marginBottom: '1.5rem' }}>
      <NavLink to="/" style={linkStyle} end>
        Créer un joueur
      </NavLink>
      <NavLink to="/room" style={linkStyle}>
        Room
      </NavLink>
    </nav>
  )
}

export default Nav
