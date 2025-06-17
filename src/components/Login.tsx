'use client'

import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Login = () => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();


  async function handleLogin() {
    try {
        if(!email || !password) {
            alert('Anyone field is empty!');
            return;
        }
        const data = {
            email,
            password
        }
        setIsLoading(true);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/authentication/admin-login`, data);

        if(response.data.status == true) {
            localStorage.setItem('adminId', response.data.response.id);
            localStorage.setItem('adminName', response.data.response.name);
            router.push('/home')
        } else {
            alert(response.data.message)
        }
    } catch (error) {
        console.log(error)
        alert('Unable to login')
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl transform hover:scale-105 transition duration-300">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Welcome Back</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
            <div className="mt-1 relative">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value)
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</label>
            <div className="mt-1 relative">
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value)
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {isLoading === true ? 'Loading...' : 'Login'}
          </button>
        </div>
        {/* <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account? <span className="text-blue-500 cursor-pointer hover:underline">Sign Up</span>
        </p> */}
      </div>
    </div>
  );
};

export default Login;
