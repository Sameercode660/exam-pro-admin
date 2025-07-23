'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import axios from 'axios';
import { FiX, FiRotateCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSocket } from '@/context/SocketContext';

interface RemovedExam {
    id: number; // groupExamId
    exam: {
        id: number;
        title: string;
    };
}

interface RemovedExamsModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: number;
    fetchAddedExams: () => void;
    fetchAllExams: () => void;
}

const RemovedExamsModal: React.FC<RemovedExamsModalProps> = ({ isOpen, onClose, groupId, fetchAddedExams, fetchAllExams }) => {
    const [removedExams, setRemovedExams] = useState<RemovedExam[]>([]);
    const [loading, setLoading] = useState(false);
    // socket 
    const socket = useSocket();

    const fetchRemovedExams = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-removed-exams`, {
                groupId,
            });
            setRemovedExams(res.data.removedExams);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to fetch removed exams');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (examId: number) => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/restore-group-exam`, {
                groupId,
                examId,
            });

            if (res.data.success) {
                socket?.emit('restore-exam-admin', 'removed')
                toast.success(res.data.message);
                fetchRemovedExams();
                fetchAddedExams();
                fetchAllExams();
            } else {
                toast.error(res.data.error || 'Failed to restore exam');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to restore exam');
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchRemovedExams();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Removed Exams</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-red-500">
                            <FiX size={20} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center text-gray-500 animate-pulse py-10">Loading removed exams...</div>
                    ) : removedExams.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">No removed exams found.</div>
                    ) : (
                        <div className="h-72 overflow-y-auto rounded-lg border bg-gray-50 p-4">
                            {removedExams.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-center bg-white rounded-lg p-3 mb-3 shadow hover:shadow-md transition"
                                >
                                    <span className="font-medium text-gray-700">{item.exam.title}</span>
                                    <button
                                        onClick={() => handleRestore(item.exam.id)}
                                        className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm"
                                    >
                                        <FiRotateCw /> Restore
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default RemovedExamsModal;
