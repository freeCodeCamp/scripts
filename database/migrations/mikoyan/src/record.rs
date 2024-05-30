use mongodb::{
    self,
    bson::{self, oid::ObjectId, Bson, DateTime, Document},
};
use serde::{Deserialize, Serialize};

#[derive(Debug)]
pub enum NOption<T> {
    Some(T),
    Null,
    Undefined,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    #[serde(rename = "id")]
    pub _id: ObjectId,
    pub about: String,
    pub accepted_privacy_terms: bool,
    pub completed_challenges: Vec<CompletedChallenge>,
    pub completed_exams: Vec<CompletedExam>,
    pub current_challenge_id: String,
    pub donation_emails: Vec<String>,
    pub email: String,
    pub email_auth_link_ttl: NOption<bson::DateTime>,
    pub email_verified: bool,
    pub email_verify_ttl: NOption<bson::DateTime>,
    pub external_id: NOption<String>,
    pub github_profile: String,
    // pub is_2018_data_vis_cert: bool,
    // pub is_2018_full_stack_cert: bool,
    // pub is_apis_microservices_cert: bool,
    // pub is_back_end_cert: bool,
    // pub is_banned: bool,
    // pub is_cheater: bool,
    // pub is_classroom_account: bool,
    // pub is_college_algebra_py_cert_v8: bool,
    // pub is_data_analysis_py_cert_v7: bool,
    // pub is_data_vis_cert: bool,
    // pub is_donating: bool,
    // pub is_foundational_c_sharp_cert_v8: bool,
    // pub is_front_end_cert: bool,
    // pub is_front_end_libs_cert: bool,
    // pub is_full_stack_cert: bool,
    // pub is_honest: bool,
    // pub is_infosec_cert_v7: bool,
    // pub is_infosec_qa_cert: bool,
    // pub is_js_algo_data_struct_cert: bool,
    // pub is_js_algo_data_struct_cert_v8: bool,
    // pub is_machine_learning_py_cert_v7: bool,
    // pub is_qa_cert_v7: bool,
    // pub is_relational_database_cert_v8: bool,
    // pub is_resp_web_design_cert: bool,
    // pub is_sci_comp_py_cert_v7: bool,
    // pub keyboard_shortcuts: bool,
    // pub linkedin: String,
    // pub location: String,
    pub name: String,
    // pub needs_moderation: bool,
    // pub new_email: String,
    // pub partially_completed_challenges: Vec<PartiallyCompletedChallenge>,
    // pub picture: String,
    // pub portfolio: Vec<Portfolio>,
    // pub profile_ui: ProfileUI,
    // pub progress_timestamps: Vec<bson::DateTime>,
    // pub saved_challenges: Vec<SavedChallenge>,
    // pub send_quincy_email: bool,
    // pub theme: String,
    // pub twitter: String,
    // pub unsubscribe_id: String,
    // pub username_display: String,
    // pub website: String,
    // pub years_top_contributor: Vec<i32>,
}

#[derive(Debug, Serialize)]
pub struct CompletedChallenge {
    pub challenge_type: i32,
    pub completed_date: bson::DateTime,
    pub files: Vec<File>,
    pub github_link: NOption<String>,
    pub id: String,
    pub is_manually_approved: NOption<bool>,
    pub solution: NOption<String>,
}

#[derive(Debug, Serialize)]
pub struct CompletedExam {
    pub challenge_type: i32,
    pub completed_date: bson::DateTime,
    pub exam_results: ExamResults,
    pub id: String,
}

#[derive(Debug, Serialize)]
pub struct ExamResults {
    pub exam_time_in_seconds: i32,
    pub number_of_correct_answers: i32,
    pub number_of_questions_in_exam: i32,
    pub passed: bool,
    pub passing_percent: f64,
    pub percent_correct: f64,
}

#[derive(Debug)]
pub struct PartiallyCompletedChallenge {
    pub completed_date: bson::DateTime,
    pub id: String,
}

#[derive(Debug)]
pub struct Portfolio {
    pub description: String,
    pub id: String,
    pub image: String,
    pub title: String,
    pub url: String,
}

#[derive(Debug)]
pub struct ProfileUI {
    pub is_locked: bool,
    pub show_about: bool,
    pub show_certs: bool,
    pub show_donation: bool,
    pub show_heat_map: bool,
    pub show_location: bool,
    pub show_name: bool,
    pub show_points: bool,
    pub show_portfolio: bool,
    pub show_time_line: bool,
}

#[derive(Debug)]
pub struct SavedChallenge {
    pub challenge_type: i32,
    pub files: Vec<File>,
    pub id: String,
    pub last_saved_date: bson::DateTime,
}

#[derive(Debug, Serialize)]
pub struct File {
    pub contents: String,
    pub ext: String,
    pub key: String,
    pub name: String,
    pub path: String,
}
