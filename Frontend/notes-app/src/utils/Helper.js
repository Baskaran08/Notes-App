export const validateEmail=(email)=>{
    const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export const generateInitials=(name)=>{

    let intials="";

    if(!name){
        return "";
    }

    const words=name.split(" ");

    for(let i=0;i<Math.min(words.length,2);i++){
        intials+=words[i][0];
    }

    return intials.toUpperCase();


}