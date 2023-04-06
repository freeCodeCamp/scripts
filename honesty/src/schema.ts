import { Document, ObjectId } from "mongodb";

export interface userSchema extends Document {
    email: string;
    emailVerified: boolean;
    externalId: string;
    unsubscribeId: string;
    progressTimestamps: number[];
    isBanned: boolean;
    isCheater: boolean;
    username: string;
    acceptedPrivacyTerms: boolean;
    currentChallengeId: string;
    isHonest: boolean;
    isFrontEndCert: boolean;
    isDataVisCert: boolean;
    isBackEndCert: boolean;
    isFullStackCert: boolean;
    isRespWebDesignCert: boolean;
    is2018DataVisCert: boolean;
    isFrontEndLibsCert: boolean;
    isJsAlgoDataStructCert: boolean;
    isApisMicroservicesCert: boolean;
    isInfosecQaCert: boolean;
    isQaCertV7: boolean;
    isInfosecCertV7: boolean;
    is2018FullStackCert: boolean;
    isSciCompPyCertV7: boolean;
    isDataAnalysisPyCertV7: boolean;
    isMachineLearningPyCertV7: boolean;
    completedChallenges: {
        id: string;
        completedDate: number;
        solution: string;
    }[];
}