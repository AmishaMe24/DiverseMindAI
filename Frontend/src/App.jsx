import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom'

import Homepage from './pages/Homepage'
import MainLayout from './layout/MainLayout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import NotfoundPage from './pages/NotfoundPage'
const route = createBrowserRouter(
  createRoutesFromElements(
    /*parent route for MainLayput*/
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Homepage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route path="*" element={<NotfoundPage />} />
    </Route>
  )
)

const App = () => {
  return <RouterProvider router={route} />
}
export default App
