import { Survey } from "../services/surveyService";
import { Section } from "../services/sectionService";
import { Question } from "../services/questionService";
import { AnyAction } from "@reduxjs/toolkit";

/* ======================
   STATE
====================== */
export interface SurveyQuestionsState {
  survey: Survey | null;
  sections: Section[];
  questions: Question[];
  loading: boolean;
}

/* ======================
   ÉTAT INITIAL
====================== */
export const initialSurveyQuestionsState: SurveyQuestionsState = {
  survey: null,
  sections: [],
  questions: [],
  loading: false,
};

/* ======================
   REDUCER
====================== */
const surveyQuestionsReducer = (
  state: SurveyQuestionsState = initialSurveyQuestionsState,
  action: AnyAction
): SurveyQuestionsState => {
  switch (action.type) {
    // case "LOAD_SUCCESS":
    //   return {
    //     ...state,
    //     survey: action.payload.survey,
    //     sections: action.payload.sections,
    //     questions: action.payload.questions,
    //     loading: false,
    //   };
    case "LOAD_SUCCESS":
      // ✅ éviter les doublons côté client
      const sectionsMap = new Map<string, Section>();
      action.payload.sections.forEach((s: Section) => sectionsMap.set(s.id, s));
      return {
        ...state,
        survey: action.payload.survey,
        sections: Array.from(sectionsMap.values()),
        questions: action.payload.questions,
        loading: false,
      };

    /* ======================
       SECTIONS
    ====================== */
    case "SET_SECTIONS":
      return {
        ...state,
        sections: action.payload,
      };

    /* ======================
       QUESTIONS
    ====================== */
    case "ADD_QUESTION":
      return {
        ...state,
        questions: [...state.questions, action.payload],
      };

    case "UPDATE_QUESTION":
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.payload.id ? { ...q, ...action.payload.data } : q
        ),
      };

    case "DELETE_QUESTION":
      return {
        ...state,
        questions: state.questions.filter((q) => q.id !== action.payload),
      };

    case "REORDER_QUESTIONS":
      return {
        ...state,
        questions: action.payload.map((q: Question) => ({
          ...q,
        })),
      };

    default:
      return state;
  }
};

export default surveyQuestionsReducer;

// =======================================TRES BON sans section
// import { Survey } from "../services/surveyService";
// import { Section } from "../services/sectionService";
// import { Question } from "../services/questionService";
// import { AnyAction } from "@reduxjs/toolkit";

// /* ======================
//    STATE
// ====================== */
// export interface SurveyQuestionsState {
//   survey: Survey | null;
//   sections: Section[];
//   questions: Question[];
//   loading: boolean;
// }

// /* ======================
//    ÉTAT INITIAL
// ====================== */
// export const initialSurveyQuestionsState: SurveyQuestionsState = {
//   survey: null,
//   sections: [],
//   questions: [],
//   loading: false,
// };

// /* ======================
//    REDUCER
// ====================== */
// const surveyQuestionsReducer = (
//   state: SurveyQuestionsState = initialSurveyQuestionsState,
//   action: AnyAction
// ): SurveyQuestionsState => {
//   switch (action.type) {
//     case "LOAD_SUCCESS":
//       return {
//         ...state,
//         survey: action.payload.survey,
//         sections: action.payload.sections,
//         questions: action.payload.questions,
//         loading: false,
//       };

//     case "ADD_QUESTION":
//       return {
//         ...state,
//         questions: [...state.questions, action.payload],
//       };

//     case "UPDATE_QUESTION":
//       return {
//         ...state,
//         questions: state.questions.map((q) =>
//           q.id === action.payload.id ? { ...q, ...action.payload.data } : q
//         ),
//       };

//     case "DELETE_QUESTION":
//       return {
//         ...state,
//         questions: state.questions.filter((q) => q.id !== action.payload),
//       };

//     case "REORDER_QUESTIONS":
//       return {
//         ...state,
//         questions: action.payload.map((q: Question) => ({
//           ...q,
//         })),
//         // questions: action.payload,
//       };

//     default:
//       return state;
//   }
// };

// export default surveyQuestionsReducer;
// =======================================TRES BON
// import { Survey } from "../services/surveyService";
// import { Section } from "../services/sectionService";
// import { Question } from "../services/questionService";

// /* ======================
//    STATE
// ====================== */
// export interface SurveyQuestionsState {
//   survey: Survey | null;
//   sections: Section[];
//   questions: Question[];
//   loading: boolean;
// }

// /* ======================
//    ÉTAT INITIAL
// ====================== */
// export const initialSurveyQuestionsState: SurveyQuestionsState = {
//   survey: null,
//   sections: [],
//   questions: [],
//   loading: false,
// };

// /* ======================
//    ACTIONS
// ====================== */
// export type SurveyQuestionsAction =
//   | {
//       type: "LOAD_SUCCESS";
//       payload: {
//         survey: Survey;
//         sections: Section[];
//         questions: Question[];
//       };
//     }
//   | { type: "ADD_QUESTION"; payload: Question }
//   | {
//       type: "UPDATE_QUESTION";
//       payload: { id: string; data: Partial<Question> };
//     }
//   | { type: "DELETE_QUESTION"; payload: string }
//   | { type: "REORDER_QUESTIONS"; payload: Question[] };

// /* ======================
//    REDUCER
// ====================== */
// export const surveyQuestionsReducer = (
//   state: SurveyQuestionsState = initialSurveyQuestionsState,
//   action: SurveyQuestionsAction
// ): SurveyQuestionsState => {
//   switch (action.type) {
//     case "LOAD_SUCCESS":
//       return {
//         ...state,
//         survey: action.payload.survey,
//         sections: action.payload.sections,
//         questions: action.payload.questions,
//         loading: false,
//       };

//     case "ADD_QUESTION":
//       return {
//         ...state,
//         questions: [...state.questions, action.payload],
//       };

//     case "UPDATE_QUESTION":
//       return {
//         ...state,
//         questions: state.questions.map((q) =>
//           q.id === action.payload.id ? { ...q, ...action.payload.data } : q
//         ),
//       };

//     case "DELETE_QUESTION":
//       return {
//         ...state,
//         questions: state.questions.filter((q) => q.id !== action.payload),
//       };

//     case "REORDER_QUESTIONS":
//       return {
//         ...state,
//         questions: action.payload,
//       };

//     default:
//       return state;
//   }
// };

// ==========================================bon
// import { Survey } from "../services/surveyService";
// import { Section } from "../services/sectionService";
// import { Question } from "../services/questionService";

// /* ======================
//    STATE
// ====================== */
// export interface SurveyQuestionsState {
//   survey: Survey | null;
//   sections: Section[];
//   questions: Question[];
//   loading: boolean;
// }
// /**
//  * ✅ ÉTAT INITIAL — toujours défini avec le reducer
//  */
// // export const initialSurveyQuestionsState: SurveyQuestionsState = {
// //   questions: [],
// //   sections: [],
// //   loading: false,
// // };

// /* ======================
//    ACTIONS
// ====================== */
// export type SurveyQuestionsAction =
//   | {
//       type: "LOAD_SUCCESS";
//       payload: {
//         survey: Survey;
//         sections: Section[];
//         questions: Question[];
//       };
//     }
//   | { type: "ADD_QUESTION"; payload: Question }
//   | {
//       type: "UPDATE_QUESTION";
//       payload: { id: string; data: Partial<Question> };
//     }
//   | { type: "DELETE_QUESTION"; payload: string }
//   | { type: "REORDER_QUESTIONS"; payload: Question[] };

// /* ======================
//    REDUCER
// ====================== */
// export const surveyQuestionsReducer = (
//   state: SurveyQuestionsState,
//   action: SurveyQuestionsAction
// ): SurveyQuestionsState => {
//   switch (action.type) {
//     case "LOAD_SUCCESS":
//       return {
//         ...state,
//         survey: action.payload.survey,
//         sections: action.payload.sections,
//         questions: action.payload.questions,
//         loading: false,
//       };

//     case "ADD_QUESTION":
//       return {
//         ...state,
//         questions: [...state.questions, action.payload],
//       };

//     case "UPDATE_QUESTION":
//       return {
//         ...state,
//         questions: state.questions.map((q) =>
//           q.id === action.payload.id ? { ...q, ...action.payload.data } : q
//         ),
//       };

//     case "DELETE_QUESTION":
//       return {
//         ...state,
//         questions: state.questions.filter((q) => q.id !== action.payload),
//       };

//     case "REORDER_QUESTIONS":
//       return {
//         ...state,
//         questions: action.payload,
//       };

//     default:
//       return state;
//   }
// };
