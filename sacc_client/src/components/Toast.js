import { toast } from 'react-toastify';

const showToast = (type, message) => {
    console.log(`Toast type: ${type}, Message: ${message}`);
    switch (type) {
        case "success":
            toast.success(message, {
                position: "top-right",
                autoClose: 3000,
            });
            break;
        case "error":
            toast.error(message, {
                position: "top-right",
                autoClose: 3000,
            });
            break;
        case "info":
            toast.info(message, {
                position: "top-right",
                autoClose: 3000,
            });
            break;
        case "warning":
            toast.warning(message, {
                position: "top-right",
                autoClose: 3000,
            });
            break;
        default:
            toast(message, {
                position: "top-right",
                autoClose: 3000,
            });
    }
};

export default showToast;
