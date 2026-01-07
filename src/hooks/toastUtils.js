import { toast } from "react-toastify";

export const notifySuccess = (msg) =>
    toast.success(msg, { position: "top-right", autoClose: 2000, theme: "light" });

export const notifyError = (msg) =>
    toast.error(msg, { position: "top-right", autoClose: 2000, theme: "light" });
