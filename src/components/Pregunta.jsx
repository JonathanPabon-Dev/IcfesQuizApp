import { useState } from "react";
import ImageModal from "./ImageModal";

const Pregunta = ({
  question,
  questionImage = "",
  options,
  onSelect,
  selectedOptionId,
}) => {
  const [openImage, setOpenImage] = useState(null);

  const handleSelectOption = (id) => {
    onSelect(id);
  };

  const handleOpenImage = (src, alt) => {
    setOpenImage({ src, alt });
  };

  const handleCloseImage = () => {
    setOpenImage(null);
  };

  const hasOptionImages = options.some((opc) => opc.imageUrl);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="w-full rounded-xl bg-indigo-900/30 p-6 shadow-lg backdrop-blur-sm">
        <p className="text-center text-lg text-indigo-100">{question}</p>
        {questionImage && (
          <button
            type="button"
            onClick={() => handleOpenImage(questionImage, "Imagen de la pregunta")}
            className="group relative mt-4 block w-full cursor-zoom-in rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Ampliar imagen de la pregunta"
          >
            <img
              src={questionImage}
              alt="Imagen de la pregunta"
              className="mx-auto max-h-56 rounded-lg object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </button>
        )}
      </div>
      <div
        className={`grid w-full gap-4 ${hasOptionImages ? "grid-cols-1" : "grid-cols-2"}`}
      >
        {options.map((opc, idx) => (
          <div
            key={opc.id || idx}
            role="button"
            tabIndex={0}
            type="button"
            onClick={() => handleSelectOption(opc.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelectOption(opc.id);
              }
            }}
            className={`group relative overflow-hidden rounded-xl border-2 p-4 text-center transition-all duration-200 hover:cursor-pointer ${
              selectedOptionId === opc.id
                ? "border-indigo-400 bg-indigo-500/20 text-indigo-200"
                : "border-indigo-500/30 bg-indigo-950/50 text-indigo-300 hover:border-indigo-500/50 hover:bg-indigo-900/20"
            }`}
          >
            <span className="relative z-10">{opc.text || opc}</span>
            {opc.imageUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenImage(opc.imageUrl, `Imagen de la opción ${opc.id}`);
                }}
                className="mt-2 block w-full cursor-zoom-in rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-label={`Ampliar imagen de la opción ${opc.id}`}
              >
                <img
                  src={opc.imageUrl}
                  alt={`Opción ${opc.id}`}
                  className="mx-auto max-h-56 w-full rounded-lg object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </button>
            )}
            {selectedOptionId === opc.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
            )}
          </div>
        ))}
      </div>
      {openImage && (
        <ImageModal
          src={openImage.src}
          alt={openImage.alt}
          onClose={handleCloseImage}
        />
      )}
    </div>
  );
};

export default Pregunta;