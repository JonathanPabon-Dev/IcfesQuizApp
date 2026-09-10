import supabase from "../supabase/supabaseClient";

export const getQuestions = async (quizId, limit = null) => {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("questions(*)")
    .eq("quiz_id", quizId);
  if (error) {
    console.error("Error al obtener las preguntas.", error);
    return [];
  }
  const questions = (data || []).map((row) => row.questions).filter(Boolean);
  // Fisher-Yates shuffle: every quiz load picks a different random order.
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  // limit = configured question_count; null/0 = keep all (shuffled).
  return limit ? questions.slice(0, limit) : questions;
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

export const getQuizzesByCourse = async (courseId) => {
  const { data, error } = await supabase
    .from("quiz_courses")
    .select("quiz_id, quizzes(id, topic, duration_seconds, question_count)")
    .eq("course_id", courseId);
  if (error) {
    console.error("Error al obtener los quizzes del curso.", error);
    return [];
  }
  return (data || []).map((row) => row.quizzes).filter(Boolean);
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
