import { enqueueSnackbar } from "notistack";

export default function errorMessage(error) {
  try {
    enqueueSnackbar(
      error?.response?.data?.error ||
        JSON.parse(error?.response?.data?.error)?.errors[0] ||
        "Неопознанная ошибка",
      { variant: "error" }
    );
  } catch (error) {
    enqueueSnackbar("Неопознанная ошибка", { variant: "error" });
  }
}
