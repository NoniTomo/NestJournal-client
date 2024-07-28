import { enqueueSnackbar } from "notistack";

export default function showSuccessMessage(content) {
  try {
    enqueueSnackbar(`${content}`, { variant: "success" });
  } catch (error) {
    enqueueSnackbar("Неопознанная проблема", { variant: "error" });
  }
}
