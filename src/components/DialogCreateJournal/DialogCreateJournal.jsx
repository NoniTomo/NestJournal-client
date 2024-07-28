import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Menu from "@mui/material/Menu";
import { useContext, useState } from "react";
import { UserDataContext } from "../../context/UserDataContext";
import { Button, DialogActions } from "@mui/material";
import EmojiPicker from "emoji-picker-react";
import { useTheme } from "@emotion/react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { journalSchema } from "../../pages/validtionSchemas";

const defaultValueConst = {
  title: "",
  description: "",
  emoji: {
    emojiValue: "📔",
    emojiLink:
      "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4d7.png",
  },
};

export default function DialogCreateJournal({
  type = "create-journal",
  cancelCreateNewJournal,
  defaultValues = defaultValueConst,
}) {
  const theme = useTheme();
  console.log(defaultValues);
  const { handleCreateJournal, handleUpdateJournal } =
    useContext(UserDataContext);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: yupResolver(journalSchema),
  });

  console.log(watch());
  console.log(watch("emoji"));
  const [openEmoji, setOpenEmoji] = useState(null);
  const openEmojiBoolean = Boolean(openEmoji);
  const handleClickEmoji = (event) => {
    setOpenEmoji(event.currentTarget);
  };
  const handleCloseEmoji = () => {
    setOpenEmoji(null);
  };

  const onSubmitJournal = async (data) => {
    console.log("data = ", data);
    try {
      switch (type) {
        case "create-journal": {
          await handleCreateJournal(data);
          break;
        }
        case "update-journal": {
          await handleUpdateJournal(data);
          break;
        }
        default: {
          console.log(
            "Ошибка при определении типа в компоненте DialogCreateJournal"
          );
        }
      }
    } catch (error) {
      console.error("Error occurred while signing up:", error);
    }
    cancelCreateNewJournal();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitJournal)}>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Box
            sx={{
              m: 1,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Button
              sx={{ height: "50px", width: "50px" }}
              id="basic-button"
              aria-controls={openEmoji ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openEmoji ? "true" : undefined}
              onClick={handleClickEmoji}
              variant="outlined"
            >
              <Box
                component="img"
                sx={{ height: "40px", width: "40px" }}
                src={watch("emoji")?.emojiLink}
              />
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={openEmoji}
              open={openEmojiBoolean}
              onClose={handleCloseEmoji}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <Controller
                control={control}
                name="emoji"
                render={({ field }) => (
                  <EmojiPicker
                    open={true}
                    theme={theme.palette.mode}
                    searchDisabled
                    onEmojiClick={(e) => {
                      console.log("e = ", e);
                      handleCloseEmoji();
                      field.onChange({
                        emojiValue: e.emoji,
                        emojiLink: e.imageUrl,
                      });
                    }}
                  />
                )}
              />
            </Menu>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <TextField
                  error={!!errors.title}
                  helperText={errors?.title?.message}
                  label="Название журнала"
                  autoFocus
                  value={field.value}
                  margin="dense"
                  onChange={(e) => field.onChange(e)}
                  variant="standard"
                  sx={{ m: 1, width: "100%" }}
                />
              )}
            />
          </Box>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <TextField
                error={!!errors.description}
                helperText={errors?.description?.message}
                label="Описание журнала"
                multiline
                value={field.value}
                onChange={(e) => field.onChange(e)}
                variant="standard"
                sx={{ m: 1, width: "100%" }}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="text">
          {type === "create-journal" ? "Создать" : "Сохранить"}
        </Button>
      </DialogActions>
    </form>
  );
}
