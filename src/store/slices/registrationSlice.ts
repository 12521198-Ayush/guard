import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type RegistrationState = {
  new_registration_token: string | null;
  mobile: string | null;
};

const initialState: RegistrationState = {
  new_registration_token: null,
  mobile: null,
};

const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {
    setNewRegistrationToken: (state, action: PayloadAction<string>) => {
      state.new_registration_token = action.payload;
    },
    setMobile: (state, action: PayloadAction<string>) => {
      state.mobile = action.payload;
    },
    resetRegistration: () => initialState,
  },
});

export const { setNewRegistrationToken, setMobile, resetRegistration } = registrationSlice.actions;
export default registrationSlice.reducer;
