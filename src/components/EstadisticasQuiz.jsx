import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const EstadisticasQuiz = ({
  questions,
  answers,
  results,
  groupAnswers = [],
  groupResults = [],
  onVolverInicio,
}) => {
  // Puntuación del intento actual y del grupo
  const averageScore = results?.score ?? 0;
  const groupAverageScore = groupResults.length
    ? groupResults.reduce((acc, curr) => acc + (curr.score ?? 0), 0) /
      groupResults.length
    : 0;

  // Construir opciones y selección del usuario por pregunta
  const getOptionStats = (questionIndex) => {
    const q = questions[questionIndex];
    if (!q) return [];
    const selectedOptionId = answers?.[questionIndex]?.selected_option ?? null;
    const options = [
      { id: 1, text: q.option_1_text },
      { id: 2, text: q.option_2_text },
      { id: 3, text: q.option_3_text },
      { id: 4, text: q.option_4_text },
    ];
    // Estadística individual (tu selección)
    const userStats = options.map((opt) => ({
      option: opt.text,
      count: selectedOptionId === opt.id ? 1 : 0,
      percentage: selectedOptionId === opt.id ? 100 : 0,
    }));
    const selectedText =
      options.find((o) => o.id === selectedOptionId)?.text || "Sin respuesta";
    // Estadística del grupo por opción
    const groupByQuestion = groupAnswers.filter((a) => a.question_id === q.id);
    const totalGroup = groupByQuestion.length || 1;
    const groupStats = options.map((opt) => {
      const count = groupByQuestion.filter(
        (a) => a.selected_option === opt.id,
      ).length;
      return {
        option: opt.text,
        count,
        percentage: (count / totalGroup) * 100,
      };
    });
    return { userStats, groupStats, selectedText };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          color: "#ffffff",
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.toFixed(1)}%`,
        },
      },
    },
  };

  return (
    <div className="w-full max-w-4xl">
      <h2 className="mb-6 text-2xl font-bold text-indigo-100">
        Resumen Estadístico
      </h2>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-indigo-950/50 p-4 shadow">
          <h3 className="mb-2 text-lg font-semibold">Datos Generales</h3>
          <p className="text-indigo-300">
            Puntuación personal:{" "}
            <span className="text-3xl font-bold">
              {Number(averageScore).toFixed(1)}%
            </span>
          </p>
          <p className="text-indigo-300">
            Promedio del grupo:{" "}
            <span className="text-3xl font-bold">
              {Number(groupAverageScore).toFixed(1)}%
            </span>
          </p>
        </div>
      </div>
      <div className="space-y-8">
        {questions.map((question, qIndex) => {
          const { groupStats, selectedText } = getOptionStats(qIndex);
          const labels = [
            question.option_1_text,
            question.option_2_text,
            question.option_3_text,
            question.option_4_text,
          ];
          const chartData = {
            labels,
            datasets: [
              {
                label: "Grupo",
                data: groupStats.map((s) => s.percentage),
                backgroundColor: [
                  "rgba(54, 162, 235, 0.6)",
                  "rgba(75, 192, 192, 0.6)",
                  "rgba(255, 206, 86, 0.6)",
                  "rgba(255, 99, 132, 0.6)",
                ],
                borderColor: [
                  "rgba(54, 162, 235, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(255, 99, 132, 1)",
                ],
                borderWidth: 1,
              },
            ],
          };
          return (
            <div
              key={question.id}
              className="rounded-lg bg-indigo-950/50 p-6 shadow"
            >
              <h3 className="mb-4 text-lg font-semibold">
                Pregunta {qIndex + 1}: {question.question_text}
              </h3>
              <div className="mb-3 text-sm text-indigo-300">
                <span className="font-medium">Tu respuesta:</span>{" "}
                {selectedText}
              </div>
              <div className="flex h-64 w-full items-center justify-center">
                <Pie
                  data={chartData}
                  options={chartOptions}
                  aria-setsize={100}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={onVolverInicio}
          className="overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:cursor-pointer hover:from-indigo-600 hover:to-indigo-700"
        >
          <span className="relative z-10">Inicio</span>
          <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-indigo-600 to-indigo-700 transition-transform duration-200 group-hover:translate-x-0"></div>
        </button>
      </div>
    </div>
  );
};

export default EstadisticasQuiz;
