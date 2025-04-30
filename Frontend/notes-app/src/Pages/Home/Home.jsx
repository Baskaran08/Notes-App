import React, { useEffect, useState } from 'react'
import Navbar from '../../Components/Navbar'
import NoteCard from '../../Components/Cards/NoteCard'
import { MdAdd } from 'react-icons/md'
import AddEditNotes from './AddEditNotes'
import Modal from "react-modal";
import { useNavigate } from 'react-router-dom'
import axiosInstance from "../../utils/axiosInstance"
import Toaster from '../../Components/Toaster/Toaster'
import EmptyCard from '../../Components/EmptyCard/EmptyCard'
import No_Notes from "../../assets/images/No_Notes.svg"
import No_Data from "../../assets/images/No_Data.svg"



const Home = () => {

  const [openAddEditModal, setOpenAddEditModal]=useState(
	{
		isShown:false,
		type:"add",
		data:null
	}
  )

  const [userInfo,setUserInfo]=useState(null)
  const [allNotes,setAllNotes]=useState([])

  const [isSearch,setIsSearch]=useState(false)

  const [showToastMsg,setShowToastMsg]=useState({
	isShown:false,
	message:"",
	type:"add"
  })

  const navigate=useNavigate()

  const handleEdit=(noteDetails)=>{
	setOpenAddEditModal({
		isShown:true, data:noteDetails,type:"edit"
	})
  }

  //toast msg

  const showToastMessage=(message,type)=>{
	setShowToastMsg({
		isShown:true,
		message,
		type
	})
  }

  const handleCloseToast=()=>{
	setShowToastMsg({
		isShown:false,
		message:""
	})
  }


  //get user info

  const getUserInfo=async ()=>{
	try{
		const response=await axiosInstance.get("/get-user")

		if(response.data && response.data.user){
			setUserInfo(response.data.user)
		}
	}
	catch(error){

		if(error.response.status==401){
			localStorage.clear()
			navigate("/login")
		}
	}
  }

  // get all notes

  const getAllNotes=async ()=>{
	try{
		const response = await axiosInstance.get("/get-all-notes")

		if(response.data && response.data.notes){
			setAllNotes(response.data.notes)
		}
	}
	catch(error){
		console.log("An Unexpected error occured. please try again!")
	}
  }

  useEffect(()=>{
	getAllNotes()
	getUserInfo()
  },[])


  //delete note

  const deleteNote=async(data)=>{
	const noteId=data._id

	try{

		const response=await axiosInstance.delete("/delete-note/"+noteId)

		if(response.data && !response.data.error){
			showToastMessage("Note Deleted Successfully","delete")
			getAllNotes()
			onClose()
		}
	}
	catch(error){
		if(error.response && error.response.data && error.response.data.message){
			console.log("An unexpected error occurred. Please try again")
		}
	}

  }

  //search notes

  const onSearchNote=async (query)=>{
	try{
		const response=await axiosInstance.get("/search-notes",{
			params:{query}
		})
		
		if(response.data && response.data.notes){
			setIsSearch(true)
			setAllNotes(response.data.notes)
		}
	}catch(error){
		console.log(error);
	}
  }

  const handleClearSearch=()=>{
	setIsSearch(false);
	getAllNotes()
  }

  //updata pinneded note

  const updatePinned=async (noteData)=>{

	const noteId=noteData._id

	try{

		const response=await axiosInstance.put("/update-note-pinned/"+noteId,{
			"isPinned":!noteData.isPinned
		})

		if(response.data && response.data.note){
			showToastMessage("Note Updated Successfully")
			getAllNotes()
			onClose()
		}
	}
	catch(error){
		console.log(error)
	}
  }

  return (

    <>
      <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch} />

      <div className='container mx-auto'>
        {allNotes.length>0 ? <div className='grid grid-cols-3 gap-4 mt-8'>
			{
				allNotes.map((item)=>(
					<NoteCard key={item._id}
						title={item.title}
						date={item.createdOn}
						content={item.content}
						tags={item.tags}
						isPinned={item.isPinned}
						onEdit={()=>{handleEdit(item)}}
						onDelete={()=>{deleteNote(item)}}
						onPinNote={()=>{updatePinned(item)}}
					/>
				))
			}
        
        </div>: <EmptyCard imgSrc={isSearch?No_Data:No_Notes}
					 message={isSearch?"Oops! No notes found matching your search.":"Start creating your first note! Click the 'Add' button to note down your thoughts, ideas, and reminders. Let's get started!"}/>}
      </div>

	  

	  <Modal
	  isOpen={openAddEditModal.isShown}
	  onRequestClose={()=>{}}
	  style={{
		overlay:{
			backgroundColor:"rgba(0,0,0,0.2)",
		}
	  }}
	  contentLabel=''
	  className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 "
	  >
	  	<AddEditNotes 
		type={openAddEditModal.type}
		noteData={openAddEditModal.data}
		onClose={()=>{
			setOpenAddEditModal({isShown:false,type:"add",data:null})
		}}
		getAllNotes={getAllNotes}
		showToastMessage={showToastMessage}
		/>
	  </Modal>

	  
	  <button 
	  className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10'
	  onClick={()=>{
		setOpenAddEditModal({isShown:true,type:"add",data:null})
	  }}>
		<MdAdd className='text-[32px] text-white' />
	  </button>


	  <Toaster 
	  	isShown={showToastMsg.isShown}
		message={showToastMsg.message}
	  	type={showToastMsg.type}
		onClose={handleCloseToast}
	  />


    </>
  )
}

export default Home