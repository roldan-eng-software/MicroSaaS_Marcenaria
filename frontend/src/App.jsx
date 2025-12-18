import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AppLayout from './components/Layout/AppLayout';
import CustomerList from './pages/Customers/CustomerList';
import CustomerForm from './pages/Customers/CustomerForm';
import CustomerDetails from './pages/Customers/CustomerDetails';
import ProjectList from './pages/Projects/ProjectList';
import ProjectForm from './pages/Projects/ProjectForm';
import TransactionList from './pages/Finance/TransactionList';
import TransactionForm from './pages/Finance/TransactionForm';
import FixedCostsForm from './pages/Finance/FixedCostsForm';
import StandardProjectList from './pages/Catalog/StandardProjectList';
import StandardProjectForm from './pages/Catalog/StandardProjectForm';
import VisitList from './pages/Visits/VisitList';
import VisitForm from './pages/Visits/VisitForm';
import MaterialList from './pages/Finance/MaterialList';
import QuoteList from './pages/Finance/QuoteList';
import QuoteForm from './pages/Finance/QuoteForm';
import QuotePrint from './pages/Finance/QuotePrint';
import OSList from './pages/Finance/OSList';
import OSDetails from './pages/Finance/OSDetails';
import ContractPrint from './pages/Finance/ContractPrint';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile/Profile';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

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
                                    <Route path="/catalog" element={<StandardProjectList />} />
                                    <Route path="/catalog/new" element={<StandardProjectForm />} />
                                    <Route path="/catalog/edit/:id" element={<StandardProjectForm />} />
                                    <Route path="/visits" element={<VisitList />} />
                                    <Route path="/visits/new" element={<VisitForm />} />
                                    <Route path="/visits/new/:customerId" element={<VisitForm />} />
                                    <Route path="/visits/edit/:id" element={<VisitForm />} />
                                    <Route path="/finance/costs" element={<FixedCostsForm />} />
                                    <Route path="/finance/materials" element={<MaterialList />} />
                                    <Route path="/finance/quotes" element={<QuoteList />} />
                                    <Route path="/finance/quotes/new" element={<QuoteForm />} />
                                    <Route path="/finance/quotes/edit/:id" element={<QuoteForm />} />
                                    <Route path="/finance/quotes/print/:id" element={<QuotePrint />} />
                                    <Route path="/finance/quotes/contract/:id" element={<ContractPrint />} />
                                    <Route path="/finance/os" element={<OSList />} />
                                    <Route path="/finance/os/:id" element={<OSDetails />} />
                                    <Route path="/finance/reports" element={<Reports />} />
                                    <Route path="/customers" element={<CustomerList />} />
                                    <Route path="/customers/new" element={<CustomerForm />} />
                                    <Route path="/customers/edit/:id" element={<CustomerForm />} />
                                    <Route path="/customers/:id" element={<CustomerDetails />} />
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
