import { JSX } from 'react';
import Link from 'next/link';

interface NavigationProps {
  className?: string;
}

// Prefix public assets with a public URL to enable compatibility with Sitecore editors.
// If you're not supporting Sitecore editors, you can remove this.
// const publicUrl = config.publicUrl;

const Navigation = ({ className = '' }: NavigationProps): JSX.Element => {
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className={`navigation ${className}`}>
        <div className="nav-container">
          <div className="nav-brand">
            <Link href="/">
              <span className="brand-text">YML Demo</span>
            </Link>
          </div>

          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.href} className="nav-item">
                <Link href={item.href} className="nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
