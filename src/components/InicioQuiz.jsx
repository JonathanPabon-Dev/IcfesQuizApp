import { useState, useEffect, useRef } from "react";
import { getQuizzes, getResults, getStudentById } from "../client/api";
import Swal from "sweetalert2";

const InicioQuiz = ({ onStartQuiz }) => {
  const [quizId, setQuizId] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [gradeLevel, setGradeLevel] = useState(null);
  const [quizzesList, setQuizzesList] = useState([]);
  const [showStudentMsg, setShowStudentMsg] = useState(false);
  const [showQuizzesMsg, setShowQuizzesMsg] = useState(false);
  const studentIdRef = useRef(null);

  const LimpiarTodo = () => {
    setQuizId("");
    setStudentName("");
    setGradeLevel(null);
    setQuizzesList([]);
    setShowStudentMsg(false);
    setShowQuizzesMsg(false);
  };

  const ObtenerInfoEstudiante = async () => {
    const student = await getStudentById(studentId);
    if (student.length > 0) {
      setStudentName(
        `${student[0].first_name}${student[0].second_name ? " " + student[0].second_name : ""} ${student[0].first_lastname}${student[0].second_lastname ? " " + student[0].second_lastname : ""}`,
      );
      setGradeLevel(student[0].grade_level);
    } else {
      setShowStudentMsg(true);
    }
  };

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

  const handleBlur = () => {
    setShowStudentMsg(false);
    LimpiarTodo();
    if (studentId !== null && studentId !== "") {
      ObtenerInfoEstudiante();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    if (gradeLevel !== null) {
      ObtenerQuices(gradeLevel);
    } else {
      setQuizzesList([]);
    }
  }, [gradeLevel]);

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
            onBlur={handleBlur}
            required
          />
          {showStudentMsg && (
            <p className="mt-2 w-full text-red-500">El estudiante no existe</p>
          )}
          {studentName && (
            <p className="mt-2 w-full rounded-lg border-2 border-indigo-500/30 bg-indigo-500/30 px-4 py-3 text-indigo-100 shadow-inner">
              {studentName}
            </p>
          )}
        </div>
        {showQuizzesMsg && (
          <p className="mt-2 w-full text-red-500">No hay quices disponibles</p>
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
      </form>
    </div>
  );
};

export default InicioQuiz;
