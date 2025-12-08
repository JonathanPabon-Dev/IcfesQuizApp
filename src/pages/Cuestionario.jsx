import FormularioPreguntas from "../components/FormularioPreguntas";
import { useEffect, useRef, useState } from "react";
import {
  getQuestions,
  getAnswers,
  getResults,
  postResults,
  getParameters,
} from "../client/api";
import ResumenRespuestas from "../components/ResumenRespuestas";
import EstadisticasQuiz from "../components/EstadisticasQuiz";
import InicioQuiz from "../components/InicioQuiz";

const Cuestionario = () => {
  const [seconds, setSeconds] = useState(0);
  const [name, setName] = useState("");
  const [quizId, setQuizId] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [view, setView] = useState("start");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [groupAnswers, setGroupAnswers] = useState([]);
  const [groupResults, setGroupResults] = useState([]);
  const finishingRef = useRef(false);

  const establecerValoresInicio = () => {
    setSeconds(0);
    setName("");
    setQuizId("");
    setStudentId(null);
    setView("start");
    setQuestions([]);
    setAnswers([]);
    setResults(null);
    setGroupAnswers([]);
    setGroupResults([]);
    finishingRef.current = false;
  };

  const ObtenerTiempoQuiz = async () => {
    const quizTime = await getParameters("segundosIcfesQuiz");
    setSeconds(quizTime.value);
  };

  const ObtenerPreguntas = async () => {
    const questionsTemp = await getQuestions(quizId);
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
  ) => {
    setQuizId(quizIdSelected);
    setStudentId(studentIdInputed);
    setName(studentName);
    setView("quiz");
  };

  const handleStartView = () => {
    establecerValoresInicio();
  };

  const handleVolverInicio = () => {
    establecerValoresInicio();
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

  const handleStatisticsView = () => {
    setView("statistics");
  };

  useEffect(() => {
    if (view == "quiz") {
      ObtenerTiempoQuiz();
      ObtenerPreguntas();
    }
  }, [view]);

  // Cargar datos globales para comparativa al entrar a statistics
  useEffect(() => {
    const loadGroupData = async () => {
      if (view !== "statistics" || !quizId) return;
      const allAnswers = await getAnswers(quizId);
      const allResults = await getResults(quizId);
      setGroupAnswers(allAnswers || []);
      setGroupResults(allResults || []);
    };
    loadGroupData();
  }, [view, quizId]);

  if (view === "start") {
    return (
      <div className="m-auto max-w-4xl min-w-3xl rounded-xl bg-indigo-900 p-10">
        <InicioQuiz onStartQuiz={handleStartQuiz} />
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
              onClick={handleStartView}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:cursor-pointer hover:from-indigo-600 hover:to-indigo-700"
            >
              <span className="relative z-10">Inicio</span>
              <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-indigo-600 to-indigo-700 transition-transform duration-200 group-hover:translate-x-0"></div>
            </button>
            <button
              onClick={handleStatisticsView}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:cursor-pointer hover:from-indigo-600 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              title="Próximamente"
            >
              Estadísticas
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "statistics") {
    return (
      <div className="m-auto max-w-4xl min-w-3xl rounded-xl bg-indigo-900 p-10">
        <EstadisticasQuiz
          questions={questions}
          results={results}
          answers={answers}
          groupAnswers={groupAnswers}
          groupResults={groupResults}
          onVolverInicio={handleVolverInicio}
        />
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
              onClick={handleStartView}
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
