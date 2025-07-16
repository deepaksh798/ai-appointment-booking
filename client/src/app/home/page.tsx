"use client";

import React, { useState, useEffect } from "react";
import CalenderComponent from "../../components/CalendarComponent"; // Import the Calendar component
import Status from "@/components/Status";
import AIAssistant from "@/components/AIAssistant";
import { useAppDispatch, useAppSelector } from "@/lib/Redux/Hook/hook";
import { fetchUserData } from "@/lib/Redux/Slice/vapiDataSlice";
import {
  bookAppointment,
  getAppointments,
  updateAppointment,
} from "@/network/Api";
import formatDateTime from "@/_utils/formatDateTime";
import ResponsiveDialog from "@/components/Dialog.tsx/Dialog";

// Main App Component
const AppointmentBookingApp = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Start with null
  const [openCallAssistant, setOpenCallAssistant] = useState(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentPurpose, setAppointmentPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointments, setAppointments] = useState<any>([]);
  const [selectedTime, setSelectedTime] = useState("10:00"); // Default time

  console.log("Appointments:", appointments);

  const dispatch = useAppDispatch();

  const handleDateSelect = (date: any) => {
    setSelectedDate(date);
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setAppointmentPurpose(appointment.title || appointment.description || "");
    setDialogMode("edit");
    setOpenDialog(true);
  };

  const handleAddAppointment = (date: any) => {
    setSelectedDate(date);
    setSelectedAppointment(null);
    setAppointmentPurpose("");
    setDialogMode("add");
    setOpenDialog(true);
  };

  const handleFetchUserData = () => {
    console.log("handleFetchUserData called");
    dispatch(fetchUserData());
  };

  const userDetails = useAppSelector(
    (state) => state.vapiCustomerData.userDetails
  );

  useEffect(() => {
    if (
      userDetails &&
      userDetails.dateAndTime &&
      userDetails.purposeOfAppointment
    ) {
      const payload = {
        time: userDetails.dateAndTime,
        description: userDetails.purposeOfAppointment,
      };

      console.log("Booking appointment with payload:", payload);
      bookAppointment(payload)
        .then((res) => {
          console.log("Appointment booked successfully:", res);
          fetchAppointments();
        })
        .catch((err) => {
          console.error("Error booking appointment:", err);
        });
    }
  }, [userDetails]);

  const fetchAppointments = async () => {
    try {
      const response = await getAppointments();
      const transformedAppointments = response.data.appointments.map(
        (item: any) => {
          const { date, time } = formatDateTime(item.time);
          return {
            id: item._id,
            date: date,
            time: time,
            title: item.description,
            description: "none",
            status: "confirmed",
          };
        }
      );

      setAppointments(transformedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleDialogSubmit = async () => {
    if (!appointmentPurpose.trim()) {
      alert("Please enter appointment purpose");
      return;
    }

    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure selectedDate is a Date object
      const baseDate = new Date(selectedDate);

      // Get year, month, day from selectedDate
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const day = baseDate.getDate();

      // Parse selectedTime
      const [hours, minutes] = selectedTime.split(":").map(Number);

      // Create a new Date in UTC
      const appointmentDate = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0));

      // Convert to ISO string (UTC)
      const isoTime = appointmentDate.toISOString();

      const payload = {
        time: isoTime,
        description: appointmentPurpose.trim(),
      };

      console.log("Selected Date:", selectedDate);
      console.log("Selected Time:", selectedTime);
      console.log("Appointment Date with Time (UTC):", appointmentDate);
      console.log("ISO Time:", isoTime);

      if (dialogMode === "add") {
        console.log("Adding appointment with payload:", payload);
        await bookAppointment(payload);
        console.log("Appointment added successfully");
      } else if (dialogMode === "edit" && selectedAppointment) {
        console.log(
          "Updating appointment with ID:",
          selectedAppointment.id,
          "Payload:",
          payload
        );
        await updateAppointment(selectedAppointment.id, payload);
        console.log("Appointment updated successfully");
      }

      // Refresh appointments list
      await fetchAppointments();

      // Close dialog and reset form
      setOpenDialog(false);
      setAppointmentPurpose("");
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error processing appointment:", error);
      alert("Error processing appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setAppointmentPurpose("");
    setSelectedAppointment(null);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <CalenderComponent
              appointments={appointments}
              onDateSelect={handleDateSelect}
              onAppointmentClick={handleAppointmentClick}
              onAddAppointment={handleAddAppointment}
              selectedDate={selectedDate}
              className="h-full"
            />
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <AIAssistant
              handleOpenCallAssistant={() =>
                setOpenCallAssistant(!openCallAssistant)
              }
              handleFetchUserData={handleFetchUserData}
            />
          </div>
        </div>

        {/* Stats Dashboard */}
        <Status appointments={appointments} />
      </div>

      {/* Appointment Dialog */}
      <ResponsiveDialog
        isOpen={openDialog}
        onClose={handleDialogClose}
        title={dialogMode === "add" ? "Add Appointment" : "Edit Appointment"}
      >
        <div className="space-y-4">
          {selectedDate && (
            <div className="text-sm text-gray-600">
              <strong>Date:</strong>{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}

          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Appointment Time
            </label>
            <input
              type="time"
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="purpose"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Appointment Purpose
            </label>
            <input
              id="purpose"
              value={appointmentPurpose}
              onChange={(e) => setAppointmentPurpose(e.target.value)}
              placeholder="Enter the purpose of your appointment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleDialogClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDialogSubmit}
              disabled={isSubmitting || !appointmentPurpose.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : dialogMode === "add"
                ? "Add Appointment"
                : "Update Appointment"}
            </button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
};

export default AppointmentBookingApp;
