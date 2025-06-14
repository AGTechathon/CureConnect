import { ALL_DOCTORS_REQUEST, ALL_DOCTORS_SUCCESS, ALL_DOCTORS_FAIL, CLEAR_ERRORS } from "../constants/appointmentConstants";

export const allDoctorsReducer = (state = { doctors: [] }, action) => {
    switch (action.type) {
        case ALL_DOCTORS_REQUEST:
            return {
                loading: true
            }

        case ALL_DOCTORS_SUCCESS:
            return {
                loading: false,
                doctors: action.payload,
            }

        case ALL_DOCTORS_FAIL:
            return {
                loading: false,
                error: action.payload,
            }

        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            }

        default:
            return state;
    }
}