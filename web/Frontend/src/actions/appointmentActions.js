import { ALL_DOCTORS_REQUEST, ALL_DOCTORS_SUCCESS, ALL_DOCTORS_FAIL } from "../constants/appointmentConstants";
import axios from '../axios';

export const allDoctors = () => async (dispatch) => {
    try {
        dispatch({ type: ALL_DOCTORS_REQUEST });
        const { data } = await axios.get('/doctors')

        dispatch({ type: ALL_DOCTORS_SUCCESS, payload: data.doctors })
    } catch (error) {
        dispatch({
            type: ALL_DOCTORS_FAIL,
            payload: error.response.data.message
        })
    }
}