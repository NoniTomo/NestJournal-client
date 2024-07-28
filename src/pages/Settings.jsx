import { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {
  Avatar,
  Card,
  Divider,
  Checkbox,
  Typography,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  CircularProgress,
} from "@mui/material";
import { UserDataContext } from "../context/UserDataContext";
import {
  usernameSchema,
  passwordSchema,
  emailSchema,
} from "./validtionSchemas";
import SettingField from "../components/settingsFields/SettingField";
import SettingPasswordFields from "../components/settingsFields/SettingPasswordFields";
import { useNavigate } from "react-router-dom";
import DialogChoiceJournals from "../components/DialogChoiceJournals/DialogChoiceJournals.jsx";
import { useForm } from "react-hook-form";
import config from "../config.js";

export default function Settings() {
  const { register, handleSubmit } = useForm();
  const {
    handleGetEmail,
    email,
    emailVerify,
    username,
    handleUpdateEmail,
    handleUpdateUsername,
    handleUpdatePassword,
    handleDeleteAccount,
    handleChangeAvatar,
    avatar,
    handleGetNewActivationLink,
  } = useContext(UserDataContext);
  const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [openDialogChangeAvatar, setOpenDialogChangeAvatar] = useState(false);
  const [loadingDialogChangeAvatar, setLoadingDialogChangeAvatar] =
    useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    handleGetEmail();
  }, []);

  function cancelDeleteAccount() {
    setOpenDeleteAccountDialog(false);
  }
  function agreeDeleteAccount() {
    handleDeleteAccount();
  }

  function cancelChangeAvatar() {
    setOpenDialogChangeAvatar(false);
    setLoadingDialogChangeAvatar(false);
  }
  const agreeChangeAvatar = async (data) => {
    const formData = new FormData();
    formData.append("file", data.file[0]);
    handleChangeAvatar({
      formData: formData,
      loading: () => cancelChangeAvatar(),
    });
    setLoadingDialogChangeAvatar(true);
  };

  function cancelDownloadData() {
    setOpenDownloadDialog(false);
  }

  const [srcProp, setSrcProp] = useState({});
  useEffect(() => {
    if (avatar !== "")
      setSrcProp({ src: config.API_URL + "/static/" + avatar });
  }, [avatar]);

  return (
    username !== 0 &&
    email !== 0 && (
      <>
        <Box
          sx={{
            m: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "column",
            height: "85vh",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-start",
              flexDirection: "column",
              width: "100%",
            }}
            maxWidth="500px"
          >
            <Card
              sx={{
                p: 1,
                display: "flex",
                gap: 2,
                justifyContent: "flex-start",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Typography fontSize={0.8 + "rem"} color="text.secondary">
                Сменить имя или аватар
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-start",
                  flexDirection: "row",
                  flex: "",
                }}
              >
                {username !== "" ? (
                  <>
                    <div
                      style={{
                        width: "min-content",
                        display: "inline-block",
                        margin: "auto",
                      }}
                    >
                      <Avatar
                        {...srcProp}
                        sx={{ cursor: "pointer" }}
                        onClick={() => setOpenDialogChangeAvatar(true)}
                      />
                    </div>
                    <SettingField
                      schema={usernameSchema}
                      data={{ title: username }}
                      name="Имя"
                      handleSubmitOnServer={handleUpdateUsername}
                    />
                  </>
                ) : (
                  <Typography>
                    <CircularProgress />
                  </Typography>
                )}
              </Box>
            </Card>
            <Card
              sx={{
                p: 1,
                display: "flex",
                gap: 2,
                justifyContent: "flex-start",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Typography fontSize={0.8 + "rem"} color="text.secondary">
                Сменить Email
              </Typography>
              {email !== "" && (
                <>
                  <SettingField
                    schema={emailSchema}
                    data={{ title: email }}
                    name="email"
                    handleSubmitOnServer={handleUpdateEmail}
                  />
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                    <Checkbox checked={emailVerify} disabled />
                    <Typography
                      sx={{ display: "inline-block", margin: "auto 0" }}
                      variant="body2"
                    >
                      {emailVerify
                        ? "Почта верифицирована"
                        : "Для подтверждения почты перейдите по ссылке подтверждения"}
                    </Typography>
                    {!emailVerify && (
                      <Button
                        variant="text"
                        onClick={handleGetNewActivationLink}
                      >
                        Получить новую ссылку
                      </Button>
                    )}
                  </Box>
                </>
              )}
            </Card>
            <Card
              sx={{
                p: 1,
                display: "flex",
                gap: 2,
                justifyContent: "flex-start",
                flexDirection: "column",
                width: "100%",
              }}
            >
              <Typography fontSize={0.8 + "rem"} color="text.secondary">
                Сменить пароль
              </Typography>
              {
                <SettingPasswordFields
                  schema={passwordSchema}
                  handleSubmitOnServer={handleUpdatePassword}
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-start",
                    flexDirection: "column",
                    width: "100%",
                  }}
                />
              }
            </Card>
            <Divider />
            <Button
              variant="contained"
              sx={{ height: "3rem" }}
              onClick={() => setOpenDownloadDialog(true)}
            >
              Загрузить все данные в PDF
            </Button>
            <Button
              onClick={setOpenDeleteAccountDialog}
              width={"100%"}
              variant="text"
              color="error"
              sx={{ height: "3rem" }}
            >
              Удалить аккаунт
            </Button>
          </Box>
        </Box>
        <Dialog
          fullWidth
          open={openDeleteAccountDialog}
          onClose={() => {
            cancelDeleteAccount();
          }}
        >
          <DialogTitle>Удаление аккаунта</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {`Все данные будут потеряны!\nВы уверены, что хотите удалить свой аккаунт?`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                cancelDeleteAccount();
              }}
            >
              Нет
            </Button>
            <Button
              onClick={() => {
                agreeDeleteAccount();
                navigate("/main");
              }}
            >
              Да
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          fullWidth
          open={openDownloadDialog}
          onClose={() => {
            cancelDownloadData();
          }}
        >
          <DialogChoiceJournals cancelDownloadData={cancelDownloadData} />
        </Dialog>
        <Dialog
          fullWidth
          open={openDialogChangeAvatar}
          onClose={() => {
            cancelDownloadData();
          }}
        >
          <form onSubmit={handleSubmit(agreeChangeAvatar)}>
            <DialogContent>
              <DialogContentText>{`Выберите фотографию`}</DialogContentText>
              <input type="file" {...register("file")} />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  cancelChangeAvatar();
                }}
              >
                Отмена
              </Button>
              {!loadingDialogChangeAvatar ? (
                <Button type="submit">Применить</Button>
              ) : (
                <Button disabled variant="text">
                  <CircularProgress />
                </Button>
              )}
            </DialogActions>
          </form>
        </Dialog>
      </>
    )
  );
}

/*
          <Card sx={{ p : 1, display: 'flex', gap: 2, justifyContent: 'flex-start', flexDirection: 'column', width: '100%'}}>
            <Typography fontSize={0.8+'rem'} color='text.secondary'>Сменить пароль</Typography>
            <FormControl sx={{flex: '6'}} id='password'>
              <TextField id="outlined-basic" label="Старый пароль" variant="outlined" />
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', flexDirection: 'row', flex: '5 '}}>
              <FormControl sx={{flex: '6'}} id='password'>
              <TextField id="outlined-basic" label="Новый пароль" variant="outlined" />
              </FormControl>
              <Button variant="text" sx={{ width: '7rem', height: '100%', margin: 'auto'}}>Применить</Button>
            </Box>
          </Card>
          */
