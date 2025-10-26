import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Login from './Pages/Login/Login.jsx'
import Register from './Pages/Register/Register.jsx'
import ProtectedRoutes from './utils/ProtectedRoutes.jsx'
import Home from './Pages/Home/Home.jsx'
import Status from './Pages/Status/Status.jsx'


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/Register' element={<Register/>}/>

        {/*Protected Routes*/}
        <Route element={<ProtectedRoutes/>}>
           <Route path='/' element={<Home/>}/>
           <Route path='/status' element={<Status/>}/>
        </Route>
      </Routes>
    </Router>
  )
}

export default App