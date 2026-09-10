import supabase from "../supabase/supabaseClient";

export const getParameters = async (parameter) => {
  const { data, error } = await supabase
    .from("parameters")
    .select()
    .eq("name", parameter);
  if (error) {
    console.error("Error al obtener las preguntas.", error);
    return null;
  }
  return data[0];
};

export const getQuestions = async (quizId) => {
  const { data, error } = await supabase
    .from("questions")
    .select()
    .eq("quiz_id", quizId);
  if (error) {
    console.error("Error al obtener las preguntas.", error);
    return null;
  }
  return data;
};

export const getAnswers = async (quizId = "", studentId = null) => {
  let query = supabase.from("answers").select();
  if (quizId !== "") {
    query = query.eq("quiz_id", quizId);
  }
  if (studentId !== null) {
    query = query.eq("student_id", studentId);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Error al obtener las respuestas.", error);
    return null;
  }
  return data;
};

export const postAnswer = async (answer) => {
  const { error } = await supabase.from("answers").insert(answer);
  if (error) {
    console.error("Error al agregar la respuesta.", error);
    return null;
  }
};

export const getResults = async (quizId = "", studentId = null) => {
  let query = supabase.from("quiz_results").select();
  if (quizId !== "") {
    query = query.eq("quiz_id", quizId);
  }
  if (studentId !== null) {
    query = query.eq("student_id", studentId);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Error al obtener los resultados del quiz.", error);
    return null;
  }
  return data;
};

export const postResults = async (result) => {
  const { error } = await supabase.from("quiz_results").insert(result);
  if (error) {
    console.error("Error al agregar los resultados del quiz.", error);
    return null;
  }
};

export const getQuizzes = async (grade_level) => {
  const date = new Date().toISOString().split("T")[0];
  let query = supabase
    .from("quizzes")
    .select()
    .lte("available_since", date)
    .eq("grade_level", grade_level);
  query = query.or(`available_until.is.null,available_until.gte.${date}`);

  const { data, error } = await query;
  if (error) {
    console.error("Error al obtener el listado de quices.", error);
    return null;
  }
  return data;
};

export const loginStudent = async (code, password) => {
  try {
    const { data, error } = await supabase.rpc("login_student", {
      p_code: Number(code),
      p_password: password,
    });
    if (error) {
      console.error("Error al validar las credenciales.", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error al validar las credenciales.", error);
    return null;
  }
};
