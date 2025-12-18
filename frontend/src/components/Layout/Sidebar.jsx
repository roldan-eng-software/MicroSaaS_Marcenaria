import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, BookOpen, Wallet, Settings, Calendar, Box, FileText } from 'lucide-react';
import clsx from 'clsx';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Catálogo', href: '/catalog', icon: BookOpen },
    { name: 'Clientes', href: '/customers', icon: Users },
    { name: 'Visitas', href: '/visits', icon: Calendar },
    { name: 'Materiais', href: '/finance/materials', icon: Box },
    { name: 'Orçamentos', href: '/finance/quotes', icon: FileText },
    { name: 'Projetos', href: '/projects', icon: FolderKanban },
    { name: 'Financeiro', href: '/finance', icon: Wallet },
    { name: 'Perfil', href: '/profile', icon: Settings },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex h-full flex-col bg-gray-900 text-white w-64 shadow-xl">
            <div className="flex h-16 items-center justify-center border-b border-gray-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                    Marcenaria SaaS
                </h1>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={clsx(
                                isActive
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white',
                                    'mr-3 h-5 w-5 flex-shrink-0'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
