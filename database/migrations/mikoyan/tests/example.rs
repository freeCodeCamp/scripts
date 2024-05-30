//! Clears collection 'user' at db 'freecodecamp' at port 27018
//! Create a bunch of users with malformed records
//! Run script
//! Check users are no longer malformed

use std::str::FromStr;

use mongodb::{
    bson::{doc, oid::ObjectId, Bson, DateTime, Document, Timestamp},
    Client, Collection,
};

async fn clear_db(collection: &Collection<Document>) {
    collection.delete_many(doc! {}, None).await.unwrap();
}

async fn create_malformed_users(collection: &Collection<Document>) {
    // Missing fields
    let user_1 = doc! {
        "_id": ObjectId::from_str("5f3f2c4d8f8b9a0b3c9b4a9a").unwrap(),
        "username": "tom",
        "email": "a@freecodecamp.org"
    };
    let user_2 = doc! {
        "_id": ObjectId::from_str("5f3f2c4d8f8b9a0b3c9b4a9b").unwrap(),
        "username": "oliver",
        "email": "b@freecodecamp.org",
        // Fields no longer used
        "badges": [],
        "isGithub": true,
        "isLinkedIn": false,
        "isTwitter": false,
        "isWebsite": false,
        "password": "1234567890",
        "timezone": "America/Los_Angeles",
        // Bad types
        "savedChallenges": [],
        "partiallyCompletedChallenges": [],
        "completedChallenges": [
            Bson::Null,
            Bson::Undefined,
            doc! {
                "files": [
                    doc! {
                        "contents": "console.log('hello world');",
                    }
                ],
                "id": "5a7b3d2e31c2ff3a2c0707e5",
                "completedDate": Bson::Int64(1234567890),
            },
            doc! {
                "id": "5a7b3d2e31c2ff3a2c0707e6",
                "completedDate": Bson::Int64(1234567890),
            }
        ],
        "progressTimestamps": [
            Bson::Null,
            Bson::Undefined,
            Bson::Double(12345.1),
            Bson::Int32(12345),
            Bson::Int64(54321),
            Bson::String("11111".to_string()),
            Bson::Timestamp(Timestamp {time: 1234567890, increment: 1}),
            doc! {
                "timestamp": Bson::Int64(1234567890),
            }
        ],
        "yearsTopContributor": ["2021", Bson::Int32(2022), Bson::Int64(2023), Bson::Undefined, Bson::Null],
        "profileUI": doc! {
            "isLocked": Bson::Null,
            "showAbout": Bson::Null,
            "showCerts": Bson::Null,
            "showDonation": true,
            "showDonation": Bson::Undefined,
            "showHeatMap": Bson::Undefined,
            "showLocation": Bson::Undefined,
            "showName": false,
            "showPoints": Bson::Null,
            "showPortfolio": Bson::Null,
            "showTimeLine": Bson::Null,
        },

    };
    let user_3 = doc! {
        "_id": ObjectId::from_str("5f3f2c4d8f8b9a0b3c9b4a9c").unwrap(),
        "username": "mrugesh",
        "email": "c@freecodecamp.org",
        // What happened here?!
        "completedChallenges": [
            doc! {
                "__cachedRelations": "",
                "__data": "",
                "__dataSource": "",
                "__persisted": "",
                "__strict": ""
            },
            doc! {
                "completedDate": Bson::Int64(1234567890),
                "id": "5a7b3d2e31c2ff3a2c0707e5",
            },
            // Unhandled type. Should log an error to file/stdout
            []

        ],
        "profileUI": doc! {
            "__cachedRelations": "",
            "__data": "",
            "__dataSource": "",
            "__persisted": "",
            "__strict": "",
            "isLocked": true,
            "showAbout": false,
            "showCerts": true,
        },
    };

    let users = vec![user_1, user_2, user_3];

    collection.insert_many(users, None).await.unwrap();
}

/// Run mikoyan binary
async fn run_script() {
    let output = tokio::process::Command::new("cargo")
        .args(&["run", "--", "--uri", "mongodb://localhost:27018"])
        .output()
        .await
        .unwrap();

    assert!(output.status.success());
}

async fn check_users(collection: &Collection<Document>) {
    let user_1 = doc! {
        "_id": ObjectId::from_str("5f3f2c4d8f8b9a0b3c9b4a9a").unwrap(),
        "username": "tom",
        "email": "a@freecodecamp.org",
        "savedChallenges": [],
        "partiallyCompletedChallenges": [],
        "completedChallenges": [],
        "progressTimestamps": [],
        "profileUI": doc! {
            "isLocked": false,
            "showAbout": false,
            "showCerts": false,
            "showDonation": false,
            "showHeatMap": false,
            "showLocation": false,
            "showName": false,
            "showPoints": false,
            "showPortfolio": false,
            "showTimeLine": false,
        }
    };
    let user_2 = doc! {
        "_id": ObjectId::from_str("5f3f2c4d8f8b9a0b3c9b4a9b").unwrap(),
        "username": "oliver",
        "email": "b@freecodecamp.org",
        "savedChallenges": [],
        "partiallyCompletedChallenges": [],
        "completedChallenges": [
            doc! {
                "files": [
                    doc! {
                        "contents": "console.log('hello world');",
                    }
                ],
                "id": "5a7b3d2e31c2ff3a2c0707e5",
                "completedDate": Bson::Int64(1234567890),
            },
            doc! {
                "files": [],
                "id": "5a7b3d2e31c2ff3a2c0707e6",
                "completedDate": Bson::Int64(1234567890),
            }
        ],
        "progressTimestamps": [
            Bson::Double(12345.1),
            Bson::Int32(12345),
            Bson::Int64(54321),
            DateTime::from_millis(123456789),
            Bson::String("11111".to_string()),
            Bson::Timestamp(Timestamp {time: 1234567890, increment: 1}),
            doc! {
                "timestamp": Bson::Int64(1234567890),
            }
        ],
    };
    let user_3 = doc! {
        "_id": ObjectId::from_str("5f3f2c4d8f8b9a0b3c9b4a9c").unwrap(),
        "username": "mrugesh",
        "email": "c@freecodecamp.org"
    };

    // Check all fields match `user_1`, `user_2`, `user_3`
    let db_user_1 = collection
        .find_one(
            doc! {
                "_id": ObjectId::from_str("5f3f2c4d8f8b9a0b3c9b4a9a").unwrap(),
            },
            None,
        )
        .await
        .unwrap()
        .unwrap();
    let db_user_2 = collection
        .find_one(
            doc! {
                "_id": ObjectId::from_str("5f3f2c4d8f8b9a0b3c9b4a9b").unwrap(),
            },
            None,
        )
        .await
        .unwrap()
        .unwrap();
    let db_user_3 = collection
        .find_one(
            doc! {
                "_id": ObjectId::from_str("5f3f2c4d8f8b9a0b3c9b4a9c").unwrap(),
            },
            None,
        )
        .await
        .unwrap()
        .unwrap();

    // Check equality
    assert_eq!(user_1, db_user_1);
    assert_eq!(user_2, db_user_2);
    assert_eq!(user_3, db_user_3);
}

#[tokio::test]
async fn main_test() {
    let client = Client::with_uri_str("mongodb://localhost:27018")
        .await
        .unwrap();
    let db = client.database("freecodecamp");
    let collection = db.collection("user");
    clear_db(&collection).await;
    create_malformed_users(&collection).await;
    run_script().await;
    check_users(&collection).await;
}
