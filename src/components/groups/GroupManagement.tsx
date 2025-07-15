'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

// Interfaces for type safety
interface Group {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Participant {
  id: number;
  name: string;
  email: string;
}

interface Exam {
  id: number;
  title: string;
}

const GroupManagement = () => {
  // Get groupId from URL params (e.g., /groups/:groupId)
  const { groupId } = useParams(); 
  console.log('Group ID:', groupId);

  const [group, setGroup] = useState<Group | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allStudents, setAllStudents] = useState<Participant[]>([]);
  const [assignedExams, setAssignedExams] = useState<Exam[]>([]);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [openExamDialog, setOpenExamDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);

  const { user } = useAuth();

  const organizationId = user?.organizationId;
  const adminId = user?.id;

  /**
   * Fetch the group details like name, description, dates, isActive
   * API: /api/groups/fetch-single-group
   */
  const fetchGroupDetails = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-single-group`, { groupId: Number(groupId) });
      setGroup(res.data.group);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to fetch group');
    }
  };

  /**
   * Fetch participants assigned to this group
   * API: /api/groups/:groupId/participants
   */
  const fetchParticipants = async () => {
    const res = await axios.get(`/api/groups/${groupId}/participants`);
    setParticipants(res.data.participants);
  };

  /**
   * Fetch exams already assigned to this group
   * API: /api/groups/:groupId/assigned-exams
   */
  const fetchAssignedExams = async () => {
    const res = await axios.get(`/api/groups/${groupId}/assigned-exams`);
    setAssignedExams(res.data.exams);
  };

  /**
   * Fetch all available exams in the organization to assign to the group
   * API: /api/exams/fetch-all-exam
   */
  const fetchAvailableExams = async () => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/exams/fetch-all-exam`);
    setAvailableExams(res.data.exams);
  };

  /**
   * Fetch all students in the organization (not necessarily in this group)
   * API: /api/participants/fetch-all-participant
   */
  const fetchAllStudents = async () => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/participants/fetch-all-participant`, {
      organizationId,
      filter: 'all',
      search: '',
      adminId,
    });
    setAllStudents(res.data.participants);
  };

  /**
   * Add a participant to the group
   * API: /api/groups/participants
   */
  const handleAddParticipant = async (participantId: number) => {
    try {
      await axios.post('/api/groups/participants', { groupId, participantId, userId: adminId });
      toast.success('Participant added');
      fetchParticipants();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add participant');
    }
  };

  /**
   * Remove a participant from the group (Soft Delete)
   * API: /api/groups/participants (DELETE)
   */
  const handleRemoveParticipant = async (participantId: number) => {
    try {
      await axios.delete('/api/groups/participants', {
        data: { groupId, participantId }
      });
      toast.success('Participant removed');
      fetchParticipants();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to remove participant');
    }
  };

  /**
   * Assign an exam to the group
   * API: /api/groups/assign-exam
   */
  const handleAssignExam = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam');
      return;
    }
    try {
      await axios.post('/api/groups/assign-exam', {
        groupId,
        examId: selectedExam,
        assignedBy: adminId
      });
      toast.success('Exam assigned');
      setOpenExamDialog(false);
      fetchAssignedExams();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to assign exam');
    }
  };

  /**
   * On component mount, fetch all necessary data
   */
  useEffect(() => {
    if (!groupId) return;
    fetchGroupDetails();
    fetchParticipants();
    fetchAssignedExams();
    fetchAvailableExams();
    fetchAllStudents();
  }, [groupId]);

  if (!group) {
    return <div className="text-center py-20 text-gray-500">Loading group details...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow rounded-lg">

      {/* Group Details Section */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold mb-2">{group.name}</h2>
        <p className="text-gray-600">{group.description || 'No description provided'}</p>
        <div className="mt-2 text-sm text-gray-500">
          <span>Start: {new Date(group.startDate).toLocaleDateString()}</span> | 
          <span> End: {new Date(group.endDate).toLocaleDateString()}</span> | 
          <span> {group.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>

      {/* Participants Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Participants</h3>
        <ul className="space-y-2">
          {participants.map((p) => (
            <li key={p.id} className="flex justify-between border p-2 rounded">
              <span>{p.name} ({p.email})</span>
              <Button variant="destructive" onClick={() => handleRemoveParticipant(p.id)}>Remove</Button>
            </li>
          ))}
        </ul>

        {/* Add Participants */}
        <h4 className="mt-4 font-semibold">Add Participant</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {allStudents
            .filter((s) => !participants.some((p) => p.id === s.id))
            .map((s) => (
              <Button key={s.id} onClick={() => handleAddParticipant(s.id)}>{s.name}</Button>
            ))}
        </div>
      </div>

      {/* Assigned Exams Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Assigned Exams</h3>
        <ul className="space-y-2">
          {assignedExams.map((exam) => (
            <li key={exam.id} className="border p-2 rounded">{exam.title}</li>
          ))}
        </ul>

        {/* Assign New Exam */}
        <Button className="mt-4" onClick={() => setOpenExamDialog(true)}>Assign New Exam</Button>
      </div>

      {/* Exam Assignment Dialog */}
      <Dialog open={openExamDialog} onOpenChange={setOpenExamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Exam to Assign</DialogTitle>
          </DialogHeader>

          <select
            className="w-full border p-2 rounded"
            value={selectedExam || ''}
            onChange={(e) => setSelectedExam(Number(e.target.value))}
          >
            <option value="">Select Exam</option>
            {availableExams.map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.title}</option>
            ))}
          </select>

          <DialogFooter>
            <Button onClick={handleAssignExam}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default GroupManagement;
