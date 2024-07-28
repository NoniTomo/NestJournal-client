import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import style from "./style2.module.scss";
import { useLocation } from "react-router-dom";

import { newPassword } from "./validtionSchemas";
import Button from "../components/Button/Button.jsx";
import Field from "../components/Field/Field.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

let defaultValues = {
  password: "",
};

export default function NewPassword() {
  const { handleNewPassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: yupResolver(newPassword),
  });

  const location = useLocation();
  async function handleSubmitForm(data) {
    try {
      const { isItError } = await handleNewPassword({ data, location });
      if (isItError) {
        navigate("../main", { replace: true });
      }
    } catch (error) {
      console.error("Error occurred while signing up:", error);
    }
  }

  return (
    <div
      style={{
        height: "90vh",
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <div className={style.wrapper}>
        <h1
          style={{
            color: "white",
            alignContent: "center",
            textAlign: "center",
            width: "100%",
          }}
        >
          Форма ввода нового пароля
        </h1>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <label>
            <span style={{ color: "white" }}>Новый пароль</span>
            <Field
              name="password"
              register={register}
              autoComplete="off"
              placeholder="Пароль"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              type="password"
            />
          </label>
          <Button disabled={isSubmitting} type="submit">
            Поменять
          </Button>
        </form>
        <div style={{ display: "block" }}>
          <Link
            style={{ color: "white", textDecoration: "none" }}
            to={"/sign-in"}
          >
            Войти в аккаунт
          </Link>
        </div>
      </div>
    </div>
  );
}
