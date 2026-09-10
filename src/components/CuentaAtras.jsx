import { useState, useEffect } from "react";

const CuentaAtras = ({ seconds = null, onTimeFinish }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!seconds) {
      return;
    }

    if (timeLeft === 0) {
      const timerId = setTimeout(() => {
        onTimeFinish();
      }, 500);
      return () => clearTimeout(timerId);
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onTimeFinish, seconds]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  if (!seconds) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg ${timeLeft <= 10 ? "bg-red-500/20" : "bg-indigo-500/20"} px-4 py-2`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${timeLeft <= 10 ? "text-red-400" : "text-indigo-400"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clipRule="evenodd"
        />
      </svg>
      <span
        className={`font-mono text-xl font-bold ${timeLeft <= 10 ? "text-red-300" : "text-indigo-300"}`}
      >
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default CuentaAtras;
