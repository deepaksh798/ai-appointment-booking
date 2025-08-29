import React from "react";
import { Calendar, MessageCircle, Clock, CheckCircle } from "lucide-react";

const Status: React.FC<any> = ({ appointments }) => {
  console.log("appointments in status-->", appointments);
  
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Confirmed</p>
            <p className="text-sm text-gray-600">
              {
                appointments.filter((apt: any) => apt.status === "confirmed")
                  .length
              }{" "}
              appointments
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-100 p-2 rounded-lg">
            <Clock className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Expired</p>
            <p className="text-sm text-gray-600">
              {
                appointments.filter((apt: any) => apt.status === "expired")
                  .length
              }{" "}
              appointments
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Total</p>
            <p className="text-sm text-gray-600">
              {appointments.length} appointments
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <MessageCircle className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">AI Chat</p>
            <p className="text-sm text-gray-600">Always available</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;
