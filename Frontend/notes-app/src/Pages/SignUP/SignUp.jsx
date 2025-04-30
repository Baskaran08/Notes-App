import React, { useState } from 'react'
import { validateEmail } from '../../utils/Helper';
import PasswordInput from '../../Components/Input/PasswordInput';
import {Link,useNavigate} from 'react-router-dom'
import Navbar from '../../Components/Navbar'
import axiosInstance from "../../utils/axiosInstance"



const SignUp = () => {

  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");

  const navigate=useNavigate()

  async function handleSignUp(e){

    e.preventDefault();

    if(!name){
      setError("Please enter a name")
      return
    }

    if(!validateEmail(email)){
      setError("Please enter a valid email")
      return
    }

    if(!password){
      setError("Please enter a password")
      return
    }

    setError("")

    //Sign up Api

    try{
      const response=await axiosInstance.post("/create-account",{
        fullName:name,
        email:email,
        password:password
      })

      if(response.data && response.data.error){
        setError(response.data.message)
      }

      if(response.data && response.data.accessToken){
        localStorage.setItem("token",response.data.accessToken);
        navigate("/dashboard")
      }

    }catch(error){
      if(error.response && error.response.data && error.response.data.message){
        setError(error.response.data.message)
      }
      else{
        setError("An unexpected error occurred, please try again")
      }
    }

  }

  return (
    <>
      <Navbar />

      <div className='flex items-center justify-center mt-28'>
        <div className='w-96 border rounded bg-white px-7 py-10'>
          <form onSubmit={handleSignUp} >
            <h4 className='text-2xl mb-7'>Sign Up</h4>
            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} name="name" placeholder='Name' className='input-box' />
            <input type="text" value={email} onChange={(e)=>setEmail(e.target.value)} name="email"  placeholder='Email' className='input-box' />
            <PasswordInput value={password} onChange={(e)=>setPassword(e.target.value)}/>

            {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}

            <button type="submit" className='btn-primary'>Create Account</button>
            <p className='text-sm text-center mt-4'>Already registered?{" "}<Link to="/login" className='font-medium text-primary underline'>Login</Link></p>
          </form>
        </div>
      </div>
    </>

  )
}

export default SignUp