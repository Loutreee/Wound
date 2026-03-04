import { Link } from 'react-router-dom';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <header className="layout-header">
        <Link to="/" className="layout-brand">
          <span className="layout-brand-icon">W</span>
          <span>Wound</span>
        </Link>
        <nav className="layout-nav">
          <Link to="/">Accueil</Link>
          <Link to="/combat">Combat</Link>
        </nav>
      </header>
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}
