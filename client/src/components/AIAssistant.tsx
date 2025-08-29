import React, { useState } from "react";
import vapi from "@/lib/vapi";
import { Bot, X, Phone, Mic, PhoneOff, Volume2, VolumeX } from "lucide-react";

type Props = {
  handleOpenCallAssistant: () => void;
  handleFetchUserData: () => void;
};

const AIAssistant = ({
  handleOpenCallAssistant,
  handleFetchUserData,
}: Props) => {
  const [callStatus, setCallStatus] = useState("Disconnected");
  const [callMute, setCallMute] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false); // State to control Lottie animation
  const [isCallActive, setIsCallActive] = useState(false);

  // vapi call
  const handleStartCall = async () => {
    console.log("running handleStartCall");

    try {
      setCallStatus("Connecting...");
      vapi.start("98320828-5a1b-429f-934a-c3335a77225c");
      setCallStatus("Connected");
      vapi.on("call-start", () => {
        setCallStatus("Call Started");
        setIsCallActive(true);
      });
      vapi.on("speech-start", () => {
        setIsSpeaking(true);
      });
      vapi.on("speech-end", () => {
        setIsSpeaking(false);
      });
      vapi.on("call-end", () => {
        setCallStatus("Call Ended");
        setIsSpeaking(false);
        setIsCallActive(false);
        handleFetchUserData();
      });
      vapi.on("message", (message: any) => {
        console.log("messages -->", message.messages);
      });
      vapi.on("error", (e: any) => {
        console.error("VAPI Error:", e);
        setCallStatus("Error");
      });
    } catch (error) {
      console.error("Error starting VAPI call:", error);
      setCallStatus("Error");
    }
  };
  const handleStopCall = () => {
    vapi.stop();
    setCallStatus("Disconnected");
    handleOpenCallAssistant();
  };
  const handleCallMute = () => {
    const newMuteState = !callMute;
    console.log("newMuteState-------------->", newMuteState);

    setCallMute(newMuteState);
    if (newMuteState) {
      vapi.setMuted(false);
    } else {
      vapi.setMuted(true);
    }
  };

  const getStatusColor = () => {
    if (["Call Started", "Connected"].includes(callStatus)) {
      return "border-green-500 text-green-500 bg-green-50";
    } else if (callStatus === "Connecting...") {
      return "border-yellow-500 text-yellow-500 bg-yellow-50";
    } else if (["Disconnected", "Error", "Call Ended"].includes(callStatus)) {
      return "border-red-500 text-red-500 bg-red-50";
    }
    return "border-gray-300 text-gray-600 bg-gray-50";
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg h-full ">
      <div className="p-6 h-full flex flex-col max-h-[800px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                AI Voice Assistant
              </h3>
              <p className="text-sm text-gray-600">
                Book appointments with voice
              </p>
            </div>
          </div>
        </div>

        {/* AI Assistant Avatar */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div
              className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ${
                isSpeaking ? "animate-pulse" : ""
              }`}
            >
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                <Bot className="h-12 w-12 text-blue-600" />
              </div>
            </div>

            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="absolute -inset-2 rounded-full border-4 border-blue-300 animate-ping"></div>
            )}
          </div>

          {/* Status Indicator */}
          <div
            className={`px-4 py-2 rounded-full border-2 flex items-center space-x-2 ${getStatusColor()}`}
          >
            <Phone className="h-4 w-4" />
            <span className="text-sm font-medium">{callStatus}</span>
          </div>

          {/* Instructions */}
          <div className="text-center max-w-sm">
            <p className="text-gray-600 text-sm mb-2">
              {isCallActive
                ? "I'm listening! Tell me about your appointment needs."
                : "Click the microphone to start a voice conversation with your AI assistant."}
            </p>
            <p className="text-gray-500 text-xs">
              Say things like: &quot;Book an appointment for tomorrow at 2
              PM&quot; or &quot;What&apos;s my schedule for this week?&quot;
            </p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4 mt-6">
          {/* Mute Button */}
          <button
            onClick={handleCallMute}
            disabled={!isCallActive}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !isCallActive
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : callMute
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
          >
            {callMute ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </button>

          {/* Main Call Button */}
          <button
            onClick={isCallActive ? handleStopCall : handleStartCall}
            disabled={callStatus === "Connecting..."}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              callStatus === "Connecting..."
                ? "bg-yellow-500 cursor-not-allowed"
                : isCallActive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white shadow-lg`}
          >
            {callStatus === "Connecting..." ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            ) : isCallActive ? (
              <PhoneOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleStopCall}
            disabled={!isCallActive}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              !isCallActive
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 space-y-2">
          <p className="text-xs text-gray-500 text-center">
            Quick voice commands:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
              &quot;Book appointment&quot;
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
              &quot;Check schedule&quot;
            </span>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
              &quot;Cancel meeting&quot;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
