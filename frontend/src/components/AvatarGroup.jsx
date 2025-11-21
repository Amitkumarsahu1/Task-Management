import React from "react"

const AvatarGroup = ({ avatars = [], maxVisible = 3 }) => {
  // 1. Filter out any null, undefined, or empty string entries
  const validAvatars = avatars.filter(url => url && typeof url === 'string');

  return (
    <div className="flex items-center">
      {validAvatars.slice(0, maxVisible).map((avatarUrl, index) => (
        // 2. The filtered array ensures avatarUrl is a valid, non-empty string
        <img
          key={index}
          src={avatarUrl}
          alt={`Avatar-${index + 1}`}
          className="w-10 h-10 rounded-full border-2 border-white -ml-3 first:ml-0 object-cover"
        />
      ))}

      {/* Use the original avatars array length for the 'more' count */}
      {validAvatars.length > maxVisible && (
        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 text-sm font-semibold rounded-full border-2 border-white -ml-3 cursor-default">
          +{validAvatars.length - maxVisible}
        </div>
      )}
    </div>
  )
}

export default AvatarGroup