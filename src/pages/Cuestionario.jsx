import FormularioPreguntas from "../components/FormularioPreguntas";
import { useEffect, useRef, useState } from "react";
import {
  getQuestions,
  getAnswers,
  getResults,
  postResults,
  getStudentByAuthUid,
} from "../client/api";
import ResumenRespuestas from "../components/ResumenRespuestas";
import InicioQuiz from "../components/InicioQuiz";
import supabase from "../supabase/supabaseClient";

// Tab-scoped opt-out for session hydration. Set when the student logs out of
// this app so a page refresh does not restore the panel session; opening the
// app in a new tab keeps hydration enabled (fresh sessionStorage).
const SKIP_HYDRATION_KEY = "icfes-skip-hydration";

const Cuestionario = () => {
  const [session, setSession] = useState(null);
  const [hydrating, setHydrating] = useState(true);
  const [seconds, setSeconds] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);
  const [name, setName] = useState("");
  const [quizId, setQuizId] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [view, setView] = useState("start");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const finishingRef = useRef(false);

  const handleLogin = (sessionData) => {
    sessionStorage.removeItem(SKIP_HYDRATION_KEY);
    setSession(sessionData);
  };

  const handleLogout = () => {
    sessionStorage.setItem(SKIP_HYDRATION_KEY, "1");
    setSession(null);
    setName("");
    setQuizId("");
    setStudentId(null);
    setSeconds(null);
    setQuestionCount(null);
    setQuestions([]);
    setAnswers([]);
    setResults(null);
    setView("start");
    finishingRef.current = false;
  };

  const goToStart = () => {
    setName("");
    setQuizId("");
    setStudentId(null);
    setSeconds(null);
    setQuestionCount(null);
    setQuestions([]);
    setAnswers([]);
    setResults(null);
    setView("start");
    finishingRef.current = false;
  };

  const ObtenerPreguntas = async () => {
    const questionsTemp = await getQuestions(quizId, questionCount);
    setQuestions(questionsTemp);
  };

  const InsertarResultados = async (answersList) => {
    let correct = 0;
    let score = 0;

    answersList.forEach((item) => {
      if (item.is_correct) {
        correct += 1;
      }
    });
    score = ((correct / answersList.length) * 100).toFixed(2);
    await postResults({
      student_id: studentId,
      quiz_id: quizId,
      score: score,
    });
  };

  const ObtenerResultadosIndividual = async () => {
    const resultsData = await getResults(quizId, studentId);
    setResults(resultsData[0]);
  };

  const handleStartQuiz = async (
    quizIdSelected,
    studentIdInputed,
    studentName,
    quizDuration,
    quizQuestionCount,
  ) => {
    setQuizId(quizIdSelected);
    setStudentId(studentIdInputed);
    setName(studentName);
    setSeconds(quizDuration ?? null);
    setQuestionCount(quizQuestionCount ?? null);
    setView("quiz");
  };

  const handleViewResult = async (quizIdSelected) => {
    const sessionStudentId = session?.studentId ?? studentId;
    setQuizId(quizIdSelected);
    setStudentId(sessionStudentId);
    setName(session?.studentName ?? "");
    const questionsData = await getQuestions(quizIdSelected);
    setQuestions(questionsData);
    const answersData = await getAnswers(quizIdSelected, sessionStudentId);
    setAnswers(answersData);
    const resultsData = await getResults(quizIdSelected, sessionStudentId);
    setResults(resultsData && resultsData.length > 0 ? resultsData[0] : null);
    setView("summary");
  };

  const handleFinishForm = async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    try {
      const answersData = await getAnswers(quizId, studentId);
      setAnswers(answersData);
      await InsertarResultados(answersData);
      await ObtenerResultadosIndividual();
      setView("summary");
    } catch {
      // opcional: manejo de error
    }
  };

  useEffect(() => {
    if (view == "quiz") {
      ObtenerPreguntas();
    }
  }, [view]);

  // Hidratación al arranque: si ya hay una sesión de Supabase Auth (mismo
  // origen github.io y misma BD que el QmkAdminPanel), se resuelve el
  // estudiante vinculado y se restaura la sesión sin pasar por el login.
  // Sin sesión, estudiante nulo o error -> flujo normal (login por código).
  useEffect(() => {
    let active = true;
    if (sessionStorage.getItem(SKIP_HYDRATION_KEY)) {
      setHydrating(false);
      return;
    }
    const hydrateSession = async () => {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getSession();
        if (authError || !authData?.session || !active) return;
        const { data: student, error: studentError } =
          await getStudentByAuthUid();
        if (studentError || !student || !active) return;
        if (active) {
          const name = `${student.first_name}${student.second_name ? " " + student.second_name : ""} ${student.first_lastname}${student.second_lastname ? " " + student.second_lastname : ""}`;
          setSession({
            studentId: student.id,
            studentName: name,
            courseId: student.course_id,
            mustChangePassword: student.must_change_password === true,
          });
        }
      } catch (error) {
        console.error("Error al restaurar la sesión.", error);
      } finally {
        if (active) {
          setHydrating(false);
        }
      }
    };
    hydrateSession();
    return () => {
      active = false;
    };
  }, []);

  if (view === "start") {
    return (
      <div className="m-auto max-w-4xl min-w-3xl rounded-xl bg-indigo-900 p-10">
        {hydrating ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 rounded-xl bg-indigo-950/50 p-8 shadow-xl backdrop-blur-sm">
            <p className="text-lg font-semibold text-indigo-200">
              Cargando…
            </p>
          </div>
        ) : (
          <InicioQuiz
            key={session ? session.studentId : "anon"}
            session={session}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onStartQuiz={handleStartQuiz}
            onViewResult={handleViewResult}
          />
        )}
      </div>
    );
  }

  if (view === "summary") {
    return (
      <div className="m-auto max-w-4xl min-w-3xl rounded-xl bg-indigo-900 p-10">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h2 className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">
              ¡Felicitaciones, {name.split(" ")[0]}!
            </h2>
            <p className="mt-2 text-xl font-bold text-indigo-400">
              Prueba finalizada
            </p>
          </div>
          <ResumenRespuestas
            answers={answers}
            questions={questions}
            results={results}
          />
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={goToStart}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:cursor-pointer hover:from-indigo-600 hover:to-indigo-700"
            >
              <span className="relative z-10">Inicio</span>
              <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-indigo-600 to-indigo-700 transition-transform duration-200 group-hover:translate-x-0"></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-auto max-w-4xl min-w-3xl rounded-xl bg-indigo-900 p-10">
      {questions.length > 0 ? (
        <FormularioPreguntas
          studentId={studentId}
          quizId={quizId}
          questions={questions}
          quizTime={seconds}
          onFinishForm={handleFinishForm}
        />
      ) : (
        <>
          <p className="text-center font-bold">No hay preguntas disponibles.</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={goToStart}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:cursor-pointer hover:from-indigo-600 hover:to-indigo-700"
            >
              <span className="relative z-10">Inicio</span>
              <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-indigo-600 to-indigo-700 transition-transform duration-200 group-hover:translate-x-0"></div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cuestionario;
