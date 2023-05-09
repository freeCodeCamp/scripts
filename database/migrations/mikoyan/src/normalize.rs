use mongodb::bson::Document;

pub fn normalize_user(user: &mut Document) -> mongodb::error::Result<()> {
    let empty_vec: mongodb::bson::Array = Vec::new();

    if let None = user.get("savedChallenges") {
        user.insert("savedChallenges", empty_vec.clone());
    }

    if let None = user.get("badges") {
        user.insert("badges", empty_vec.clone());
    }

    if let Some(_partially_completed_challenges) = user.get("partiallyCompletedChallenges") {
        // Handle partial challenge format
    } else {
        user.insert("partiallyCompletedChallenges", empty_vec.clone());
    }

    if let Some(_completed_challenges) = user.get("completedChallenges") {
        // Handle completed challenge format
    } else {
        user.insert("completedChallenges", empty_vec.clone());
    }

    if let Some(_progress_timestamps) = user.get("progressTimestamps") {
        // Handle progress timestamps format
    } else {
        user.insert("progressTimestamps", empty_vec.clone());
    }

    if let Some(_years_top_contributor) = user.get("yearsTopContributor") {
        // Handle years top contributor format
    } else {
        user.insert("yearsTopContributor", empty_vec.clone());
    }

    if let Some(_profile_ui) = user.get("profileUI") {
        // Handle profile UI format
    } else {
        user.insert("profileUI", empty_vec.clone());
    }

    Ok(())
}
