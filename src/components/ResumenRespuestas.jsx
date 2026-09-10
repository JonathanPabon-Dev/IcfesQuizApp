const ResumenRespuestas = ({ answers, questions, results }) => {
  const correctCount = (answers || []).filter((a) => a.is_correct).length;
  const totalCount = (questions || []).length;
  const score = results?.score ?? 0;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      <p className="text-center text-2xl font-bold text-indigo-300">
        Puntuación:{" "}
        <span className={score >= 60 ? "text-green-200" : "text-red-200"}>
          {score}%
        </span>
      </p>
      <p className="text-center text-lg text-indigo-200">
        Respondiste correctamente{" "}
        <span className="font-semibold text-indigo-100">{correctCount}</span> de{" "}
        <span className="font-semibold text-indigo-100">{totalCount}</span>{" "}
        preguntas
      </p>
    </div>
  );
};

export default ResumenRespuestas;
