import React from 'react'
import Home from './Pages/Home/Home'
import {BrowserRouter, createBrowserRouter, Route,Routes} from 'react-router-dom'
import Login from './Pages/Login/Login'
import SignUp from './Pages/SignUp/SignUp'

const App = () => {
  return (
    <>
     <BrowserRouter>
		<Routes>
    <Route path='/' element={<Login/>} />
			<Route path='/dashboard' element={<Home/>} />
			<Route path='/login' element={<Login/>} />
			<Route path='/signup' element={<SignUp/>} />
		</Routes>
     </BrowserRouter>
    
    </>
   
  )
}

export default App