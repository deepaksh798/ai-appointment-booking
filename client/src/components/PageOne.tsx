// import React, { useState, useEffect } from 'react';
// import { Calendar, MessageCircle, Clock, User, Send, Bot, CheckCircle, ChevronLeft, ChevronRight, Plus, X, Edit3, Phone, Mic, PhoneOff, Volume2, VolumeX } from 'lucide-react';

// // Mock Redux hooks for demonstration
// const useAppSelector = (selector) => {
//   // Mock user details - replace with actual Redux selector
//   return {
//     dateAndTime: null // This will be populated after VAPI call
//   };
// };

// const useAppDispatch = () => {
//   // Mock dispatch - replace with actual Redux dispatch
//   return (action) => {
//     console.log('Dispatching action:', action);
//   };
// };

// // Mock VAPI object for demonstration
// const mockVapi = {
//   start: (assistantId) => {
//     console.log('Starting VAPI call with ID:', assistantId);
//   },
//   stop: () => {
//     console.log('Stopping VAPI call');
//   },
//   setMuted: (muted) => {
//     console.log('Setting mute state:', muted);
//   },
//   on: (event, callback) => {
//     console.log('Setting up VAPI event listener:', event);
//     // Mock event triggers for demonstration
//     if (event === 'call-start') {
//       setTimeout(() => callback(), 2000);
//     }
//   }
// };

// // AI Voice Assistant Component
// const AIVoiceAssistant = ({ handleFetchUserData, className = "" }) => {
//   const [callStatus, setCallStatus] = useState("Disconnected");
//   const [callMute, setCallMute] = useState(true);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isCallActive, setIsCallActive] = useState(false);

//   const handleStartCall = async () => {
//     console.log("Starting VAPI call");

//     try {
//       setCallStatus("Connecting...");
//       setIsCallActive(true);

//       // Replace with actual VAPI call
//       mockVapi.start("b091c4fe-079e-479c-83a6-89a3fad5fac4");

//       // Mock progression for demo
//       setTimeout(() => {
//         setCallStatus("Connected");
//         setTimeout(() => {
//           setCallStatus("Call Started");
//         }, 1000);
//       }, 2000);

//       // VAPI event listeners
//       mockVapi.on("call-start", () => setCallStatus("Call Started"));
//       mockVapi.on("speech-start", () => setIsSpeaking(true));
//       mockVapi.on("speech-end", () => setIsSpeaking(false));
//       mockVapi.on("call-end", () => {
//         setCallStatus("Call Ended");
//         setIsSpeaking(false);
//         setIsCallActive(false);
//         handleFetchUserData();
//       });
//       mockVapi.on("message", (message) => {
//         console.log("VAPI messages:", message.messages);
//       });
//       mockVapi.on("error", (e) => {
//         console.error("VAPI Error:", e);
//         setCallStatus("Error");
//         setIsCallActive(false);
//       });
//     } catch (error) {
//       console.error("Error starting VAPI call:", error);
//       setCallStatus("Error");
//       setIsCallActive(false);
//     }
//   };

//   const handleStopCall = () => {
//     mockVapi.stop();
//     setCallStatus("Disconnected");
//     setIsCallActive(false);
//     setIsSpeaking(false);
//   };

//   const handleCallMute = () => {
//     const newMuteState = !callMute;
//     setCallMute(newMuteState);
//     mockVapi.setMuted(!newMuteState);
//   };

//   const getStatusColor = () => {
//     if (["Call Started", "Connected"].includes(callStatus)) {
//       return "border-green-500 text-green-500 bg-green-50";
//     } else if (callStatus === "Connecting...") {
//       return "border-yellow-500 text-yellow-500 bg-yellow-50";
//     } else if (["Disconnected", "Error", "Call Ended"].includes(callStatus)) {
//       return "border-red-500 text-red-500 bg-red-50";
//     }
//     return "border-gray-300 text-gray-600 bg-gray-50";
//   };

//   return (
//     <div className={`bg-white rounded-2xl shadow-lg ${className}`}>
//       <div className="p-6 h-full flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center space-x-3">
//             <div className="bg-blue-600 p-2 rounded-lg">
//               <Bot className="h-5 w-5 text-white" />
//             </div>
//             <div>
//               <h3 className="font-semibold text-gray-900">AI Voice Assistant</h3>
//               <p className="text-sm text-gray-600">Book appointments with voice</p>
//             </div>
//           </div>
//         </div>

//         {/* AI Assistant Avatar */}
//         <div className="flex-1 flex flex-col items-center justify-center space-y-6">
//           <div className="relative">
//             <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ${
//               isSpeaking ? 'animate-pulse' : ''
//             }`}>
//               <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
//                 <Bot className="h-12 w-12 text-blue-600" />
//               </div>
//             </div>

//             {/* Speaking indicator */}
//             {isSpeaking && (
//               <div className="absolute -inset-2 rounded-full border-4 border-blue-300 animate-ping"></div>
//             )}
//           </div>

//           {/* Status Indicator */}
//           <div className={`px-4 py-2 rounded-full border-2 flex items-center space-x-2 ${getStatusColor()}`}>
//             <Phone className="h-4 w-4" />
//             <span className="text-sm font-medium">{callStatus}</span>
//           </div>

//           {/* Instructions */}
//           <div className="text-center max-w-sm">
//             <p className="text-gray-600 text-sm mb-2">
//               {isCallActive
//                 ? "I'm listening! Tell me about your appointment needs."
//                 : "Click the microphone to start a voice conversation with your AI assistant."
//               }
//             </p>
//             <p className="text-gray-500 text-xs">
//               Say things like: "Book an appointment for tomorrow at 2 PM" or "What's my schedule for this week?"
//             </p>
//           </div>
//         </div>

//         {/* Control Buttons */}
//         <div className="flex items-center justify-center space-x-4 mt-6">
//           {/* Mute Button */}
//           <button
//             onClick={handleCallMute}
//             disabled={!isCallActive}
//             className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
//               !isCallActive
//                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                 : callMute
//                   ? 'bg-orange-500 hover:bg-orange-600 text-white'
//                   : 'bg-gray-500 hover:bg-gray-600 text-white'
//             }`}
//           >
//             {callMute ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
//           </button>

//           {/* Main Call Button */}
//           <button
//             onClick={isCallActive ? handleStopCall : handleStartCall}
//             disabled={callStatus === "Connecting..."}
//             className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
//               callStatus === "Connecting..."
//                 ? 'bg-yellow-500 cursor-not-allowed'
//                 : isCallActive
//                   ? 'bg-red-500 hover:bg-red-600'
//                   : 'bg-blue-600 hover:bg-blue-700'
//             } text-white shadow-lg`}
//           >
//             {callStatus === "Connecting..." ? (
//               <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
//             ) : isCallActive ? (
//               <PhoneOff className="h-6 w-6" />
//             ) : (
//               <Mic className="h-6 w-6" />
//             )}
//           </button>

//           {/* End Call Button */}
//           <button
//             onClick={handleStopCall}
//             disabled={!isCallActive}
//             className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
//               !isCallActive
//                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                 : 'bg-red-500 hover:bg-red-600 text-white'
//             }`}
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {/* Quick Actions */}
//         <div className="mt-6 space-y-2">
//           <p className="text-xs text-gray-500 text-center">Quick voice commands:</p>
//           <div className="flex flex-wrap gap-2 justify-center">
//             <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
//               "Book appointment"
//             </span>
//             <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
//               "Check schedule"
//             </span>
//             <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
//               "Cancel meeting"
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Separate Calendar Component (unchanged from previous version)
// const CalendarComponent = ({
//   appointments = [],
//   onDateSelect,
//   onAppointmentClick,
//   onAddAppointment,
//   selectedDate,
//   className = ""
// }) => {
//   const [currentDate, setCurrentDate] = useState(new Date());

//   const today = new Date();
//   const isToday = (date) => {
//     return date.toDateString() === today.toDateString();
//   };

//   const getDaysInMonth = (date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const daysInMonth = lastDay.getDate();
//     const startingDayOfWeek = firstDay.getDay();

//     const days = [];

//     // Add days from previous month
//     const prevMonth = new Date(year, month - 1, 0);
//     const prevMonthDays = prevMonth.getDate();
//     for (let i = startingDayOfWeek - 1; i >= 0; i--) {
//       days.push({
//         day: prevMonthDays - i,
//         date: new Date(year, month - 1, prevMonthDays - i),
//         isCurrentMonth: false,
//         isPrevMonth: true
//       });
//     }

//     // Add days of current month
//     for (let day = 1; day <= daysInMonth; day++) {
//       days.push({
//         day: day,
//         date: new Date(year, month, day),
//         isCurrentMonth: true,
//         isPrevMonth: false
//       });
//     }

//     // Add days from next month to fill the grid
//     const remainingCells = 42 - days.length;
//     for (let day = 1; day <= remainingCells; day++) {
//       days.push({
//         day: day,
//         date: new Date(year, month + 1, day),
//         isCurrentMonth: false,
//         isPrevMonth: false
//       });
//     }

//     return days;
//   };

//   const formatDate = (date) => {
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long'
//     });
//   };

//   const getAppointmentsForDate = (date) => {
//     const dateStr = date.toISOString().split('T')[0];
//     return appointments.filter(apt => apt.date === dateStr);
//   };

//   const hasAppointments = (date) => {
//     return getAppointmentsForDate(date).length > 0;
//   };

//   const navigateMonth = (direction) => {
//     setCurrentDate(prev => {
//       const newDate = new Date(prev);
//       newDate.setMonth(prev.getMonth() + direction);
//       return newDate;
//     });
//   };

//   const goToToday = () => {
//     setCurrentDate(new Date());
//     onDateSelect && onDateSelect(new Date());
//   };

//   const handleDateClick = (dateObj) => {
//     onDateSelect && onDateSelect(dateObj.date);
//   };

//   const days = getDaysInMonth(currentDate);
//   const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//   return (
//     <div className={`bg-white rounded-2xl shadow-lg ${className}`}>
//       <div className="p-6">
//         {/* Calendar Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center space-x-4">
//             <h2 className="text-xl font-bold text-gray-900">{formatDate(currentDate)}</h2>
//             <button
//               onClick={goToToday}
//               className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
//             >
//               Today
//             </button>
//           </div>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => navigateMonth(-1)}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <ChevronLeft className="h-4 w-4 text-gray-600" />
//             </button>
//             <button
//               onClick={() => navigateMonth(1)}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <ChevronRight className="h-4 w-4 text-gray-600" />
//             </button>
//           </div>
//         </div>

//         {/* Day Headers */}
//         <div className="grid grid-cols-7 gap-1 mb-2">
//           {dayNames.map(day => (
//             <div key={day} className="p-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
//               <span className="hidden sm:inline">{day}</span>
//               <span className="sm:hidden">{day.slice(0, 1)}</span>
//             </div>
//           ))}
//         </div>

//         {/* Calendar Grid */}
//         <div className="grid grid-cols-7 gap-1">
//           {days.map((dateObj, index) => {
//             const dayAppointments = getAppointmentsForDate(dateObj.date);
//             const isSelected = selectedDate && dateObj.date.toDateString() === selectedDate.toDateString();
//             const isTodayDate = isToday(dateObj.date);

//             return (
//               <div
//                 key={index}
//                 className={`
//                   relative min-h-[40px] sm:min-h-[60px] p-1 sm:p-2 cursor-pointer rounded-lg transition-all duration-200
//                   ${!dateObj.isCurrentMonth ? 'text-gray-400 bg-gray-50' : 'text-gray-900 hover:bg-blue-50'}
//                   ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
//                   ${isTodayDate ? 'bg-blue-100 font-bold' : ''}
//                   ${hasAppointments(dateObj.date) ? 'bg-green-50 border border-green-200' : ''}
//                 `}
//                 onClick={() => handleDateClick(dateObj)}
//               >
//                 <div className="text-center">
//                   <span className={`text-sm font-medium ${isTodayDate ? 'text-blue-700' : ''}`}>
//                     {dateObj.day}
//                   </span>
//                 </div>

//                 {/* Appointment Indicators */}
//                 {dayAppointments.length > 0 && (
//                   <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
//                     {dayAppointments.slice(0, 3).map((apt, i) => (
//                       <div
//                         key={i}
//                         className={`w-1.5 h-1.5 rounded-full ${
//                           apt.status === 'confirmed' ? 'bg-green-500' :
//                           apt.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
//                         }`}
//                         title={apt.title}
//                       />
//                     ))}
//                     {dayAppointments.length > 3 && (
//                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title={`+${dayAppointments.length - 3} more`} />
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Selected Date Details */}
//         {selectedDate && (
//           <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-semibold text-gray-900">
//                 {selectedDate.toLocaleDateString('en-US', {
//                   weekday: 'long',
//                   year: 'numeric',
//                   month: 'long',
//                   day: 'numeric'
//                 })}
//               </h3>
//               {onAddAppointment && (
//                 <button
//                   onClick={() => onAddAppointment(selectedDate)}
//                   className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
//                 >
//                   <Plus className="h-4 w-4" />
//                   <span>Add</span>
//                 </button>
//               )}
//             </div>

//             {(() => {
//               const dayAppointments = getAppointmentsForDate(selectedDate);
//               if (dayAppointments.length > 0) {
//                 return (
//                   <div className="space-y-2">
//                     {dayAppointments.map((appointment, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
//                         onClick={() => onAppointmentClick && onAppointmentClick(appointment)}
//                       >
//                         <div className="flex items-center space-x-3">
//                           <div className={`w-3 h-3 rounded-full ${
//                             appointment.status === 'confirmed' ? 'bg-green-500' :
//                             appointment.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
//                           }`} />
//                           <div>
//                             <p className="font-medium text-gray-900 text-sm">{appointment.title}</p>
//                             <p className="text-xs text-gray-600">{appointment.time}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <span className={`text-xs px-2 py-1 rounded-full font-medium ${
//                             appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
//                             appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
//                           }`}>
//                             {appointment.status}
//                           </span>
//                           <Edit3 className="h-4 w-4 text-gray-400" />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 );
//               } else {
//                 return (
//                   <div className="text-center py-4">
//                     <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
//                     <p className="text-gray-600 text-sm">No appointments scheduled</p>
//                     <p className="text-gray-500 text-xs mt-1">Use voice assistant to schedule</p>
//                   </div>
//                 );
//               }
//             })()}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Main App Component
// const AppointmentBookingApp = () => {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [appointments, setAppointments] = useState([
//     { id: 1, date: '2025-07-08', time: '10:00 AM', title: 'Team Meeting', status: 'confirmed', description: 'Weekly team sync' },
//     { id: 2, date: '2025-07-12', time: '2:30 PM', title: 'Client Consultation', status: 'pending', description: 'New client onboarding' },
//     { id: 3, date: '2025-07-15', time: '9:00 AM', title: 'Project Review', status: 'confirmed', description: 'Q2 project evaluation' },
//     { id: 4, date: '2025-07-08', time: '3:00 PM', title: 'Design Review', status: 'confirmed', description: 'UI/UX review session' },
//     { id: 5, date: '2025-07-20', time: '11:00 AM', title: 'Training Session', status: 'pending', description: 'Technical training' }
//   ]);
//   const [openDialogBox, setOpenDialogBox] = useState(false);

//   // Mock Redux integration
//   const dispatch = useAppDispatch();
//   const userDetails = useAppSelector(
//     (state) => state.vapiCustomerData.userDetails
//   );

//   // Handle Fetch User data
//   const handleFetchUserData = () => {
//     console.log('Fetching user data after call...');
//     // dispatch(fetchUserData());
//   };

//   // Update appointments when userDetails changes
//   useEffect(() => {
//     if (userDetails?.dateAndTime) {
//       const newAppointment = {
//         id: Date.now(),
//         date: new Date(userDetails.dateAndTime).toISOString().split('T')[0],
//         time: new Date(userDetails.dateAndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         title: userDetails.title || 'Voice Appointment',
//         status: 'pending',
//         description: 'Scheduled via voice assistant'
//       };

//       setAppointments(prev => [...prev, newAppointment]);
//       setOpenDialogBox(true);
//     }
//   }, [userDetails]);

//   const handleDateSelect = (date) => {
//     setSelectedDate(date);
//   };

//   const handleAppointmentClick = (appointment) => {
//     console.log('Appointment clicked:', appointment);
//   };

//   const handleAddAppointment = (date) => {
//     console.log('Add appointment for:', date);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="bg-blue-600 p-2 rounded-lg">
//                 <Calendar className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">AI Voice Scheduler</h1>
//                 <p className="text-sm text-gray-600">Voice-powered appointment booking</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2 text-sm text-gray-600">
//                 <User className="h-4 w-4" />
//                 <span>John Doe</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//           {/* Calendar Section */}
//           <div className="lg:col-span-2">
//             <CalendarComponent
//               appointments={appointments}
//               onDateSelect={handleDateSelect}
//               onAppointmentClick={handleAppointmentClick}
//               onAddAppointment={handleAddAppointment}
//               selectedDate={selectedDate}
//               className="h-full"
//             />
//           </div>

//           {/* AI Voice Assistant Section */}
//           <div className="lg:col-span-1">
//             <AIVoiceAssistant
//               handleFetchUserData={handleFetchUserData}
//               className="h-[700px]"
//             />
//           </div>
//         </div>

//         {/* Stats Dashboard */}
//         <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//             <div className="flex items-center space-x-3">
//               <div className="bg-green-100 p-2 rounded-lg">
//                 <CheckCircle className="h-5 w-5 text-green-600" />
//               </div>
//               <div>
//                 <p className="font-medium text-gray-900">Confirmed</p>
//                 <p className="text-sm text-gray-600">{appointments.filter(apt => apt.status === 'confirmed').length} appointments</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//             <div className="flex items-center space-x-3">
//               <div className="bg-yellow-100 p-2 rounded-lg">
//                 <Clock className="h-5 w-5 text-yellow-600" />
//               </div>
//               <div>
//                 <p className="font-medium text-gray-900">Pending</p>
//                 <p className="text-sm text-gray-600">{appointments.filter(apt => apt.status === 'pending').length} appointments</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//             <div className="flex items-center space-x-3">
//               <div className="bg-blue-100 p-2 rounded-lg">
//                 <Calendar className="h-5 w-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="font-medium text-gray-900">Total</p>
//                 <p className="text-sm text-gray-600">{appointments.length} appointments</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//             <div className="flex items-center space-x-3">
//               <div className="bg-purple-100 p-2 rounded-lg">
//                 <Mic className="h-5 w-5 text-purple-600" />
//               </div>
//               <div>
//                 <p className="font-medium text-gray-900">Voice AI</p>
//                 <p className="text-sm text-gray-600">Always listening</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Success Dialog */}
//       {openDialogBox && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
//             <div className="text-center">
//               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <CheckCircle className="h-8 w-8 text-green-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointment Scheduled!</h3>
//               <p className="text-gray-600 mb-4">Your appointment has been successfully scheduled via voice assistant.</p>
//               <button
//                 onClick={() => setOpenDialogBox(false)}
//                 className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Got it
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AppointmentBookingApp;
