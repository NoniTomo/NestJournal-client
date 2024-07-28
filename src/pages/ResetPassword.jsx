import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import style from "./style2.module.scss";

import { resetPassword } from "./validtionSchemas";
import Button from "../components/Button/Button.jsx";
import Field from "../components/Field/Field.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import showSuccessMessage from "../utils/showSuccessMessage.js";

let defaultValues = {
  email: "",
};

export default function ResetPassword() {
  const { handleResetPassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: yupResolver(resetPassword),
  });

  const [linkSend, setLinkSend] = useState(false);

  async function handleSubmitForm(data) {
    try {
      const { isItError } = await handleResetPassword({
        data,
        setLinkSend: () => setLinkSend(true),
      });
      if (isItError) {
        showSuccessMessage("Письмо отправлено");
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
      {!linkSend ? (
        <div className={style.wrapper}>
          <h1
            style={{
              color: "white",
              alignContent: "center",
              textAlign: "center",
              width: "100%",
            }}
          >
            Восстановление пароля
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
            <Button disabled={isSubmitting} type="submit">
              Получить письмо
            </Button>
          </form>
          <div style={{ display: "block" }}>
            <Link
              style={{ color: "white", textDecoration: "none" }}
              to={"/sign-in"}
            >
              Войти в аккаунт
            </Link>
            <Link
              style={{ float: "right", color: "white", textDecoration: "none" }}
              to={"/sign-up"}
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      ) : (
        <div className={style.wrapper}>
          <p>
            Инструкция по восстановлению пароля отправлена на ваш Email адрес
          </p>
        </div>
      )}
    </div>
  );
}
