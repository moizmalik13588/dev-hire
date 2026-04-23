import { useState, useEffect, useRef } from "react";
import { X, Mic, MicOff, Phone, PhoneOff, Loader } from "lucide-react";
import { RetellWebClient } from "retell-client-js-sdk";
import api from "../services/api";
import toast from "react-hot-toast";

const retellClient = new RetellWebClient();

const InterviewModal = ({ application, onClose, onComplete }) => {
  const [status, setStatus] = useState("idle");
  // idle | connecting | active | ended
  const [transcript, setTranscript] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    // Retell events
    retellClient.on("call_started", () => {
      setStatus("active");
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    });

    retellClient.on("call_ended", () => {
      setStatus("ended");
      clearInterval(timerRef.current);
      onComplete?.();
    });

    retellClient.on("update", (update) => {
      if (update.transcript) {
        setTranscript(update.transcript);
        setTimeout(() => {
          transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    });

    retellClient.on("error", (err) => {
      console.error("Retell error:", err);
      setStatus("idle");
      toast.error("Call error. Please try again.");
    });

    return () => {
      retellClient.stopCall();
      clearInterval(timerRef.current);
    };
  }, []);

  const startInterview = async () => {
    setStatus("connecting");
    try {
      const res = await api.post(`/interview/start/${application.id}`);
      await retellClient.startCall({
        accessToken: res.data.accessToken,
      });
    } catch (err) {
      setStatus("idle");
      toast.error(err.response?.data?.message || "Could not start interview");
    }
  };

  const endInterview = () => {
    retellClient.stopCall();
    setStatus("ended");
    clearInterval(timerRef.current);
  };

  const toggleMute = () => {
    retellClient.mute(!isMuted);
    setIsMuted(!isMuted);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              🎙️
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Voice Interview</h2>
              <p className="text-blue-100 text-xs">{application.job.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {status === "active" && (
              <span className="text-white font-mono text-sm bg-white/20 px-3 py-1 rounded-full">
                {formatTime(duration)}
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status === "active"
                  ? "bg-green-500 animate-pulse"
                  : status === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : status === "ended"
                      ? "bg-gray-400"
                      : "bg-gray-300"
              }`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              {status === "idle" && "Ready to start your interview"}
              {status === "connecting" && "Connecting to interviewer..."}
              {status === "active" && "Interview in progress — speak clearly"}
              {status === "ended" &&
                "Interview complete! Results being processed..."}
            </span>
          </div>
        </div>

        {/* Transcript Area */}
        <div className="h-64 overflow-y-auto p-4 space-y-3 bg-white dark:bg-gray-800">
          {status === "idle" && (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-3">
              <div className="text-5xl">🎤</div>
              <p className="text-sm">
                Alex (AI Interviewer) will greet you first.
              </p>
              <p className="text-xs text-gray-300">
                Make sure your microphone is allowed.
              </p>
            </div>
          )}

          {status === "connecting" && (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <Loader size={32} className="animate-spin text-blue-500" />
                <p className="text-sm">Connecting to Alex...</p>
              </div>
            </div>
          )}

          {status === "ended" && transcript.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
              <div className="text-5xl">✅</div>
              <p className="text-gray-600 dark:text-gray-300 font-semibold">
                Interview Completed!
              </p>
              <p className="text-sm text-gray-400">
                Your score will appear in My Applications shortly.
              </p>
            </div>
          )}

          {transcript.map((line, i) => (
            <div
              key={i}
              className={`flex ${line.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  line.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm"
                }`}
              >
                <p
                  className={`text-xs font-semibold mb-1 ${
                    line.role === "user" ? "text-blue-200" : "text-gray-400"
                  }`}
                >
                  {line.role === "user" ? "You" : "Alex (Interviewer)"}
                </p>
                {line.content}
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>

        {/* Controls */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-4">
          {status === "idle" && (
            <button
              onClick={startInterview}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold text-sm transition-all shadow-lg shadow-blue-200 dark:shadow-none"
            >
              <Phone size={18} /> Start Interview
            </button>
          )}

          {status === "connecting" && (
            <button
              disabled
              className="flex items-center gap-2 bg-gray-300 text-gray-500 px-8 py-3 rounded-full font-semibold text-sm"
            >
              <Loader size={18} className="animate-spin" /> Connecting...
            </button>
          )}

          {status === "active" && (
            <>
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isMuted
                    ? "bg-red-100 text-red-600 border-2 border-red-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                onClick={endInterview}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold text-sm transition-all"
              >
                <PhoneOff size={18} /> End Interview
              </button>
            </>
          )}

          {status === "ended" && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold text-sm"
            >
              ✅ View Results in My Applications
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewModal;
