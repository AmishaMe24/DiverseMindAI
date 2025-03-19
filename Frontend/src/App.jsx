import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom'

import Homepage from './pages/Homepage'
import MainLayout from './layout/MainLayout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotfoundPage from './pages/NotfoundPage'
import Dashboard from './pages/Dashboard'
import Sidebar from './pages/Sidebar'

const route = createBrowserRouter(
  createRoutesFromElements(
    /*parent route for MainLayout*/
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Homepage />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="sidebar" element={<Sidebar />} />
      <Route path="*" element={<NotfoundPage />} />
    </Route>
  )
)

const App = () => {
  return <RouterProvider router={route} />
}
export default App
