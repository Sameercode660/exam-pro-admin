'use client';

import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExamListModal from './ExamListModal';
import { useSocket } from '@/context/SocketContext';
import { downloadUploadSummaryExcel } from '@/lib/summary-download';

interface Group {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Participant {
  id: number;
  name: string;
  email: string;
  status: 'added' | 'removed' | 'not_added';
}

const GroupManagement = () => {

  const { user } = useAuth();
  const organizationId = user?.organizationId;
  const adminId = user?.id;

  const { groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<"all" | "my">("all");

  const [groupParticipants, setGroupParticipants] = useState<any[]>([]); // Active participants in the group

  // remove participant
  const [removedParticipants, setRemovedParticipants] = useState<Participant[]>([]);
  const [isRemovedOpen, setIsRemovedOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  // socket
  const socket = useSocket();


  // fetch remove participants
  const fetchRemovedParticipants = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/removed-participants`, {
        groupId: Number(groupId),
      });

      setRemovedParticipants(res.data.participants);
      setIsRemovedOpen(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to fetch removed participants');
    }
  };

  // restore participants
  const handleRestoreParticipant = async (participantId: number) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/restore-participant`, {
        groupId: Number(groupId),
        participantId,
      });
      // socket ent 
      socket?.emit('remove-participant-admin', 'restored')
      toast.success('Participant restored.');

      // ✅ Update participants list to mark as 'not_added' again or your desired status
      setParticipants(prev =>
        prev.map(p =>
          p.id === participantId ? { ...p, status: 'not_added' } : p
        )
      );

      fetchGroupParticipants();
      fetchRemovedParticipants();
      fetchParticipants()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Restore failed.');
    }
  };


  // Fetch group participants (active + visible)
  const fetchGroupParticipants = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-group-participants`, {
        groupId: Number(groupId),
      });

      setGroupParticipants(res.data.participants);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to fetch group participants');
    }
  };

  // Remove participant from group
  const handleRemoveParticipant = async (participantId: number) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/remove-group-participant`, {
        groupId: Number(groupId),
        participantId,
      });

      // socket event 
      socket?.emit('remove-participant-admin', 'removed')
      toast.success('Participant removed.');

      setGroupParticipants(prev => prev.filter(p => p.user.id !== participantId));

      // ✅ Update local participants list to mark as removed
      setParticipants(prev =>
        prev.map(p =>
          p.id === participantId ? { ...p, status: 'removed' } : p
        )
      );
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Remove failed.');
    }
  };


  useEffect(() => {
    if (isAddParticipantOpen) {
      fetchParticipants();
      fetchGroupParticipants();
    }
  }, [isAddParticipantOpen, search, filter]);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-single-group`, {
          groupId: Number(groupId),
        });
        setGroup(res.data.group);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) fetchGroup();
  }, [groupId]);

  const handleUploadExcel = async () => {
    if (!uploadFile) {
      toast.error("Please select an Excel or CSV file to upload.");
      return;
    }

    if (!groupId || !organizationId) {
      toast.error("Group ID or Organization ID is missing.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("groupId", String(groupId));
      formData.append("organizationId", String(organizationId));
      formData.append("createdById", String(adminId))

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_ROOT_URL}/groups/add-participant-file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      downloadUploadSummaryExcel(res.data.summaryData, "Group_Adding_participants")
      console.log(res.data)
      const { addedNames, alreadyInGroupNames, unmatchedEmails } = res.data;

      // socket event 
      socket?.emit('add-participant-admin', 'added')

      // if (addedNames.length > 0) toast.success(`Added: ${addedNames.join(", ")}`);
      // if (alreadyInGroupNames.length > 0) toast.info(`Already in group: ${alreadyInGroupNames.join(", ")}`);
      // if (unmatchedEmails.length > 0) toast.warning(`Not found in organization: ${unmatchedEmails.join(", ")}`);
      toast.success(`${res.data.inserted} Participants added in the group`)
      setIsAddParticipantOpen(false);
      setUploadFile(null);
      setSelected([]);
      fetchParticipants();
      fetchGroupParticipants();

    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "File upload failed.");
    }
  };


  const fetchParticipants = useCallback(async (): Promise<void> => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-all-participants`, {
        organizationId,
        adminId,
        filter,
        search,
        groupId: Number(groupId),
      });

      setParticipants(res.data.participants);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to fetch participants');
    }
  }, [organizationId, adminId, filter, search, groupId]);

  const handleAddToGroup = async () => {
    const validIds = selected.filter(id => {
      const participant = participants.find(p => p.id === id);
      return participant && participant.status !== 'added';
    });

    if (validIds.length === 0) {
      toast.warning('No valid participants selected.');
      return;
    }

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/add-participants`, {
        groupId: Number(groupId),
        participantIds: validIds,
      });

      // socket event 

      socket?.emit('add-participant-admin', 'added')
      const { addedCount, skippedParticipants } = res.data;
      if (addedCount > 0) toast.success(`${addedCount} participant(s) added successfully.`);
      if (skippedParticipants.length > 0) {
        toast.info(`${skippedParticipants.join(', ')} already in the group.`);
      }

      // ✅ Update local participant statuses
      setParticipants(prev =>
        prev.map(p =>
          validIds.includes(p.id) ? { ...p, status: 'added' } : p
        )
      );

      setIsAddParticipantOpen(false);
      setSelected([]);
      fetchGroupParticipants(); // only need this for groupParticipants not for participants list now
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add participants.');
    }
  };


  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const isAllSelected = selected.length === filteredParticipants.length && filteredParticipants.length > 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(filteredParticipants.map(p => p.id));
    } else {
      setSelected([]);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 via-white to-gray-100 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 mb-8">
        {loading ? (
          <div className="text-gray-500 text-center animate-pulse">Loading group details...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : group ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">{group.name}</h2>
            <p className="text-gray-600">{group.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mt-4">
              <div className="flex flex-col bg-gray-50 rounded-xl p-4 shadow-sm">
                <span className="text-sm text-gray-500">Start Date</span>
                <span className="font-medium">{new Date(group.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col bg-gray-50 rounded-xl p-4 shadow-sm">
                <span className="text-sm text-gray-500">End Date</span>
                <span className="font-medium">{new Date(group.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col bg-gray-50 rounded-xl p-4 shadow-sm">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`font-medium ${group.isActive ? 'text-green-500' : 'text-red-500'}`}>{group.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex flex-col bg-gray-50 rounded-xl p-4 shadow-sm">
                <span className="text-sm text-gray-500">Group ID</span>
                <span className="font-medium">{group.id}</span>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={() => setIsAddParticipantOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FiPlus /> Manage Participants
              </button>
              <button onClick={() => setIsExamModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <FiPlus /> Manage Exams
              </button>
            </div>

          </div>
        ) : null}
      </div>

      {/* Participants Modal */}
      <Dialog open={isAddParticipantOpen} onClose={() => setIsAddParticipantOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-xl w-full p-6">
            <Dialog.Title className="text-lg font-bold mb-4">Manage Participants</Dialog.Title>

            <div className='flex mb-4'>
              <label className="flex items-center justify-between w-full md:w-2/3 px-4 py-2 border rounded-xl bg-white hover:bg-gray-50 cursor-pointer text-gray-600 truncate">
                {/* Show file name or placeholder */}
                <span className="truncate">
                  {uploadFile ? uploadFile.name : "Please choose a file"}
                </span>

                {/* Hidden input field */}
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <button onClick={handleUploadExcel} className="rounded h-[40px] px-5 bg-green-500 text-white mx-3">
                Upload
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                All Participants
              </button>
              <button onClick={() => setFilter("my")} className={`px-4 py-2 rounded ${filter === "my" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                My Participants
              </button>
            </div>

            <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 border rounded p-2 w-full" />

            <div className="flex items-center mb-2">
              <input type="checkbox" checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} className="mr-2" />
              <span className="text-sm text-gray-700">Select All</span>
            </div>

            <div className="h-60 overflow-y-auto space-y-2 border rounded p-2 bg-gray-50">
              {filteredParticipants.length === 0 ? (
                <div className="text-center text-gray-400">No participants found.</div>
              ) : (
                filteredParticipants.map((p) => (
                  <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded hover:bg-gray-100">
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <span className={`ml-2 text-xs px-2 py-1 rounded ${p.status === 'added' ? 'bg-green-100 text-green-700' :
                        p.status === 'removed' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                        {p.status}
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      disabled={p.status === 'added'}
                      checked={selected.includes(p.id)}
                      onChange={() => {
                        setSelected(prev =>
                          prev.includes(p.id)
                            ? prev.filter(id => id !== p.id)
                            : [...prev, p.id]
                        );
                      }}
                    />
                  </div>
                ))
              )}
            </div>


            <div className="mt-4 flex justify-end gap-4">
              <button onClick={() => setIsAddParticipantOpen(false)} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
              <button onClick={handleAddToGroup} className="px-4 py-2 rounded bg-blue-500 text-white">
                Add Selected
              </button>
            </div>

            <div className="mt-6">
              <h3 className="font-bold mb-2">Current Group Participants</h3>
              <button
                onClick={fetchRemovedParticipants}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Removed Participants
              </button>
              <div className="space-y-2">
                {groupParticipants.length === 0 ? (
                  <div className="text-center text-gray-400">No participants in this group.</div>
                ) : (
                  groupParticipants.map((p) => (
                    <div key={p.user.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm hover:bg-gray-50">
                      <span>{p.user.name}</span>
                      <button onClick={() => handleRemoveParticipant(p.user.id)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </Dialog.Panel>
        </div>
      </Dialog>
      {/* removed participant modal  */}
      <Dialog open={isRemovedOpen} onClose={() => setIsRemovedOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <Dialog.Title className="text-lg font-bold mb-4">Removed Participants</Dialog.Title>

            {removedParticipants.length === 0 ? (
              <div className="text-center text-gray-400">No removed participants.</div>
            ) : (
              <div className="space-y-3">
                {removedParticipants.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                    <span>{p.name}</span>
                    <button
                      onClick={() => handleRestoreParticipant(p.id)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button onClick={() => setIsRemovedOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Close</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      {/* exam modal list  */}
      <ExamListModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        organizationId={organizationId || 0}
        adminId={adminId || 0}
        groupId={Number(groupId)}
      />


      <ToastContainer position='top-center' />
    </div>
  );
};

export default GroupManagement;
