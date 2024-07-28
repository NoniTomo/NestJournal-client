import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import style from "./style2.module.scss";

import { signInSchema } from "./validtionSchemas";
import Button from "../components/Button/Button.jsx";
import Field from "../components/Field/Field.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

let defaultValues = {
  email: "",
  password: "",
};

export default function SignIn() {
  const { handleSignIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: yupResolver(signInSchema),
  });

  async function handleSubmitForm(data) {
    try {
      const { isItError } = await handleSignIn(data);
      if (!isItError) navigate("../main", { replace: true });
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
          Форма входа
        </h1>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <label>
            <span style={{ color: "white" }}>Email</span>
            <Field
              name="email"
              register={register}
              autoComplete="off"
              placeholder="Email"
              error={Boolean(errors.username)}
              helperText={errors.username?.message}
              type="name"
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
            Войти
          </Button>
        </form>
        <div style={{ display: "block" }}>
          <Link
            style={{ color: "white", textDecoration: "none" }}
            to={"/sign-up"}
          >
            Зарегистрироваться
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
