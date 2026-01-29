
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { db } from '../store';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on Dashboard root
  if (location.pathname === '/') return null;

  const breadcrumbs = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;

    // Default label is capitalized segment
    let label = value.charAt(0).toUpperCase() + value.slice(1);

    // Human-friendly mapping for main sections
    if (value === 'events') label = 'Eventos';
    if (value === 'companies') label = 'Empresas';
    if (value === 'settings') label = 'Configurações';

    // Context-aware lookup for IDs
    if (index > 0) {
      const parent = pathnames[index - 1];
      if (parent === 'events') {
        const event = db.getEvents().find(e => e.id === value);
        if (event) label = event.name;
      } else if (parent === 'companies') {
        const company = db.getCompanies().find(c => c.id === value);
        if (company) label = company.name;
      }
    }

    return { label, to, last };
  });

  return (
    <nav className="flex items-center space-x-2 text-xs font-medium text-slate-400 mb-6 overflow-x-auto no-scrollbar whitespace-nowrap py-1 select-none" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1 shrink-0">
        <Home className="w-3 h-3" /> Dashboard
      </Link>
      {breadcrumbs.map((crumb) => (
        <React.Fragment key={crumb.to}>
          <ChevronRight className="w-3 h-3 flex-shrink-0 text-slate-300" />
          {crumb.last ? (
            <span className="text-slate-600 font-bold truncate max-w-[240px] px-1" aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link to={crumb.to} className="hover:text-blue-600 transition-colors px-1">
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
