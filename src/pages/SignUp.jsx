import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useContext } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import style from "./style2.module.scss";
import showErrorMessage from "../utils/showErrorMessage.js";

import { signUpSchema } from "./validtionSchemas";
import Button from "../components/Button/Button.jsx";
import Field from "../components/Field/Field.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

let defaultValues = {
  username: "",
  password: "",
};

export default function SignUp() {
  const { handleSignUp } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: yupResolver(signUpSchema),
  });

  async function handleSubmitForm(data) {
    try {
      const { isItError } = await handleSignUp(data);
      if (!isItError) navigate("../main", { replace: true });
    } catch (error) {
      showErrorMessage(error);
    }
  }

  return (
    <div
      style={{
        height: "90vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
          Форма регистрации
        </h1>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <label>
            <span style={{ color: "white" }}>Имя пользователя</span>
            <Field
              name="username"
              register={register}
              autoComplete="off"
              placeholder="Имя пользователя"
              error={Boolean(errors.username)}
              helperText={errors.username?.message}
              type="text"
            />
          </label>
          <label>
            <span style={{ color: "white" }}>Email</span>
            <Field
              name="email"
              register={register}
              autoComplete="off"
              placeholder="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              type="email"
            />
          </label>
          <label>
            <span style={{ color: "white" }}>Пароль</span>
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
            Зарегистрироваться
          </Button>
        </form>
        <div>
          <Link
            style={{ color: "white", textDecoration: "none" }}
            to={"/sign-in"}
          >
            Войти в аккаунт
          </Link>
          <Link
            style={{ float: "right", color: "white", textDecoration: "none" }}
            to={"/reset-password"}
          >
            Забыли пароль
          </Link>
        </div>
      </div>
    </div>
  );
}
