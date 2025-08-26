'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { buttonStyle } from '@/lib/style';

const CreateGroupForm = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showButton, setShowButton] = useState<boolean>(false);
  const [groupId, setGroupId] = useState<number>(0);
  const [serverDate, setServerDate] = useState<string>('')

  // calendar state
  const [open, setOpen] = useState(false);
  const [justSelected, setJustSelected] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Set default start date to today on load
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    fetchServerDate()
  }, []);

  // keyboard vs mouse detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') setKeyboardNav(true);
    };
    const handleMouseDown = () => setKeyboardNav(false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate('');
  };

  const resetError = () => {
    const id = setTimeout(() => {
      setError('');
      clearTimeout(id);
    }, 3000);
  };

  const fetchServerDate = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_URL}/date-time`);
    setServerDate(response.data.date)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setShowButton(false);

    const todayDate = new Date();
    const start = new Date(serverDate);
    const end = new Date(endDate);

    // Validation
    if (!name || !description || !serverDate || !endDate) {
      setError('All fields are required.');
      setLoading(false);
      resetError();
      return;
    }
    if (start < new Date(todayDate.toDateString())) {
      setError('Start date cannot be in the past.');
      setLoading(false);
      resetError();
      return;
    }
    if (start >= end) {
      setError('Start date must be before end date.');
      setLoading(false);
      resetError();
      return;
    }

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/create`, {
        name,
        description,
        serverDate,
        endDate,
        createdById: Number(user?.id),
        organizationId: Number(user?.organizationId),
      });

      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/group-inactivation/group-expiry-cron`, {
        groupId: res.data.group.id,
        endDate: res.data.group.endDate,
      });

      setShowButton(true);
      setGroupId(res.data.group.id);
      setSuccess('Group created successfully!');
      resetForm();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || 'Failed to create group.';
      setError(errMsg);
      resetError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create New Group</h2>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Group Name */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Group Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-4 py-2 rounded-md focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-4 py-2 rounded-md focus:ring focus:ring-blue-200"
            rows={3}
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date (disabled = today) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Start Date <span className="text-red-400">*</span>
            </label>
            <p className="w-full mb-2 border px-3 py-2 rounded text-gray-500">
              {new Date(serverDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* End Date (shadcn Calendar) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              End Date <span className="text-red-400">*</span>
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  ref={buttonRef}
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onFocus={() => {
                    if (keyboardNav && !justSelected) {
                      setOpen(true);
                    }
                    setJustSelected(false);
                  }}
                >
                  {endDate ? format(new Date(endDate), 'dd/MM/yyyy') : 'End date'}
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-auto p-0"
                side="top"
                align="start"
                sideOffset={4}
                avoidCollisions={false}
              >
                <Calendar
                  mode="single"
                  selected={endDate ? new Date(endDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setEndDate(format(date, 'yyyy-MM-dd'));
                      setJustSelected(true);
                      setOpen(false);
                      buttonRef.current?.blur();
                    }
                  }}
                  disabled={(date) => (startDate ? date < new Date(serverDate) : false)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Buttons */}
        <div className="text-right">
          {showButton && (
            <button
              type="button"
              onClick={() => router.push(`/home/groups/${groupId}/${1}/${0}`)}
              className="bg-green-600 mr-3 hover:bg-green-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
            >
              Add Participants
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupForm;
