import React, { useState } from 'react'
import Navbar from '../../Components/Navbar'
import {Link, useNavigate} from 'react-router-dom'
import PasswordInput from '../../Components/Input/PasswordInput'
import { validateEmail } from '../../utils/Helper'
import axiosInstance from "../../utils/axiosInstance"

const Login = () => {

  const [Email,SetEmail]=useState("");
  const [Password,SetPassword]=useState("")
  const [Error,SetError]=useState(null)

  const navigate=useNavigate()

  const handleLogin=async (e)=>{
    e.preventDefault();

    if(!validateEmail(Email)){
      SetError("Please enter a valid Email")
      return
    }

    if(!Password){
      SetError("Please enter a Password")
      return
    }
    

    SetError("")

    //Login API call

    try{
      const response=await axiosInstance.post("/login",{
        email:Email,
        password:Password
      })

      if(response.data && response.data.accessToken){
        localStorage.setItem("token",response.data.accessToken);
        navigate("/dashboard")
      }

    }catch(error){
      if(error.response && error.response.data && error.response.data.message){
        SetError(error.response.data.message)
      }
      else{
        SetError("An unexpected error occurred, please try again")
      }
    }
  }

  return (
    <>
      <Navbar />

      <div className='flex items-center justify-center mt-28'>
        <div className='w-96 border rounded bg-white px-7 py-10'>
          <form onSubmit={handleLogin} >
            <h4 className='text-2xl mb-7'>Login</h4>
            <input type="text" value={Email} onChange={(e)=>SetEmail(e.target.value)} name="" id="" placeholder='Email' className='input-box' />
            <PasswordInput value={Password} onChange={(e)=>SetPassword(e.target.value)}/>

            {Error && <p className='text-red-500 text-xs pb-1'>{Error}</p>}

            <button type="submit" className='btn-primary'>Login</button>
            <p className='text-sm text-center mt-4'>Not registered yet?{" "}<Link to="/signup" className='font-medium text-primary underline'>Create an Account</Link></p>
          </form>
        </div>
      </div>

    </>
    
  )
}

export default Login