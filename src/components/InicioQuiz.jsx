import { useState, useEffect, useRef } from "react";
import { getQuizzesByCourse, getResults, loginStudent } from "../client/api";

const InicioQuiz = ({ session, onLogin, onLogout, onStartQuiz, onViewResult }) => {
  const [studentId, setStudentId] = useState(session?.studentId ?? null);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(!!session);
  const [studentName, setStudentName] = useState(session?.studentName ?? "");
  const [courseId, setCourseId] = useState(session?.courseId ?? null);
  const [pendientes, setPendientes] = useState([]);
  const [presentados, setPresentados] = useState([]);
  const [showStudentMsg, setShowStudentMsg] = useState(false);
  const studentIdRef = useRef(null);

  const handleInputStudentId = (e) => {
    const newValue = e.target.value;
    if (/^\d*$/.test(newValue) && newValue.length <= 6) {
      setStudentId(e.target.value);
    }
  };

  const handleInputPassword = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    setShowStudentMsg(false);
    if (!studentId || !password) {
      setShowStudentMsg("Ingrese el código y la contraseña");
      return;
    }
    const response = await loginStudent(studentId, password);
    if (!response || Object.keys(response).length === 0) {
      setShowStudentMsg("Código o contraseña incorrectos");
      setPassword("");
      return;
    }
    const name = `${response.first_name}${response.second_name ? " " + response.second_name : ""} ${response.first_lastname}${response.second_lastname ? " " + response.second_lastname : ""}`;
    setStudentName(name);
    setCourseId(response.course_id);
    setAuthenticated(true);
    onLogin({
      studentId: response.id,
      studentName: name,
      courseId: response.course_id,
    });
  };

  useEffect(() => {
    if (authenticated && courseId !== null) {
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
    }
  }, [authenticated, courseId, studentId]);

  useEffect(() => {
    if (!authenticated && studentIdRef.current) {
      studentIdRef.current.focus();
    }
  }, [authenticated]);

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

      {!authenticated ? (
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="w-full">
            <label
              htmlFor="studentId"
              className="mb-2 block text-lg font-medium text-indigo-300"
            >
              Código estudiante
            </label>
            <input
              id="studentId"
              ref={studentIdRef}
              type="search"
              inputMode="numeric"
              pattern="\d*"
              className="w-full rounded-lg border-2 border-indigo-500/30 bg-indigo-950/50 px-4 py-3 text-indigo-100 placeholder-indigo-400 shadow-inner transition-colors duration-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
              value={studentId || ""}
              onChange={handleInputStudentId}
              required
            />
          </div>
          <div className="w-full">
            <label
              htmlFor="password"
              className="mb-2 block text-lg font-medium text-indigo-300"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border-2 border-indigo-500/30 bg-indigo-950/50 px-4 py-3 text-indigo-100 placeholder-indigo-400 shadow-inner transition-colors duration-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
              value={password}
              onChange={handleInputPassword}
              placeholder="Ingrese la contraseña"
              required
            />
          </div>
          <button
            type="button"
            onClick={handleLogin}
            className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:cursor-pointer hover:from-indigo-600 hover:to-indigo-700"
          >
            <span className="relative z-10">Ingresar</span>
            <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-indigo-600 to-indigo-700 transition-transform duration-200 group-hover:translate-x-0"></div>
          </button>
          {showStudentMsg && (
            <p className="mt-2 w-full text-red-500">{showStudentMsg}</p>
          )}
        </div>
      ) : (
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="flex w-full items-center justify-between rounded-lg border-2 border-indigo-500/30 bg-indigo-500/30 px-4 py-3 shadow-inner">
            {studentName && (
              <p className="text-indigo-100">{studentName}</p>
            )}
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
      )}
    </div>
  );
};

export default InicioQuiz;
