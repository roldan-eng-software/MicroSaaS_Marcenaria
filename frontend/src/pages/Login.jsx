import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import clsx from 'clsx';

// Zod schemas for validation
const loginSchema = z.object({
    email: z.string().email('Endereço de email inválido'),
    password: z.string().min(1, 'A senha é obrigatória'),
});

const registerSchema = z.object({
    email: z.string().email('Endereço de email inválido'),
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
});


export default function Login() {
    const { signIn, signUp, loading, error: authError } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);

    const currentSchema = isLogin ? loginSchema : registerSchema;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: zodResolver(currentSchema),
    });
    
    // Reset form when switching between login/register
    useEffect(() => {
        reset();
    }, [isLogin, reset]);

    const onSubmit = async (data) => {
        const { email, password } = data;
        const { error } = isLogin
            ? await signIn({ email, password })
            : await signUp({ email, password });

        if (!error) {
            if (!isLogin) {
                alert('Verifique seu email para confirmar o cadastro!');
                setIsLogin(true); // Switch back to login view
            } else {
                navigate('/');
            }
        }
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        MicroSaaS Marcenaria
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                {...register('email')}
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className={clsx(
                                    "appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm",
                                    errors.email ? "border-red-500" : "border-gray-300",
                                    "rounded-t-md"
                                )}
                                placeholder="Email"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                        </div>
                        <div>
                            <input
                                {...register('password')}
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={clsx(
                                    "appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm",
                                    errors.password ? "border-red-500" : "border-gray-300",
                                    "rounded-b-md"
                                )}
                                placeholder="Senha"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                        </div>
                    </div>

                    {authError && (
                        <div className="text-red-500 text-sm text-center">{authError.message}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg shadow-lg text-white bg-primary-500 hover:bg-primary-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                            onClick={toggleForm}
                        >
                            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
