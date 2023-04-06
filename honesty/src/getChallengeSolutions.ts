import { userSchema } from "./schema";

// user.completedChallenges.find(el => el.id === "")?.solution,

export const getChallengeSolutions = (cert: string, user: userSchema) => {
  switch (cert) {
    case "isFrontEndCert":
      return [
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eddfaeb5bd0f"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eddfaeb5bd17"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eddfaeb5bd10"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eddfaeb5bd1f"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eddfaeb5bd18"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eddfaeb5bd19"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eedfaeb5bd1c"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eddfaeb5bd1c"
        )?.solution,
      ];
    case "is2018DataVisCert":
      return [
        user.completedChallenges.find(
          (el) => el.id === "bd7168d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7178d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7188d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d7fa6367417b2b2512bbf"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d7fa6367417b2b2512bc0"
        )?.solution,
      ];
    case "isBackEndCert":
      return [
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443edefaeb5bdef"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443edefaeb5bdff"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443edefaeb5bd0e"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443edefaeb5bdee"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443edefaeb5bd0f"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443eddfaeb5bdef"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443eddfaeb5bdff"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443eddfaeb5bd0e"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443eddfaeb5bd0f"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443eddfaeb5bdee"
        )?.solution,
      ];
    case "isRespWebDesignCert":
      return [
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eddfaeb5bd18"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d78af367417b2b2512b03"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d78af367417b2b2512b04"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d78b0367417b2b2512b05"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c242eddfaeb5bd13"
        )?.solution,
      ];
    case "isDataVisCert":
      return [
        user.completedChallenges.find(
          (el) => el.id === "bd7157d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7156d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7155d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7154d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7153d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7168d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7178d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7188d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7198d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7108d8c242eddfaeb5bd13"
        )?.solution,
      ];
    case "isFrontEndLibsCert":
      return [
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7157d8c242eddfaeb5bd13"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d7dbc367417b2b2512bae"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eddfaeb5bd17"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c442eddfaeb5bd0f"
        )?.solution,
      ];
    case "isJsAlgoDataStructCert":
      return ["This must be manually audited :)"];
    case "isApisMicroservicesCert":
      return [
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443edefaeb5bdef"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443edefaeb5bdff"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443edefaeb5bd0e"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5a8b073d06fa14fcfde687aa"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "bd7158d8c443edefaeb5bd0f"
        )?.solution,
      ];
    case "isInfosecQaCert":
      return [
        user.completedChallenges.find(
          (el) => el.id === "587d8249367417b2b2512c41"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d8249367417b2b2512c42"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d824a367417b2b2512c43"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d824a367417b2b2512c44"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d824a367417b2b2512c45"
        )?.solution,
      ];
    case "isQaCertV7":
      return [
        user.completedChallenges.find(
          (el) => el.id === "587d8249367417b2b2512c41"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d8249367417b2b2512c42"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d824a367417b2b2512c43"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e601bf95ac9d0ecd8b94afd"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e601c0d5ac9d0ecd8b94afe"
        )?.solution,
      ];
    case "isInfosecCertV7":
      return [
        user.completedChallenges.find(
          (el) => el.id === "587d824a367417b2b2512c44"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "587d824a367417b2b2512c45"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e46f979ac417301a38fb932"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e46f983ac417301a38fb933"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e601c775ac9d0ecd8b94aff"
        )?.solution,
      ];
    case "isSciCompPyCertV7":
      return [
        user.completedChallenges.find(
          (el) => el.id === "5e44412c903586ffb414c94c"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e444136903586ffb414c94d"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e44413e903586ffb414c94e"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e444147903586ffb414c94f"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e44414f903586ffb414c950"
        )?.solution,
      ];
    case "isDataAnalysisPyCertV7":
      return [
        user.completedChallenges.find(
          (el) => el.id === "5e46f7e5ac417301a38fb928"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e46f7e5ac417301a38fb929"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e46f7f8ac417301a38fb92a"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e46f802ac417301a38fb92b"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e4f5c4b570f7e3a4949899f"
        )?.solution,
      ];
    case "isMachineLearningPyCertV7":
      return [
        user.completedChallenges.find(
          (el) => el.id === "5e46f8d6ac417301a38fb92d"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e46f8dcac417301a38fb92e"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e46f8e3ac417301a38fb92f"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e46f8edac417301a38fb930"
        )?.solution,
        user.completedChallenges.find(
          (el) => el.id === "5e46f8edac417301a38fb931"
        )?.solution,
      ];
    default:
      console.error(`Invalid cert ${cert}`);
      return ["unknown"];
  }
};
