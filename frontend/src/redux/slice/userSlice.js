import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  currentUser: null,
  error: null,
  loading: null,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true
      state.error = null
    },

    signInSuccess: (state, action) => {
      state.loading = false
      state.currentUser = action.payload
      state.error = null
    },

    signInFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },

    signOutSuccess: (state) => {
      state.currentUser = null
      state.error = null
      state.loading = false
    },

   
    updateProfileImage: (state, action) => {
      if (state.currentUser) {
        state.currentUser.profileImageUrl = action.payload
      }
    },
  },
})

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  signOutSuccess,
  updateProfileImage,
} = userSlice.actions

export default userSlice.reducer
