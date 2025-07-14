import { deleteRequest, getRequest, postRequest } from "./ApiRequest";
import { ENDPOINTS } from "./EndPoints";

//  AUTH API's -------
export const loginApi = (payload: any) => {
  return postRequest(ENDPOINTS.AUTH_LOGIN, payload);
};

export const signupApi = (payload: any) => {
  return postRequest(ENDPOINTS.AUTH_SIGNUP, payload);
};

export const getUserProfile = () => {
  return getRequest(ENDPOINTS.ME);
};

// APOINtMENT API's -------
export const getAppointments = () => {
  return getRequest(ENDPOINTS.GET_APPOINTMENTS);
};

export const getAppointmentById = (appointmentId: string) => {
  return getRequest(`${ENDPOINTS.GET_APPOINTMENTS}/${appointmentId}`);
};

export const bookAppointment = (payload: any) => {
  return postRequest(ENDPOINTS.ADD_APPOINTMENT, payload);
};

export const updateAppointment = (appointmentId: string, payload: any) => {
  return postRequest(`${ENDPOINTS.GET_APPOINTMENTS}/${appointmentId}`, payload);
};

export const deleteAppointment = (appointmentId: string) => {
  return deleteRequest(`${ENDPOINTS.GET_APPOINTMENTS}/${appointmentId}`);
};

// User Detail API's
// export const getProfile = () => {
//   return getRequest(ENDPOINTS.PROFILE);
// };

//channel api's
// export const showChannels = () => {
//   return getRequest(ENDPOINTS.GET_ALL_PROFILES, {});
// };

// export const deleteChannel = (payload: any) => {
//   return postRequest(ENDPOINTS.MANAGE_CHANNEL, payload);
// };

// export const addChannel = (payload: any) => {
//   return postRequest(ENDPOINTS.MANAGE_CHANNEL, payload);
// };
