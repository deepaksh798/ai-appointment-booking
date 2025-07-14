"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, Edit3 } from "lucide-react";

const CalendarComponent = ({
  appointments = [],
  onDateSelect,
  onAppointmentClick,
  onAddAppointment,
  selectedDate,
  className = "",
}: any) => {
  const [currentDate, setCurrentDate] = useState<any>(new Date());
  // const [viewMode, setViewMode] = useState<any>("month"); // 'month', 'week', 'day'

  // Get current date info
  const today = new Date();
  const isToday = (date: any) => {
    return date.toDateString() === today.toDateString();
  };

  // const isSameMonth = (date1: any, date2: any) => {
  //   return (
  //     date1.getMonth() === date2.getMonth() &&
  //     date1.getFullYear() === date2.getFullYear()
  //   );
  // };

  const getDaysInMonth = (date: any) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        isPrevMonth: true,
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day: day,
        date: new Date(year, month, day),
        isCurrentMonth: true,
        isPrevMonth: false,
      });
    }

    // Add days from next month to fill the grid
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day: day,
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isPrevMonth: false,
      });
    }

    return days;
  };

  const formatDate = (date: any) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getAppointmentsForDate = (date: any) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((apt: any) => apt.date === dateStr);
  };

  const hasAppointments = (date: any) => {
    return getAppointmentsForDate(date).length > 0;
  };

  const navigateMonth = (direction: any) => {
    setCurrentDate((prev: any) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    onDateSelect && onDateSelect(new Date());
  };

  const handleDateClick = (dateObj: any) => {
    onDateSelect && onDateSelect(dateObj.date);
  };

  const handleEditAppointment = (appointment: any, e: any) => {
    e.stopPropagation(); // Prevent triggering the parent click event
    onAppointmentClick && onAppointmentClick(appointment);
  };

  const days = getDaysInMonth(currentDate);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={`bg-white rounded-2xl shadow-lg ${className}`}>
      <div className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">
              {formatDate(currentDate)}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Today
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((dateObj, index) => {
            const dayAppointments = getAppointmentsForDate(dateObj.date);
            const isSelected =
              selectedDate &&
              dateObj.date.toDateString() === selectedDate.toDateString();
            const isTodayDate = isToday(dateObj.date);

            return (
              <div
                key={index}
                className={`
                  relative min-h-[40px] sm:min-h-[60px] p-1 sm:p-2 cursor-pointer rounded-lg transition-all duration-200
                  ${
                    !dateObj.isCurrentMonth
                      ? "text-gray-400 bg-gray-50"
                      : "text-gray-900 hover:bg-blue-50"
                  }
                  ${isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""}
                  ${isTodayDate ? "bg-blue-100 font-bold" : ""}
                  ${
                    hasAppointments(dateObj.date)
                      ? "bg-green-50 border border-green-200"
                      : ""
                  }
                `}
                onClick={() => handleDateClick(dateObj)}
              >
                <div className="text-center">
                  <span
                    className={`text-sm font-medium ${
                      isTodayDate ? "text-blue-700" : ""
                    }`}
                  >
                    {dateObj.day}
                  </span>
                </div>

                {/* Appointment Indicators */}
                {dayAppointments.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {dayAppointments.slice(0, 3).map((apt: any, i: any) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          apt.status === "confirmed"
                            ? "bg-green-500"
                            : apt.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                        }`}
                        title={apt.title}
                      />
                    ))}
                    {dayAppointments.length > 3 && (
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-blue-500"
                        title={`+${dayAppointments.length - 3} more`}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              {onAddAppointment && (
                <button
                  onClick={() => onAddAppointment(selectedDate)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              )}
            </div>

            {(() => {
              const dayAppointments = getAppointmentsForDate(selectedDate);
              if (dayAppointments.length > 0) {
                return (
                  <div className="space-y-2">
                    {dayAppointments.map((appointment: any, index: any) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              appointment.status === "confirmed"
                                ? "bg-green-500"
                                : appointment.status === "pending"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {appointment.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {appointment.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              appointment.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : appointment.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {appointment.status}
                          </span>
                          <button
                            onClick={(e) =>
                              handleEditAppointment(appointment, e)
                            }
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Edit appointment"
                          >
                            <Edit3 className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              } else {
                return (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">
                      No appointments scheduled
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Click &quot;Add&quot; to schedule an appointment
                    </p>
                  </div>
                );
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarComponent;
