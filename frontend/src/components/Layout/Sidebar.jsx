import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Users,
    Package,
    Settings,
    FileText,
    TrendingUp,
    Calendar,
    Box,
    X,
    FolderKanban,
    BookOpen,
    ClipboardList,
    PieChart
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Clientes', href: '/customers', icon: Users },
    { name: 'Projetos', href: '/projects', icon: FolderKanban },
    { name: 'Catálogo', href: '/catalog', icon: BookOpen },
    { name: 'Visitas', href: '/visits', icon: Calendar },
    { name: 'Materiais', href: '/finance/materials', icon: Box },
    { name: 'Orçamentos', href: '/finance/quotes', icon: FileText },
    { name: 'Ordens de Serviço', href: '/finance/os', icon: ClipboardList },
    { name: 'Financeiro', href: '/finance', icon: TrendingUp },
    { name: 'Relatórios', href: '/finance/reports', icon: PieChart },
];

export default function Sidebar({ mobile, onClose }) {
    const location = useLocation();

    const Content = (
        <>
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                    Marcenaria SaaS
                </h1>
                {mobile && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                )}
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={mobile ? onClose : undefined}
                            className={clsx(
                                isActive
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-white',
                                    'mr-3 h-5 w-5 flex-shrink-0'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </>
    );

    if (mobile) {
        return (
            <div className="fixed inset-0 z-50 flex lg:hidden">
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-900 duration-300 ease-in-out">
                    {Content}
                </div>
            </div>
        );
    }

    return (
        <div className="hidden lg:flex h-full flex-col bg-gray-900 text-white w-64 shadow-xl flex-shrink-0">
            {Content}
        </div>
    );
}
