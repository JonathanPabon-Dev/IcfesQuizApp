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

// Panel de administración (QmkAdminPanel). La app solo es accesible con una
// sesión válida del panel: sin ella se redirige aquí automáticamente.
const QMK_ADMIN_PANEL_URL =
  import.meta.env.VITE_QMK_ADMIN_PANEL_URL ??
  "https://jonathanpabon-dev.github.io/QmkAdminPanel/";

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

  const handleLogout = () => {
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
    // El logout es solo de la app de quizzes: la sesión de Supabase Auth se
    // conserva (es del panel) y la navegación vuelve al QmkAdminPanel.
    window.location.replace(QMK_ADMIN_PANEL_URL);
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

  // Hidratación al arranque: el único acceso a la app es la sesión del
  // QmkAdminPanel (mismo origen github.io y misma BD). Si no hay sesión de
  // Supabase Auth, si la cuenta no tiene estudiante vinculado o si ocurre un
  // error, se redirige automáticamente al panel. No hay opt-out por pestaña:
  // "Cerrar sesión" solo vuelve al panel y el reingreso depende de la sesión.
  useEffect(() => {
    let active = true;

    const redirectToPanel = () => {
      if (active) {
        setHydrating(false);
      }
      window.location.replace(QMK_ADMIN_PANEL_URL);
    };

    const hydrateSession = async () => {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getSession();
        if (authError || !authData?.session) {
          redirectToPanel();
          return;
        }
        const { data: student, error: studentError } =
          await getStudentByAuthUid();
        if (studentError || !student) {
          redirectToPanel();
          return;
        }
        if (active) {
          const name = `${student.first_name}${student.second_name ? " " + student.second_name : ""} ${student.first_lastname}${student.second_lastname ? " " + student.second_lastname : ""}`;
          setSession({
            studentId: student.id,
            studentName: name,
            courseId: student.course_id,
          });
        }
      } catch (error) {
        console.error("Error al restaurar la sesión.", error);
        redirectToPanel();
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
        ) : session ? (
          <InicioQuiz
            key={session.studentId}
            session={session}
            onLogout={handleLogout}
            onStartQuiz={handleStartQuiz}
            onViewResult={handleViewResult}
          />
        ) : (
          // Redirect to the panel is already in progress (no session).
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 rounded-xl bg-indigo-950/50 p-8 shadow-xl backdrop-blur-sm">
            <p className="text-lg font-semibold text-indigo-200">
              Redirigiendo al panel de administración…
            </p>
          </div>
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
