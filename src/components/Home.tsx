'use client'

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Roles } from '@/context/AuthContext';


function AdminDashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openExamMenu, setOpenExamMenu] = useState(false);
  const [openQuestionMenu, setOpenQuestionMenu] = useState(false);
  const [openGroupMenu, setOpenGroupMenu] = useState(false);
  const [openParticipantMenu, setOpenParticipantMenu] = useState(false)
  const navigation = useRouter()
  const { logout } = useAuth();
  const { user } = useAuth();


  return (
    <>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white">
          <nav className="mt-4">
            <ul>
              {
                user?.role == Roles.superAdmin ? (<li className="py-2 px-4 hover:bg-gray-700 cursor-pointer" onClick={() => {
                  navigation.push('/home/admin-profile')
                }}>Profile</li>) : (<></>)
              }
              <li
                className={`py-2 px-4 hover:bg-gray-700 cursor-pointer}`}
                onClick={() => navigation.push('/home')}
              >
                Dashboard
              </li>
              {
                user?.role == Roles.admin ? (
                  <li
                    className={`py-2 px-4 hover:bg-gray-700 cursor-pointer}`}
                    onClick={() => navigation.push('/home/admin/create-super-user')}
                  >
                    Create Super User
                  </li>
                ) : (<></>)
              }
              {
                user?.role == Roles.superAdmin ? (<li
                  className={`py-2 px-4 hover:bg-gray-700 cursor-pointer}`}
                  onClick={() => navigation.push('/home')}
                >
                  Manage
                </li>) :
                  (
                    <div>
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
                      {/* //  groups menu  */}

                      <li
                        className="py-2 px-4 flex items-center justify-between hover:bg-gray-700 cursor-pointer"
                        onClick={() => setOpenGroupMenu(prev => !prev)}
                      >
                        Groups
                        {openGroupMenu ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </li>
                      {openGroupMenu && (
                        <ul className="ml-4">
                          {/* create exam  */}
                          <li
                            className={`py-2 px-4 hover:bg-gray-700 cursor-pointer }`}
                            onClick={() => navigation.push('/home/groups/create-group')}
                          >
                            Create Group
                          </li>

                          {/* manage exam  */}
                          <li
                            className={`py-2 px-4 hover:bg-gray-700 cursor-pointer }`}
                            onClick={() => navigation.push('/home/groups/manage-groups')}
                          >
                            Manage Group
                          </li>
                        </ul>
                      )}


                      <li
                        className="py-2 px-4 flex items-center justify-between hover:bg-gray-700 cursor-pointer"
                        onClick={() => setOpenParticipantMenu(prev => !prev)}
                      >
                        Participant
                        {openParticipantMenu ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </li>
                      {openParticipantMenu && (
                        <ul className="ml-4">
                          {/* create exam  */}
                          <li
                            className={`py-2 px-4 hover:bg-gray-700 cursor-pointer }`}
                            onClick={() => navigation.push('/home/participant/create-participant')}
                          >
                            Create Participant
                          </li>

                          {/* manage exam  */}
                          <li
                            className={`py-2 px-4 hover:bg-gray-700 cursor-pointer }`}
                            onClick={() => navigation.push('/home/participant/manage-participant')}
                          >
                            Manage Participant
                          </li>

                          {
                            user?.role == "Admin" ? (<li
                              className={`py-2 px-4 hover:bg-gray-700 cursor-pointer }`}
                              onClick={() => navigation.push('/home/participant-activity')}
                            >
                              Participant Activity
                            </li>) : (<></>)
                          }
                        </ul>
                      )}
                    </div>


                  )
              }


              {/* Other menu  */}
              <li className="py-2 px-4 hover:bg-gray-700 cursor-pointer" onClick={logout}>Logout</li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div>{children}</div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
