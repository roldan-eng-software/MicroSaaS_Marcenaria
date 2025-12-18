import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AppLayout from './components/Layout/AppLayout';
import CustomerList from './pages/Customers/CustomerList';
import CustomerForm from './pages/Customers/CustomerForm';
import ProjectList from './pages/Projects/ProjectList';
import ProjectForm from './pages/Projects/ProjectForm';
import TransactionList from './pages/Finance/TransactionList';
import TransactionForm from './pages/Finance/TransactionForm';
import Profile from './pages/Profile/Profile';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function Dashboard() {
    const { signOut, user } = useAuth();
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p className="mb-4">Bem-vindo, {user.email}</p>
            <button
                onClick={signOut}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Sair
            </button>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/*" element={
                        <PrivateRoute>
                            <AppLayout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/customers" element={<CustomerList />} />
                                    <Route path="/customers/new" element={<CustomerForm />} />
                                    <Route path="/projects" element={<ProjectList />} />
                                    <Route path="/projects/new" element={<ProjectForm />} />
                                    <Route path="/finance" element={<TransactionList />} />
                                    <Route path="/finance/new" element={<TransactionForm />} />
                                    <Route path="/profile" element={<Profile />} />
                                </Routes>
                            </AppLayout>
                        </PrivateRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
