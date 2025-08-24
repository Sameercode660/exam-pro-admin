'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import axios from 'axios';
import { FiX, FiRefreshCw, FiSearch, FiPlusCircle, FiRotateCw } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RemovedExamsModal from './RemovedExamsModal';
import { useSocket } from '@/context/SocketContext';

interface Exam {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    createdBy: string;
    status: 'added' | 'removed' | 'not_added'; // NEW
}

interface ExamListModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizationId: number;
    adminId: number;
    groupId: number;
}

const ExamListModal: React.FC<ExamListModalProps> = ({
    isOpen,
    onClose,
    organizationId,
    adminId,
    groupId,
}) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'my'>('all');
    const [search, setSearch] = useState('');
    const [totalAdded, setTotalAdded] = useState(0);
    const [addedExams, setAddedExams] = useState<any[]>([]);
    const [isRemovedModalOpen, setIsRemovedModalOpen] = useState(false);
    const [addedExamIds, setAddedExamIds] = useState<Set<number>>(new Set());
    const [removedExamIds, setRemovedExamIds] = useState<Set<number>>(new Set());
    const socket = useSocket();

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-all-exams`, {
                organizationId,
                adminId,
                groupId, // NEW - Pass groupId here
                filter,
                search,
            });
            console.log(res)
            setExams(res.data.exams);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to fetch exams');
        } finally {
            setLoading(false);
        }
    };
    const fetchTotalAdded = async () => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/total-added-exams`, {
                groupId,
            });
            setTotalAdded(res.data.total);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to fetch total added exams');
        }
    };

    //fetch added exam function 
    const fetchAddedExams = async () => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/added-exams`, {
                groupId,
            });
            setAddedExams(res.data.addedExams);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to fetch added exams');
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchExams();
            fetchTotalAdded();
            fetchAddedExams();
        }
    }, [isOpen, filter]);
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSearchSubmit = () => {
        fetchExams();
    };

    const handleAddExam = async (examId: number) => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/add-exam-in-group`, {
                groupId,
                examId,
                adminId,
            });

            console.log(res.data)

            const { message, success, alreadyAssigned, recoverRequired } = res.data;

            if (success) {
                socket?.emit('exam-added-admin', 'added')
                toast.success(message);
                fetchTotalAdded();
                fetchAddedExams();
                fetchExams(); // <-- Add this to refresh the list
            } else if (alreadyAssigned) {
                toast.info(message);
            } else if (recoverRequired) {
                toast.warn(message);
            }
        } catch (err: any) {
            // console.error(err); log error disabled 
            toast.error(err.response?.data?.error || 'Failed to add exam to group');
        }
    };


    // remove exams function 
    const handleRemoveExam = async (groupExamId: number) => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/remove-exam`, {
                groupExamId,
            });

            if (res.data.success) {
                socket?.emit('remove-exam-admin', 'remove');
                toast.success(res.data.message);
                fetchTotalAdded();
                fetchAddedExams();
                fetchExams()
            } else {
                toast.error(res.data.error || 'Failed to remove exam');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to remove exam from group');
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            Exams List
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-red-500">
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Total Added Display */}
                    <div className="mb-4 text-sm text-gray-600">
                        <strong>Exams Added in Group: </strong>
                        <div className="mt-2 bg-gray-50 rounded-lg border p-3 max-h-40 overflow-y-auto">
                            {addedExams.length === 0 ? (
                                <p className="text-gray-400">No exams added to this group yet.</p>
                            ) : (
                                addedExams.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded">
                                        <span>{item.exam.title}</span>
                                        <button
                                            onClick={() => handleRemoveExam(item.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="flex gap-3 mb-4 items-center">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg transition text-[10px] ${filter === 'all'
                                ? 'bg-blue-500 text-white shadow'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All Exams
                        </button>
                        <button
                            onClick={() => setFilter('my')}
                            className={`px-4 py-2 rounded-lg transition text-[10px] ${filter === 'my'
                                ? 'bg-blue-500 text-white shadow'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            My Exams
                        </button>
                        <div>
                            <button
                                onClick={() => setIsRemovedModalOpen(true)}
                                className=" text-[10px] px-3 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 flex items-center gap-1"
                            >
                                <FiRotateCw /> Removed Exams
                            </button>

                        </div>

                        <div className="flex items-center ml-auto gap-2">
                            <input
                                type="text"
                                value={search}
                                onChange={handleSearchChange}
                                placeholder="Search exams"
                                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <button
                                onClick={handleSearchSubmit}
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1 text-sm"
                            >
                                <FiSearch /> Search
                            </button>
                            <button
                                onClick={fetchExams}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 flex items-center gap-1"
                            >
                                <FiRefreshCw /> Refresh
                            </button>
                        </div>
                    </div>

                    {/* Exam List */}
                    {loading ? (
                        <div className="text-center text-gray-500 animate-pulse py-10">Loading exams...</div>
                    ) : exams.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">No exams found.</div>
                    ) : (
                        <div className="h-80 overflow-y-auto rounded-lg border bg-gray-50 p-4">
                            {exams.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="flex justify-between items-center bg-white rounded-xl p-4 mb-3 shadow hover:shadow-md transition"
                                >
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{exam.title}</h3>
                                        <p className="text-sm text-gray-600">{exam.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Created by: <span className="font-medium">{exam.createdBy}</span> |{' '}
                                            {new Date(exam.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {exam.status === 'added' ? (
                                        <button
                                            disabled
                                            className="flex items-center gap-1 bg-gray-300 text-white px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                                        >
                                            ✅ Added
                                        </button>
                                    ) : exam.status === 'removed' ? (
                                        <button
                                            disabled
                                            className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-2 rounded-lg text-sm cursor-not-allowed"
                                        >
                                            ⚠️ Removed
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleAddExam(exam.id)}
                                            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
                                        >
                                            <FiPlusCircle /> Add Exam
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Dialog.Panel>
            </div>
            {/* toast  */}
            <ToastContainer position='top-center'></ToastContainer>
            {/* removed exams list  */}
            <RemovedExamsModal
                isOpen={isRemovedModalOpen}
                onClose={() => setIsRemovedModalOpen(false)}
                groupId={groupId}
                fetchAddedExams={fetchAddedExams}
                fetchAllExams={fetchExams}
            />

        </Dialog>
    );
};

export default ExamListModal;
