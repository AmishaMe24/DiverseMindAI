import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";

import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotfoundPage from "./pages/NotfoundPage";
import Dashboard from "./pages/Dashboard";
import LessonPlan from "./pages/LessonPlan";
import QuizMaker from "./pages/QuizMaker";
import IceBreaker from "./pages/IceBreaker";
import Feedback from "./pages/Feedback";

import PublicLayout from "./layout/PublicLayout";
import MainLayout from "./layout/MainLayout";

const route = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>

      {/* Main App Layout with Sidebar */}
      <Route element={<MainLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="lesson-plan" element={<LessonPlan />} />
        <Route path="quiz-maker" element={<QuizMaker />} />
        <Route path="ice-breaker" element={<IceBreaker />} />
        <Route path="feedback" element={<Feedback />} />
      </Route>

      <Route path="*" element={<NotfoundPage />} />
    </>
  )
)

const App = () => {
  return <RouterProvider router={route} />;
};

export default App;
