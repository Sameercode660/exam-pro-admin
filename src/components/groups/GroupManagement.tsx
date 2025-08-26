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
import BatchSummaryPupup from '../utils/BatchSummaryPupup';

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
  const [uploadLoadingState, setUploadLoadingState] = useState(false)
  const { user } = useAuth();
  const organizationId = user?.organizationId;
  const adminId = user?.id;

  const { groupId, openDialog, openAdded } = useParams();
  const [openDialogState, setOpenDialogState] = useState(Number(openDialog) === 1);
  // const [openAddedDialogState, setOpenAddedDialogState] = useState(Number(openAdded) === 2);

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [groupParticipants, setGroupParticipants] = useState<any[]>([]);
  const [removedParticipants, setRemovedParticipants] = useState<Participant[]>([]);
  const [isRemovedOpen, setIsRemovedOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  const [searchAdded, setSearchAdded] = useState("");
  const [searchRemoved, setSearchRemoved] = useState("");

  const [open, setOpen] = useState(false);
  const [batchData, setBatchData] = useState({
    batchId: 0,
    batchStatus: "FAILED",
    failed: 0,
    inserted: 0,
    message: "Upload completed",
    skipped: 0,
  });

  const socket = useSocket();

  // Tabs
  const [activeTab, setActiveTab] = useState<'added' | 'all' | 'removed'>(Number(openAdded) === 2 ? 'added' : 'all');



  // ---------------- Fetch Functions ---------------- //

  const fetchParticipants = useCallback(async (): Promise<void> => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-all-participants`, {
        organizationId,
        adminId,
        search,
        groupId: Number(groupId),
      });
      setParticipants(res.data.participants);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to fetch participants');
    }
  }, [organizationId, adminId, search, groupId]);

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

  const fetchRemovedParticipants = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/removed-participants`, {
        groupId: Number(groupId),
      });
      console.log(res.data.participants)
      setRemovedParticipants(res.data.participants);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to fetch removed participants');
    }
  };

  useEffect(() => {
    if (isAddParticipantOpen || openDialogState) {
      fetchParticipants();
      fetchGroupParticipants();
      fetchRemovedParticipants();
    }
  }, [isAddParticipantOpen, search, openDialogState]);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-single-group`, {
          groupId: Number(groupId),
        });
        setGroup(res.data.group);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchGroup();
  }, [groupId]);

  // ---------------- Filtered Lists ---------------- //

  const addedParticipantsList = groupParticipants.map((p) => p.user);
  const removedParticipantsList = removedParticipants;
  const allParticipantsList = participants.filter(p =>
    !addedParticipantsList.find(ap => ap.id === p.id) &&
    !removedParticipantsList.find(rp => rp.id === p.id) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );


  // ------------ search filter ---------------------//
  const filteredAdded = addedParticipantsList.filter(p =>
    p.name.toLowerCase().includes(searchAdded.toLowerCase())
  );

  const filteredRemoved = removedParticipantsList.filter(p =>
    p.name.toLowerCase().includes(searchRemoved.toLowerCase())
  );


  const isAllSelected = selected.length === allParticipantsList.length && allParticipantsList.length > 0;
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(allParticipantsList.map(p => p.id));
    } else {
      setSelected([]);
    }
  };


  // -------------- function for upload and added to group, remove and restore
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


  const handleRemoveParticipant = async (participantId: number) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/remove-group-participant`, {
        groupId: Number(groupId),
        participantId,
      });

      // socket event 
      socket?.emit('remove-participant-admin', 'removed');
      toast.success('Participant removed.');

      // Remove from added list locally
      setGroupParticipants(prev => prev.filter(p => p.user.id !== participantId));

      // Update participant status locally
      setParticipants(prev =>
        prev.map(p =>
          p.id === participantId ? { ...p, status: 'removed' } : p
        )
      );

      // ✅ Fetch removed participants to update removed tab
      fetchRemovedParticipants();

    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Remove failed.');
    }
  };
  const handleUploadExcel = async () => {
    if (!uploadFile) {
      toast.error("Please select an Excel file to upload.");
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
      setUploadLoadingState(true)
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
      setOpen(true)
      setBatchData({
        batchId: res.data.batchId,
        batchStatus: res.data.batchStatus,
        failed: res.data.failed,
        inserted: res.data.inserted,
        message: res.data.message,
        skipped: res.data.skipped,
      })

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
    } finally {
      setUploadLoadingState(false)
    }
  };


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

  // ---------------- Render ---------------- //

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 via-white to-gray-100 flex flex-col items-center">
      <BatchSummaryPupup
        data={batchData}
        isOpen={open}
        onClose={() => setOpen(false)}
      />

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

      {/* Participants Modal with Tabs */}
      <Dialog open={isAddParticipantOpen || openDialogState} onClose={() => {
        setOpenDialogState(false);
        setIsAddParticipantOpen(false);
      }} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-bold mb-4">Manage Participants</Dialog.Title>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded-t ${activeTab === 'added' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveTab('added')}
              >
                Added Participants
              </button>
              <button
                className={`px-4 py-2 rounded-t ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveTab('all')}
              >
                All Participants
              </button>
              <button
                className={`px-4 py-2 rounded-t ${activeTab === 'removed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveTab('removed')}
              >
                Removed Participants
              </button>
            </div>

            {/* ---------------- Tab Contents ---------------- */}

            {activeTab === 'all' && (
              <>
                {/* File Upload + Add Participants */}
                <div className='flex mb-4'>
                  <label className="flex items-center justify-between w-full md:w-2/3 px-4 py-2 border rounded-xl bg-white hover:bg-gray-50 cursor-pointer text-gray-600 truncate">
                    <span className="truncate">
                      {uploadFile ? uploadFile.name : "Select a file for upload"}
                    </span>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <button onClick={handleUploadExcel} disabled={uploadLoadingState} className="rounded h-[40px] px-5 bg-green-500 text-white mx-3">
                    {uploadLoadingState ? 'Uploading...' : 'Upload'}
                  </button>
                </div>

                <input type="text" placeholder="Search participants..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 border rounded p-2 w-full" />

                <div className="flex items-center mb-2">
                  <input type="checkbox" checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} className="mr-2" />
                  <span className="text-sm text-gray-700">Select All</span>
                </div>

                <div className="h-60 overflow-y-auto space-y-2 border rounded p-2 bg-gray-50">
                  {allParticipantsList.length === 0 ? (
                    <div className="text-center text-gray-400">No participants found.</div>
                  ) : (
                    allParticipantsList.map((p) => (
                      <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded hover:bg-gray-100">
                        <div>
                          <span className="font-medium">{p.name}</span>
                          <span className={`ml-2 text-xs px-2 py-1 rounded bg-gray-100 text-gray-700`}>
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
                  <button onClick={handleAddToGroup} className="px-4 py-2 rounded bg-blue-500 text-white">
                    Add Selected
                  </button>
                </div>
              </>
            )}

            {activeTab === 'added' && (
              <div>
                <input
                  type="text"
                  placeholder="Search added participants..."
                  value={searchAdded}
                  onChange={(e) => setSearchAdded(e.target.value)}
                  className="mb-2 border rounded p-2 w-full"
                />
                <div className="space-y-2 h-60 overflow-y-auto">
                  {filteredAdded.length === 0 ? (
                    <div className="text-center text-gray-400">No participants found.</div>
                  ) : (
                    filteredAdded.map((p) => (
                      <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded hover:bg-gray-100">
                        <span>{p.name}</span>
                        <button onClick={() => handleRemoveParticipant(p.id)} className="text-red-500 hover:text-red-700">
                          <FiTrash2 />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'removed' && (
              <div>
                <input
                  type="text"
                  placeholder="Search removed participants..."
                  value={searchRemoved}
                  onChange={(e) => setSearchRemoved(e.target.value)}
                  className="mb-2 border rounded p-2 w-full"
                />
                <div className="space-y-2 h-60 overflow-y-auto">
                  {filteredRemoved.length === 0 ? (
                    <div className="text-center text-gray-400">No participants found.</div>
                  ) : (
                    filteredRemoved.map(p => (
                      <div key={p.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                        <span>{p.name}</span>
                        <button
                          onClick={() => handleRestoreParticipant(p.id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Restore
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-4">
              <button onClick={() => { setIsAddParticipantOpen(false); setOpenDialogState(false); }} className="px-4 py-2 rounded bg-gray-200">Close</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

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
