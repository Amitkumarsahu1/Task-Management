import React from "react"

const AvatarGroup = ({ avatars = [], maxVisible = 3 }) => {
  
  const validAvatars = avatars.filter(url => url && typeof url === 'string');

  return (
    <div className="flex items-center">
      {validAvatars.slice(0, maxVisible).map((avatarUrl, index) => (
       
        <img
          key={index}
          src={avatarUrl}
          alt={`Avatar-${index + 1}`}
          className="w-10 h-10 rounded-full border-2 border-white -ml-3 first:ml-0 object-cover"
        />
      ))}

     
      {validAvatars.length > maxVisible && (
        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 text-sm font-semibold rounded-full border-2 border-white -ml-3 cursor-default">
          +{validAvatars.length - maxVisible}
        </div>
      )}
    </div>
  )
}

export default AvatarGroup