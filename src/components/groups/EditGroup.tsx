'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import Toast from "../utils/Toast";
import Spinner from "../utils/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useRef } from "react";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

const EditGroup = ({
  groupId,
  onClose,
  onSuccess,
}: {
  groupId: number;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [groupData, setGroupData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [justSelected, setJustSelected] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setKeyboardNav(true);
      }
    };
    const handleMouseDown = () => {
      setKeyboardNav(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_ROOT_URL}/groups/fetch-single-group`,
          { groupId }
        );
        setGroupData(res.data.group);
      } catch (err: any) {
        setToast({
          type: "error",
          message: err.response?.data?.error || "Failed to fetch group",
        });
      }
    };
    fetchGroup();
  }, [groupId]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/groups/update`, {
        groupId,
        adminId: user?.id,
        name: groupData.name,
        description: groupData.description,
        startDate: groupData.startDate,
        endDate: groupData.endDate,
        isActive: groupData.isActive,
      });

      setToast({ type: "success", message: "Group updated successfully" });
      onSuccess();
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.response?.data?.error || "Failed to update group",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setGroupData({ ...groupData, [name]: value });
  };

  if (!groupData) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex items-center justify-center z-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Group</h2>

        <input
          className="w-full mb-2 border px-3 py-2 rounded"
          name="name"
          placeholder="Group Name"
          value={groupData.name}
          onChange={(e) => handleChange(e.target.name, e.target.value)}
        />
        <textarea
          className="w-full mb-2 border px-3 py-2 rounded"
          name="description"
          placeholder="Description"
          value={groupData.description}
          onChange={(e) => handleChange(e.target.name, e.target.value)}
        />

        {/* Start Date Picker */}
        <div className="mb-4 ">
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <p className="w-full mb-2 border px-3 py-2 rounded text-gray-500"> {new Date(groupData.startDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}</p>
        </div>

        {/* End Date Picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={buttonRef}
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onFocus={() => {
                  if (keyboardNav && !justSelected) {
                    setOpen(true);
                  }
                  setJustSelected(false); // reset flag
                }}
              >
                {groupData.endDate
                  ? format(new Date(groupData.endDate), "dd/MM/yyyy")
                  : "Pick an end date"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0"
              side="top"
              align="start"
              sideOffset={4}
              avoidCollisions={false} >
              <Calendar
                mode="single"
                selected={groupData.endDate ? new Date(groupData.endDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    handleChange("endDate", format(date, "yyyy-MM-dd"));
                    setJustSelected(true); // mark we just picked
                    setOpen(false);

                    // ✅ blur button so focus doesn’t reopen
                    buttonRef.current?.blur();
                  }
                }}
                disabled={(date) =>
                  groupData.startDate ? date < new Date(groupData.startDate) : false
                }
              />
            </PopoverContent>
          </Popover>

        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? <Spinner /> : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditGroup;
