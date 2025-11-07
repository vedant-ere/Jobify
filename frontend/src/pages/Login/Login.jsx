import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx'; // Adjust path as needed

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login({ email, password });
    if (!result.success) {
      // Optionally handle error messages here or show them below
      console.error('Login error:', result.error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12">
        <h1 className="text-3xl font-bold mb-4">Welcome back!</h1>
        <p className="text-gray-600 mb-8">Enter your Credentials to access your account</p>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email address</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <div className="text-right mt-1">
              <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full bg-green-600 text-white rounded-md p-2 hover:bg-green-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      {/* Right side image */}
      <div className="hidden md:flex flex-1 bg-gray-50 items-center justify-center p-8">
        <img
          src="/images/leaf-image.jpg"
          alt="Decorative leaf"
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

export default Login;
