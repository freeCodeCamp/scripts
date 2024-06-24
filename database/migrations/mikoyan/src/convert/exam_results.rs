use mongodb::bson::Bson;
use serde::Deserialize;

use crate::record::ExamResults;

struct ExamResultsVisitor;

impl<'de> serde::de::Visitor<'de> for ExamResultsVisitor {
    type Value = ExamResults;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("struct ExamResults")
    }

    fn visit_map<A>(self, mut map: A) -> Result<Self::Value, A::Error>
    where
        A: serde::de::MapAccess<'de>,
    {
        let mut exam_time_in_seconds = None;
        let mut number_of_correct_answers = None;
        let mut number_of_questions_in_exam = None;
        let mut passed = None;
        let mut passing_percent = None;
        let mut percent_correct = None;

        while let Some(key) = map.next_key::<String>()? {
            match key.as_str() {
                "examTimeInSeconds" => {
                    if exam_time_in_seconds.is_some() {
                        return Err(serde::de::Error::duplicate_field("examTimeInSeconds"));
                    }

                    exam_time_in_seconds = match map.next_value()? {
                        Bson::Int32(v) => Some(v),
                        Bson::Int64(v) => Some(v as i32),
                        Bson::Double(v) => Some(v as i32),
                        _ => None,
                    };
                }
                "numberOfCorrectAnswers" => {
                    if number_of_correct_answers.is_some() {
                        return Err(serde::de::Error::duplicate_field("numberOfCorrectAnswers"));
                    }

                    number_of_correct_answers = match map.next_value()? {
                        Bson::Int32(v) => Some(v),
                        Bson::Int64(v) => Some(v as i32),
                        Bson::Double(v) => Some(v as i32),
                        _ => None,
                    };
                }
                "numberOfQuestionsInExam" => {
                    if number_of_questions_in_exam.is_some() {
                        return Err(serde::de::Error::duplicate_field("numberOfQuestionsInExam"));
                    }

                    number_of_questions_in_exam = match map.next_value()? {
                        Bson::Int32(v) => Some(v),
                        Bson::Int64(v) => Some(v as i32),
                        Bson::Double(v) => Some(v as i32),
                        _ => None,
                    };
                }
                "passed" => {
                    if passed.is_some() {
                        return Err(serde::de::Error::duplicate_field("passed"));
                    }

                    passed = match map.next_value()? {
                        Bson::Boolean(v) => Some(v),
                        _ => None,
                    };
                }
                "passingPercent" => {
                    if passing_percent.is_some() {
                        return Err(serde::de::Error::duplicate_field("passingPercent"));
                    }

                    passing_percent = match map.next_value()? {
                        Bson::Double(v) => Some(v),
                        Bson::Int32(v) => Some(v as f64),
                        Bson::Int64(v) => Some(v as f64),
                        _ => None,
                    };
                }
                "percentCorrect" => {
                    if percent_correct.is_some() {
                        return Err(serde::de::Error::duplicate_field("percentCorrect"));
                    }

                    percent_correct = match map.next_value()? {
                        Bson::Double(v) => Some(v),
                        Bson::Int32(v) => Some(v as f64),
                        Bson::Int64(v) => Some(v as f64),
                        _ => None,
                    };
                }
                _ => {
                    // println!("Skipping {key:?}");
                }
            }
        }

        let exam_time_in_seconds = exam_time_in_seconds.unwrap_or_default();
        let number_of_correct_answers = number_of_correct_answers.unwrap_or_default();
        let number_of_questions_in_exam = number_of_questions_in_exam.unwrap_or_default();
        let passed = passed.unwrap_or_default();
        let passing_percent = passing_percent.unwrap_or_default();
        let percent_correct = percent_correct.unwrap_or_default();

        Ok(ExamResults {
            exam_time_in_seconds,
            number_of_correct_answers,
            number_of_questions_in_exam,
            passed,
            passing_percent,
            percent_correct,
        })
    }
}

impl<'de> Deserialize<'de> for ExamResults {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_any(ExamResultsVisitor)
    }
}
