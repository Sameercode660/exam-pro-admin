'use client'

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

const AdminDashboard = () => {
  const [exams, setExams] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState('active')



  const generateExamCode = () => {
    // return `EXAM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    return Math.floor(Math.random() * 999999);
  };

  const handleCreateExam = async () => {
    // exam code generation 
    const examCode = generateExamCode();


    const data = {
      title,
      description,
      duration,
      examCode,
      status,
      createdBy: localStorage.getItem("adminId")
    };

   if(!title || !description || !duration || !examCode || !status || !data.createdBy) {
    
   }
    console.log(data)

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/create-exam`, data)

      console.log(response)

      if (response.data.status != true) {
        alert('Unable to create the exam');
      }
    } catch (error) {
      console.log(error)
      alert('Unable to create the exam');
    } finally {
      examData.title = '';
      examData.description = '';
      examData.duration = '';
      setIsDialogOpen(false);
    }

  };

  const handleDialogOpen = () => {
    const examCode = generateExamCode();
    setExamData({ ...examData, examCode });
    setIsDialogOpen(true);
  };

  async function fetchExam() {
    const data = {
      createdBy: localStorage.getItem('adminId')
    };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_ROOT_URL}/fetch-exam`, data);
      setExams(response.data.response)
      console.log(response)
    } catch (error) {
      alert('Unable to fetch the exams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExam()
  }, [])

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
          onClick={handleDialogOpen}
        >
          <PlusCircle className="w-5 h-5" />
          Create Exam
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-xl">
          <CardHeader className="bg-blue-500 text-white p-4 rounded-t-2xl">
            <CardTitle className="text-lg">Exam Title</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-gray-700 mb-4">
              This is a brief description of the exam. It provides an overview of the exam content and purpose.
            </p>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white w-full flex items-center justify-center gap-2"
            >
              <span>Go to Exam</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={examData.title}
                onChange={handleInputChange}
                placeholder="Enter exam title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={examData.description}
                onChange={handleInputChange}
                placeholder="Enter exam description"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={examData.duration}
                onChange={handleInputChange}
                placeholder="Enter duration"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={examData.status}
                onChange={handleInputChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <Label htmlFor="examCode">Exam Code</Label>
              <Input
                id="examCode"
                name="examCode"
                value={examData.examCode}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} className="bg-gray-200 text-gray-800">
              Cancel
            </Button>
            <Button onClick={handleCreateExam} className="bg-blue-500 hover:bg-blue-600 text-white">
              Create Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;