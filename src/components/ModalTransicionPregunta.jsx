import { useEffect, useRef, useState } from "react";

const ModalTransicionPregunta = ({ onFinish, isLast }) => {
  const [contador, setContador] = useState(3);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    setContador(3);
    const interval = setInterval(() => {
      setContador((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (contador === 0 && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      onFinish();
    }
  }, [contador, onFinish]);

  return (
    <div className="bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="flex min-h-[220px] min-w-[320px] flex-col items-center justify-center rounded-xl bg-indigo-950/90 p-10 shadow-2xl">
        <h2 className="mb-6 animate-pulse text-3xl font-bold text-white">
          {isLast ? "Has terminado" : "Siguiente Pregunta"}
        </h2>
        {!isLast && (
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg className="absolute top-0 left-0" width="96" height="96">
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="#6366f1"
                strokeWidth="10"
                fill="none"
                opacity="0.2"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="#6366f1"
                strokeWidth="10"
                fill="none"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={(2 * Math.PI * 42 * (3 - contador)) / 3}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <span className="z-10 text-5xl font-bold text-indigo-200">
              {Math.max(contador, 1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalTransicionPregunta;
