require('dotenv').config();

const config=require("./config.json");
const mongoose=require("mongoose")

mongoose.connect(config.connectionString).then(()=>{
    console.log("database connected..")
})

const User=require("./models/user.model")
const Note=require("./models/note.model")

const express=require("express");
const cors=require("cors");
const app=express();

const jwt=require("jsonwebtoken")
const {authenticationToken}=require("./utilities")

app.use(express.json())
app.use(cors({
    origin:'*',
}))

app.get("/",(req,res)=>{
    res.json({data:"success"});
})

//create an Account

app.post("/create-account", async (req,res)=>{
    const {fullName,email,password}=req.body;

    if(!fullName){
        return res.status(400).json({error:true,message:"Full Name is Required"});
    }

    if(!email){
        return res.status(400).json({error:true,message:"Email is Required"});
    }

    if(!password){
        return res.status(400).json({error:true,message:"Password is Required"});
    }

    const isUser=await User.findOne({email:email})

    if(isUser){
        return res.json({error:true,message:"User already Exists"});
    }

    const user=new User({fullName,email,password})
    await user.save();

    const accessToken=jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"36000m"})

    return res.json({
        error:false,
        user,
        accessToken,
        message:"Registration Successful"
    })
})

//login

app.post("/login",async (req,res)=>{
    const {email,password}=req.body

    if(!email){
        return res.status(400).json({error:true,message:"Email is Required"});
    }

    if(!password){
        return res.status(400).json({error:true,message:"Password  is Required"});
    }

    const userInfo=await User.findOne({email:email})

    if(!userInfo){
        return res.status(400).json({error:true,message:"User not found"});
    }

    if(userInfo.email==email && userInfo.password==password){
        const user={user:userInfo}
        const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"36000m"})

        return res.json({
            error:false,
            message:"Login Successful",
            email,
            accessToken
        })
    }else{
        return res.status(400).json({
            error:true,
            message:"Invalid Credentials"
        })
    }
})

//Get User

app.get("/get-user",authenticationToken,async (req,res)=>{

    const {user}=req.user;

    const isUser=await User.findOne({_id: user._id})

    if(!isUser){
        return res.sendStatus(401);
    }

    return res.json({
        user:{fullName:isUser.fullName,email:isUser.email,_id:isUser._id,createdOn:isUser.createdOn},
        message:"user details Retrieved!"
    })
})



//Add note

app.post("/add-note",authenticationToken,async (req,res)=>{
    const {title,content,tags}=req.body;
    const {user}=req.user;

    if(!title){
        return res.status(400).json({error:true,message:"Title is Required"});
    }

    if(!content){
        return res.status(400).json({error:true,message:"Content is Required"});
    }

    try{
        const note=new Note({
            title,
            content,
            tags:tags || [],
            userId:user._id
        })

        await note.save();

        return res.json({
            error:false,
            note,message:"Note added successfully"
        })
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Serverr Error"
        })
    }
})

//edit note
app.put("/edit-note/:noteId",authenticationToken,async (req,res)=>{

    const noteId=req.params.noteId;
    const {title,content,tags,isPinned}=req.body;
    const {user}=req.user;

    if(!title && !content && !tags){
        return res.status(400).json({error:true,message:"No changes Provided"})
    }

    try{
        const note=await Note.findOne({_id:noteId,userId:user._id})

        if(title) note.title=title
        if(content) note.content=content
        if(tags) note.tags=tags
        if(isPinned) note.isPinned=isPinned

        await note.save();

        return res.json({
            error:false,
            note,
            message:"Note Updated successfully"
        })
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }
})

//get All Notes 

app.get("/get-all-notes",authenticationToken,async (req,res)=>{

    const {user}=req.user;

    try{
        const notes =await Note.find({userId:user._id}).sort({isPinned:-1})

        return res.json({
            error:false,
            notes,
            message:"All notes retreived successfully"
        })
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal server Error"
        })
    }
})

//delete note

app.delete("/delete-note/:noteId",authenticationToken,async (req,res)=>{

    const noteId=req.params.noteId
    const {user}=req.user

    try{
        const note=await Note.findOne({_id:noteId,userId:user._id})

        if(!note){
            res.status(500).json({error:true,message:"Note not found"
            })
        }

        await Note.deleteOne({_id:noteId,userId:user._id})

        return res.json({
            error:false,
            message:"Note deleted successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            error:true,
            message:"Intenal Server Error"
        })
    }

})


//update pinned note

app.put("/update-note-pinned/:noteId",authenticationToken,async (req,res)=>{

    const noteId=req.params.noteId;
    const {isPinned}=req.body;
    const {user}=req.user;

    try{
        const note=await Note.findOne({_id:noteId,userId:user._id})


        note.isPinned=isPinned

        await note.save();

        return res.json({
            error:false,
            note,
            message:"Note Updated successfully"
        })
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }
})


//search notes

app.get("/search-notes/",authenticationToken,async (req,res)=>{

    const {user}=req.user;
    console.log(req.user)
    const {query}=req.query;
    console.log(req.query)

    if(!query){
        return res.status(400).json({error:true,message:"Search query is required"});
    }

    try{
        const matchingNotes=await Note.find({
            userId:user._id,
            $or:[
                {title:{$regex:new RegExp(query,"i")}},
                {content:{$regex:new RegExp(query,"i")}}
            ]
        })

        return res.json({
            error:false,
            notes:matchingNotes,
            message:"Notes matching the search query retreived successfully"
        })
    }
    catch(error){

        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }

    
})



app.listen(8000,()=>{
    console.log("Server listening to port 8000");
})

module.exports=app;