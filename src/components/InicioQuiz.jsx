import { useState, useEffect, useRef } from "react";
import { getQuizzes, getResults, loginStudent } from "../client/api";
import Swal from "sweetalert2";

const InicioQuiz = ({ onStartQuiz }) => {
  const [quizId, setQuizId] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [gradeLevel, setGradeLevel] = useState(null);
  const [quizzesList, setQuizzesList] = useState([]);
  // showStudentMsg: false o el texto del mensaje de error a mostrar
  const [showStudentMsg, setShowStudentMsg] = useState(false);
  const [showQuizzesMsg, setShowQuizzesMsg] = useState(false);
  const studentIdRef = useRef(null);

  const ObtenerQuices = async () => {
    const quizzes = await getQuizzes(gradeLevel);
    if (quizzes.length > 0) {
      setQuizzesList(quizzes);
    } else {
      setShowQuizzesMsg(true);
    }
  };

  const ObtenerIntentoQuiz = async () => {
    const results = await getResults(quizId, studentId);
    return results;
  };

  const ValidaEstadoQuiz = async () => {
    const results = await ObtenerIntentoQuiz();
    return results.length === 0;
  };

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
    setStudentName(
      `${response.first_name}${response.second_name ? " " + response.second_name : ""} ${response.first_lastname}${response.second_lastname ? " " + response.second_lastname : ""}`,
    );
    setGradeLevel(response.grade_level);
    setAuthenticated(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authenticated || quizId === "") {
      return;
    }
    const disponible = await ValidaEstadoQuiz();
    if (!disponible) {
      Swal.fire({
        text: "El quiz ya ha sido realizado",
        icon: "info",
        confirmButtonColor: "#4547ce",
        confirmButtonText: "Cerrar",
      });
      setQuizId("");
      return;
    }
    onStartQuiz(quizId, studentId, studentName);
  };

  useEffect(() => {
    setShowQuizzesMsg(false);
    if (authenticated && gradeLevel !== null) {
      ObtenerQuices();
    } else {
      setQuizzesList([]);
    }
  }, [authenticated, gradeLevel]);

  useEffect(() => {
    if (studentIdRef.current) {
      studentIdRef.current.focus();
    }
  }, []);

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

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col items-center gap-6"
      >
        {!authenticated ? (
          <>
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
          </>
        ) : (
          <>
            {studentName && (
              <p className="w-full rounded-lg border-2 border-indigo-500/30 bg-indigo-500/30 px-4 py-3 text-indigo-100 shadow-inner">
                {studentName}
              </p>
            )}
            {showQuizzesMsg && (
              <p className="mt-2 w-full text-red-500">
                No hay quices disponibles
              </p>
            )}
            {quizzesList.length > 0 && (
              <>
                <div className="w-full">
                  <label
                    htmlFor="quizId"
                    className="mb-2 block text-lg font-medium text-indigo-300"
                  >
                    Seleccione el quiz
                  </label>
                  <select
                    id="quizId"
                    className="w-full rounded-lg border-2 border-indigo-500/30 bg-indigo-950/50 px-4 py-3 text-indigo-100 placeholder-indigo-400 shadow-inner transition-colors duration-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                    value={quizId || ""}
                    onChange={(e) => setQuizId(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      -- Seleccione --
                    </option>
                    {quizzesList.map((quiz) => (
                      <option key={quiz.id} value={quiz.id}>
                        {quiz.topic}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:cursor-pointer hover:from-indigo-600 hover:to-indigo-700"
                >
                  <span className="relative z-10">Iniciar prueba</span>
                  <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-indigo-600 to-indigo-700 transition-transform duration-200 group-hover:translate-x-0"></div>
                </button>
              </>
            )}
          </>
        )}
      </form>
    </div>
  );
};

export default InicioQuiz;