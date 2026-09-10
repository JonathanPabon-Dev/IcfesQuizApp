const Pregunta = ({
  question,
  questionImage = "",
  options,
  onSelect,
  selectedOptionId,
}) => {
  const handleSelectOption = (id) => {
    onSelect(id);
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="w-full rounded-xl bg-indigo-900/30 p-6 shadow-lg backdrop-blur-sm">
        <p className="text-center text-lg text-indigo-100">{question}</p>
        {questionImage && (
          <img
            src={questionImage}
            alt="Imagen de la pregunta"
            className="mx-auto mt-4 max-h-56 rounded-lg object-contain"
          />
        )}
      </div>
      <div className="grid w-full grid-cols-2 gap-4">
        {options.map((opc, idx) => (
          <button
            key={opc.id || idx}
            type="button"
            className={`group relative overflow-hidden rounded-xl border-2 p-4 text-center transition-all duration-200 hover:cursor-pointer ${
              selectedOptionId === opc.id
                ? "border-indigo-400 bg-indigo-500/20 text-indigo-200"
                : "border-indigo-500/30 bg-indigo-950/50 text-indigo-300 hover:border-indigo-500/50 hover:bg-indigo-900/20"
            }`}
            onClick={() => handleSelectOption(opc.id)}
          >
            <span className="relative z-10">{opc.text || opc}</span>
            {opc.imageUrl && (
              <img
                src={opc.imageUrl}
                alt={`Opción ${opc.id}`}
                className="mx-auto mt-2 max-h-40 rounded-lg object-contain"
              />
            )}
            {selectedOptionId === opc.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Pregunta;
