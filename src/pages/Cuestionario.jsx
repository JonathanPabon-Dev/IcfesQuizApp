import FormularioPreguntas from "../components/FormularioPreguntas";
import { useEffect, useRef, useState } from "react";
import {
  getQuestions,
  getAnswers,
  getResults,
  postResults,
} from "../client/api";
import ResumenRespuestas from "../components/ResumenRespuestas";
import InicioQuiz from "../components/InicioQuiz";

const Cuestionario = () => {
  const [session, setSession] = useState(null);
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
    setSession(sessionData);
  };

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

  if (view === "start") {
    return (
      <div className="m-auto max-w-4xl min-w-3xl rounded-xl bg-indigo-900 p-10">
        <InicioQuiz
          session={session}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onStartQuiz={handleStartQuiz}
          onViewResult={handleViewResult}
        />
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
