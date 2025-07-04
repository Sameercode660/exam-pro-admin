'use client'

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function AdminDashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openExamMenu, setOpenExamMenu] = useState(false);
  const [openQuestionMenu, setOpenQuestionMenu] = useState(false);
  const navigation = useRouter()
  const {logout} = useAuth();


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white h- ">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          Plugin Development
        </div>
        <nav className="mt-4">
          <ul>
            <li
              className={`py-2 px-4 hover:bg-gray-700 cursor-pointer}`}
              onClick={() => navigation.push('/home')}
            >
              Dashboard
            </li>

            {/* exam menu  */}

            <li
              className="py-2 px-4 flex items-center justify-between hover:bg-gray-700 cursor-pointer"
              onClick={() => setOpenExamMenu(prev => !prev)}
            >
              Exams
              {openExamMenu ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </li>
            {openExamMenu && (
              <ul className="ml-4">
                {/* create exam  */}
                <li
                  className={`py-2 px-4 hover:bg-gray-700 cursor-pointer}`}
                  onClick={() => navigation.push('/home/exams/create-exams')}
                >
                  Create Exam
                </li>

                {/* manage exam  */}
                <li
                  className={`py-2 px-4 hover:bg-gray-700 cursor-pointer}`}
                  onClick={() => navigation.push('/home/exams/manage-exams')}
                >
                  Manage Exam
                </li>
              </ul>
            )}

            {/* Question menu  */}

            <li
              className="py-2 px-4 flex items-center justify-between hover:bg-gray-700 cursor-pointer"
              onClick={() => setOpenQuestionMenu(prev => !prev)}
            >
              Questions
              {openQuestionMenu ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </li>
            {openQuestionMenu && (
              <ul className="ml-4">
                {/* create exam  */}
                <li
                  className={`py-2 px-4 hover:bg-gray-700 cursor-pointer }`}
                  onClick={() => navigation.push('/home/questions/create-questions')}
                >
                  Create Questions
                </li>

                {/* manage exam  */}
                <li
                  className={`py-2 px-4 hover:bg-gray-700 cursor-pointer }`}
                  onClick={() => navigation.push('/home/questions/manage-questions')}
                >
                  Manage Questions
                </li>
              </ul>
            )}

            {/* Other menu  */}
            <li
              className="py-2 px-4 flex items-center justify-between hover:bg-gray-700 cursor-pointer"
              onClick={() => setMenuOpen(prev => !prev)}
            >
              More
              {menuOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </li>
            {menuOpen && (
              <ul className="ml-4">
                <li className="py-2 px-4 hover:bg-gray-700 cursor-pointer" onClick={() => {
                  navigation.push('/home/admin-profile')
                }}>Profile</li>
                <li className="py-2 px-4 hover:bg-gray-700 cursor-pointer" onClick={logout}>Logout</li>
              </ul>
            )}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div>{children}</div>
      </div>
    </div>
  );
}

export default AdminDashboard;
