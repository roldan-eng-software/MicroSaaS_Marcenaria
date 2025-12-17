import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import { LogOut, User } from 'lucide-react';

export default function AppLayout({ children }) {
    const { user, signOut } = useAuth();

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Topbar */}
                <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm z-10">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Painel de Controle
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User size={16} />
                            <span className="hidden sm:inline">{user?.email}</span>
                        </div>
                        <button
                            onClick={signOut}
                            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
                            title="Sair"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
