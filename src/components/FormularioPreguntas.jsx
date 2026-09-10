import { useState, useEffect } from "react";
import CuentaAtras from "./CuentaAtras";
import Pregunta from "./Pregunta";
import { postAnswer } from "../client/api";
import ModalTransicionPregunta from "./ModalTransicionPregunta";

const FormularioPreguntas = ({
  studentId,
  quizId,
  questions,
  quizTime,
  onFinishForm,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [question, setQuestion] = useState("");
  const [questionImage, setQuestionImage] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [key, setKey] = useState(0);
  const [showModalTransicion, setShowModalTransicion] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [respuestaGuardada, setRespuestaGuardada] = useState(false);

  const handleSendResponse = async () => {
    if (respuestaGuardada) return;
    await postAnswer({
      student_id: studentId,
      quiz_id: quizId,
      question_id: currentQuestion.id,
      selected_option: selectedOptionId,
      is_correct: selectedOptionId === currentQuestion.correct_option,
    });
    setRespuestaGuardada(true);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setKey((prevKey) => prevKey + 1);
      setIsLastQuestion(false);
      setShowModalTransicion(true);
    } else {
      setCurrentQuestionIndex(null);
      setIsLastQuestion(true);
      setShowModalTransicion(true);
    }
  };

  const handleSelectedOption = (optionId) => {
    setSelectedOptionId(optionId);
  };

  const handleFinishTime = () => {
    handleSendResponse();
  };

  const handleFinTransicion = () => {
    setShowModalTransicion(false);
    if (isLastQuestion) {
      onFinishForm();
    }
  };

  useEffect(() => {
    setCurrentQuestion(
      currentQuestionIndex >= 0 ? questions[currentQuestionIndex] : null,
    );
    setSelectedOptionId(null);
    setRespuestaGuardada(false);
  }, [questions, currentQuestionIndex]);

  useEffect(() => {
    if (currentQuestion) {
      setQuestion(currentQuestion.question_text);
      setQuestionImage(currentQuestion.question_image_url || "");
      setOptions(
        [
          {
            id: 1,
            text: currentQuestion.option_1_text,
            imageUrl: currentQuestion.option_1_image_url,
          },
          {
            id: 2,
            text: currentQuestion.option_2_text,
            imageUrl: currentQuestion.option_2_image_url,
          },
          {
            id: 3,
            text: currentQuestion.option_3_text,
            imageUrl: currentQuestion.option_3_image_url,
          },
          {
            id: 4,
            text: currentQuestion.option_4_text,
            imageUrl: currentQuestion.option_4_image_url,
          },
        ].filter((opc) => opc.text || opc.imageUrl),
      );
    } else {
      setQuestion("");
      setQuestionImage("");
      setOptions([]);
    }
  }, [currentQuestion]);

  useEffect(() => {
    setTotalQuestions(questions.length);
  }, [questions]);

  return (
    <>
      {!showModalTransicion && !isLastQuestion ? (
        <div className="flex min-h-[60vh] flex-col gap-8 rounded-xl bg-indigo-950/50 p-8 shadow-xl backdrop-blur-sm">
          <div className="flex w-full items-center justify-between rounded-lg bg-indigo-900/20 px-6 py-4">
            <div className="flex items-center gap-3">
              <p className="text-lg text-indigo-200">
                Pregunta{" "}
                <span className="font-semibold text-indigo-300">
                  {currentQuestionIndex + 1}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-indigo-300">
                  {totalQuestions}
                </span>
              </p>
            </div>
            <CuentaAtras
              key={key}
              seconds={quizTime}
              onTimeFinish={handleFinishTime}
            />
          </div>

          <div className="flex w-full flex-col items-center gap-6">
            <Pregunta
              question={question}
              questionImage={questionImage}
              options={options}
              onSelect={handleSelectedOption}
              selectedOptionId={selectedOptionId}
            />
            <button
              type="button"
              onClick={handleSendResponse}
              className="group relative w-fit overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:cursor-pointer hover:from-indigo-600 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={selectedOptionId == null}
            >
              <span className="relative z-10">Enviar respuesta</span>
              <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-indigo-600 to-indigo-700 transition-transform duration-200 group-hover:translate-x-0"></div>
            </button>
          </div>
        </div>
      ) : (
        <ModalTransicionPregunta
          onFinish={handleFinTransicion}
          isLast={isLastQuestion}
        />
      )}
    </>
  );
};

export default FormularioPreguntas;
