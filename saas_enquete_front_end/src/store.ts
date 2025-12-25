import { configureStore, Reducer } from "@reduxjs/toolkit";
import surveyQuestionsReducer, {
  // surveyQuestionsReducer,
  SurveyQuestionsState,
} from "./reducers/surveyQuestions.reducer";

export const store = configureStore({
  reducer: {
    surveyQuestions: surveyQuestionsReducer as Reducer<SurveyQuestionsState>,
  },
  devTools: true,
});

// Types pour le dispatch et le state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// =========================================
// import { configureStore } from "@reduxjs/toolkit";
// import surveyQuestionsReducer from "./reducers/surveyQuestions.reducer";

// export const store = configureStore({
//   reducer: {
//     surveyQuestions: surveyQuestionsReducer,
//   },
//   devTools: true,
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// ===========================
// import { configureStore } from "@reduxjs/toolkit";
// import { surveyQuestionsReducer } from "./reducers/surveyQuestions.reducer";

// export const store = configureStore({
//   reducer: {
//     surveyQuestions: surveyQuestionsReducer,
//   },
//   devTools: process.env.NODE_ENV !== "production",
// });

// // Types utiles (optionnel mais pro)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
