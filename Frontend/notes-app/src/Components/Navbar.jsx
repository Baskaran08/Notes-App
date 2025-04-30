import React, { useState } from 'react'
import ProfileInfo from './Cards/ProfileInfo'
import { useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar/SearchBar';

const Navbar = ({userInfo,onSearchNote,handleClearSearch}) => {

    const [searchQuery,setSearchQuery]=useState("");

    const handleSearch=()=>{
        if(searchQuery){
            onSearchNote(searchQuery)
        }
    }

    const onClearSearch=()=>{
        setSearchQuery("")
        handleClearSearch()
    }

    const navigate=useNavigate();

    const onLogOut=()=>{
        localStorage.clear()
        navigate("/login");
    }

    return (
        <>

            <div className='flex items-center justify-between drop-shadow-2xl bg-white px-6 py-2 '>
                <h1 className='font-medium text-xl py-2 text-black'>Notes</h1>
                <SearchBar 
                 value={searchQuery}
                 onChange={(e)=>{setSearchQuery(e.target.value)}}
                 handleSearch={handleSearch}
                 onClearSearch={onClearSearch}
                 />
                <ProfileInfo userInfo={userInfo} onLogOut={onLogOut}/>
            </div>
        </>

    )
    }

export default Navbar