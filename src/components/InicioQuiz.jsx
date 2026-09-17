import { useState, useEffect } from "react";
import { getQuizzesByCourse, getResults } from "../client/api";

// Authenticated phase of the quiz home. The app no longer has a login
// screen: the parent (Cuestionario) only renders this component when a
// valid QmkAdminPanel session was hydrated. Without a session it renders
// null and the parent redirects to the panel.
const InicioQuiz = ({ session, onLogout, onStartQuiz, onViewResult }) => {
  const studentId = session?.studentId ?? null;
  const studentName = session?.studentName ?? "";
  const courseId = session?.courseId ?? null;

  const [pendientes, setPendientes] = useState([]);
  const [presentados, setPresentados] = useState([]);

  useEffect(() => {
    if (courseId === null || studentId === null) {
      return;
    }
    const loadQuizzes = async () => {
      const [quizzes, results] = await Promise.all([
        getQuizzesByCourse(courseId),
        getResults("", studentId),
      ]);

      const resultByQuiz = {};
      if (results) {
        results.forEach((r) => {
          const existing = resultByQuiz[r.quiz_id];
          if (
            !existing ||
            new Date(r.date_taken) > new Date(existing.date_taken)
          ) {
            resultByQuiz[r.quiz_id] = {
              score: r.score,
              date_taken: r.date_taken,
            };
          }
        });
      }

      const pend = [];
      const pres = [];
      quizzes.forEach((quiz) => {
        if (resultByQuiz[quiz.id]) {
          pres.push({ ...quiz, result: resultByQuiz[quiz.id] });
        } else {
          pend.push(quiz);
        }
      });

      setPendientes(pend);
      setPresentados(pres);
    };
    loadQuizzes();
  }, [courseId, studentId]);

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 rounded-xl bg-indigo-950/50 p-8 shadow-xl backdrop-blur-sm">
      <div className="text-center">
        <h1 className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
          Bienvenido
        </h1>
        <p className="mt-2 text-indigo-200">
          Prepárate para poner a prueba tus conocimientos
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex w-full items-center justify-between rounded-lg border-2 border-indigo-500/30 bg-indigo-500/30 px-4 py-3 shadow-inner">
          {studentName && <p className="text-indigo-100">{studentName}</p>}
          <button
            type="button"
            onClick={onLogout}
            className="ml-4 shrink-0 rounded-lg border border-indigo-400/40 px-3 py-1 text-sm font-medium text-indigo-200 transition-colors duration-200 hover:border-indigo-400 hover:bg-indigo-400/20 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="w-full">
          <h2 className="mb-3 text-lg font-medium text-indigo-300">
            Pendientes
          </h2>
          {pendientes.length === 0 ? (
            <p className="text-sm text-indigo-400">
              No tienes quizzes pendientes
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {pendientes.map((quiz) => (
                <li
                  key={quiz.id}
                  className="flex items-center justify-between rounded-lg border-2 border-indigo-500/30 bg-indigo-950/50 px-4 py-3 shadow-inner"
                >
                  <div className="flex flex-col">
                    <span className="text-indigo-100">{quiz.topic}</span>
                    <span className="text-xs text-indigo-400">
                      {quiz.duration_seconds != null
                        ? `${quiz.duration_seconds} s`
                        : "Sin límite"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onStartQuiz(
                        quiz.id,
                        studentId,
                        studentName,
                        quiz.duration_seconds,
                        quiz.question_count,
                      )
                    }
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:cursor-pointer hover:from-indigo-600 hover:to-indigo-700"
                  >
                    <span className="relative z-10">Iniciar quiz</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full">
          <h2 className="mb-3 text-lg font-medium text-indigo-300">
            Presentados
          </h2>
          {presentados.length === 0 ? (
            <p className="text-sm text-indigo-400">
              Aún no has presentado quizzes
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {presentados.map((quiz) => (
                <li
                  key={quiz.id}
                  className="flex items-center justify-between rounded-lg border-2 border-indigo-500/30 bg-indigo-950/50 px-4 py-3 shadow-inner"
                >
                  <div className="flex flex-col">
                    <span className="text-indigo-100">{quiz.topic}</span>
                    <span className="text-sm text-indigo-400">
                      Resultado: {Math.round(quiz.result.score)}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onViewResult(quiz.id)}
                    className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:cursor-pointer hover:from-indigo-600 hover:to-indigo-700"
                  >
                    <span className="relative z-10">Ver resultado</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default InicioQuiz;