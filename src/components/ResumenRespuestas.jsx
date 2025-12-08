const ResumenRespuestas = ({ answers, questions, results }) => {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <p className="text-center text-2xl font-bold text-indigo-300">
        Puntuación:{" "}
        <span
          className={results.score >= 60 ? "text-green-200" : "text-red-200"}
        >
          {results.score}%
        </span>
      </p>
      <div className="rounded-lg bg-indigo-900/20 px-6">
        <div className="space-y-4">
          {answers.map((answer, index) => {
            const preguntaOriginal = questions && questions[index];
            console.log("po", preguntaOriginal);
            const esCorrecta = answer.is_correct;
            console.log("ec", esCorrecta);
            const opcionSeleccionada = answer.selected_option;
            console.log("os", opcionSeleccionada);
            const textoSeleccionado =
              opcionSeleccionada !== null
                ? preguntaOriginal[`option_${opcionSeleccionada}_text`]
                : "";
            console.log("ts", textoSeleccionado);
            const opcionCorrecta = preguntaOriginal.correct_option;
            console.log("oc", opcionCorrecta);
            const textoCorrecto =
              preguntaOriginal[`option_${opcionCorrecta}_text`];
            console.log("tc", textoCorrecto);

            return (
              <div
                key={index}
                className="rounded-lg border border-indigo-500/30 bg-indigo-950/50 p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-indigo-500/50"
              >
                <h3 className="text-lg font-medium text-indigo-200">
                  Pregunta {index + 1}
                </h3>
                <p className="mt-1 text-indigo-100">{answer.question}</p>
                <div className="mt-4 rounded-md bg-indigo-500/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="mr-2 font-medium text-indigo-300">
                      Tu respuesta:
                    </span>
                    <span
                      className={`flex-1 ${esCorrecta ? "text-green-200" : "text-red-200"} font-semibold`}
                    >
                      {textoSeleccionado}
                    </span>
                    {esCorrecta ? (
                      <svg
                        className="ml-2 h-6 w-6 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="ml-2 h-6 w-6 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                {!esCorrecta && (
                  <div className="mt-4 rounded-md bg-indigo-500/10 p-3">
                    <div className="flex items-center justify-between">
                      <span className="mr-2 font-medium text-indigo-300">
                        Respuesta correcta:
                      </span>
                      <span className={`flex-1 font-semibold text-green-200`}>
                        {textoCorrecto}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResumenRespuestas;
