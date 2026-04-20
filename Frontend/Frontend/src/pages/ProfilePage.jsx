import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import { Mail, MapPin, Trophy, Flame, Star } from "lucide-react";

function ProfilePage() {

  const [profile,setProfile] = useState(null)

  const [formData,setFormData] = useState({
    fullName:"",
    username:"",
    email:"",
    location:"",
    bio:""
  })

  // Dummy Stats
  const stats = {
    totalSolved: 128,
    easy: 70,
    medium: 45,
    hard: 13,
    streak: 15,
    rank: "Top 10%"
  }

  useEffect(()=>{

    const fetchProfile = async ()=>{

      try{

        const res = await axiosClient.get("/user/getProfile")

        const user = res.data.user

        setProfile(user)

        setFormData({
          fullName:user.firstName || "",
          username:user.username || "",
          email:user.emailId || "",
          location:user.location || "",
          bio:user.bio || ""
        })

      }
      catch(err){
        console.log(err)
      }

    }

    fetchProfile()

  },[])


  if(!profile){
    return (
      <div className="text-center text-white mt-20">
        Loading Profile...
      </div>
    )
  }


  return (

    <div className="min-h-screen bg-gray-950 flex justify-center items-center px-6">

      <div className="bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-xl border border-gray-800">

        {/* Avatar */}

        <div className="flex flex-col items-center">

          <img
            src={`https://ui-avatars.com/api/?name=${formData.fullName}&background=random&size=128`}
            className="w-28 h-28 rounded-full border-4 border-orange-500"
          />

          <h2 className="text-2xl font-bold text-white mt-4">
            {formData.fullName}
          </h2>

          <p className="text-gray-400">
            @{formData.username}
          </p>

        </div>


        {/* Email */}

        <div className="mt-6 space-y-3">

          <div className="flex items-center gap-2 text-gray-300">
            <Mail size={16}/>
            {formData.email}
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <MapPin size={16}/>
            {formData.location}
          </div>

        </div>


        {/* Solved Problems */}

        <div className="mt-8">

          <h3 className="text-orange-400 font-semibold mb-3">
            Solved Problems
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center">

            <div className="bg-green-900/20 border border-green-700 p-3 rounded-lg">
              <p className="text-green-400 font-bold text-lg">{stats.easy}</p>
              <p className="text-xs text-gray-400">Easy</p>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-700 p-3 rounded-lg">
              <p className="text-yellow-400 font-bold text-lg">{stats.medium}</p>
              <p className="text-xs text-gray-400">Medium</p>
            </div>

            <div className="bg-red-900/20 border border-red-700 p-3 rounded-lg">
              <p className="text-red-400 font-bold text-lg">{stats.hard}</p>
              <p className="text-xs text-gray-400">Hard</p>
            </div>

          </div>

          <div className="text-center mt-3 text-gray-300">
            Total Solved : <span className="text-white font-semibold">{stats.totalSolved}</span>
          </div>

        </div>


        {/* Extra Attractive Stats */}

        <div className="mt-8 grid grid-cols-2 gap-4">

          <div className="bg-gray-800 p-4 rounded-xl flex items-center gap-3">
            <Flame className="text-orange-400"/>
            <div>
              <p className="text-gray-400 text-sm">Current Streak</p>
              <p className="text-white font-bold">{stats.streak} Days</p>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl flex items-center gap-3">
            <Trophy className="text-yellow-400"/>
            <div>
              <p className="text-gray-400 text-sm">Rank</p>
              <p className="text-white font-bold">{stats.rank}</p>
            </div>
          </div>

        </div>


        {/* Bio */}

        <div className="mt-8">

          <p className="text-gray-400 text-sm mb-1">
            Bio
          </p>

          <p className="text-gray-200">
            {formData.bio || "Passionate developer solving coding problems daily."}
          </p>

        </div>

      </div>

    </div>

  )

}

export default ProfilePage