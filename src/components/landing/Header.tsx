'use client'
export function Header() {
  return (
    <header style={{
      display: 'flex',
      // backgroundImage: `url('/lumivita_designs/background.png')`,
      // backgroundRepeat: 'cover',
      padding: '25px 0',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <img src="/lumivita_designs/logoAndName.png" alt="mascot" />
      <nav style={{
        display: 'flex', gap: '20px',
        flexGrow: 1, justifyContent: 'center',
        fontSize: '18px', fontWeight: 600,
        color: '#001F54'
      }}>
        <a href="#aboutSection" style={linkStyle}>About</a>
        <a href="#servicesSection" style={linkStyle}>Services</a>
        <a href="#creatorsSection" style={linkStyle}>Who We Are</a>
      </nav>
    </header>
  )
}
const linkStyle = {
  textDecoration: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
}
