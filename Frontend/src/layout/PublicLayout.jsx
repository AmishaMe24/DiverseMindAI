import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
const MainLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      {/* <Sidebar /> */}
    </>
  )
}
export default MainLayout
