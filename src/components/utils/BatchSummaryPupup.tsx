"use client";

import React from "react";
import { useRouter } from "next/navigation";

type BatchPopupProps = {
  data: {
    batchId: number;
    batchStatus: string;
    failed: number;
    inserted: number;
    message: string;
    skipped: number;
  };
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string; // optional path
};

const BatchSummaryPupup: React.FC<BatchPopupProps> = ({ data, isOpen, onClose, redirectPath }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleOk = () => {
    if (redirectPath) {
      router.push(redirectPath);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)] bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-96 p-6">
        <h2 className="text-lg font-semibold mb-4">Batch Details</h2>
        
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Batch ID:</span> {data.batchId}</p>
          <p><span className="font-medium">Status:</span> {data.batchStatus}</p>
          <p><span className="font-medium">Inserted:</span> {data.inserted}</p>
          <p><span className="font-medium">Skipped:</span> {data.skipped}</p>
          <p><span className="font-medium">Failed:</span> {data.failed}</p>
          <p><span className="font-medium">Message:</span> {data.message}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleOk}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchSummaryPupup;
