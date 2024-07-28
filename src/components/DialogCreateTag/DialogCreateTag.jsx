import { useContext } from "react";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import { UserDataContext } from "../../context/UserDataContext";
import { Button, DialogActions } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { tagSchema } from "../../pages/validtionSchemas";

const defaultValueConst = {
  title: "",
  selectJournal: '{"title":"Все","journal_id":null}',
};

export default function DialogCreateTag({
  type = "create-tag",
  cancelCreateNewTag,
  defaultValues = defaultValueConst,
}) {
  const { handleCreateTag, handleUpdateTag } = useContext(UserDataContext);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues, //JSON.stringify({ title: defaultValues.title, selectJournal : JSON.stringify({ ...defaultValues.selectJournal})}),
    resolver: yupResolver(tagSchema),
  });
  const onSubmitTag = async (data) => {
    data = { ...data, selectJournal: JSON.parse(data.selectJournal) };
    try {
      switch (type) {
        case "create-tag": {
          await handleCreateTag(data);
          break;
        }
        case "update-tag": {
          await handleUpdateTag(data);
          break;
        }
        default: {
          console.log(
            "Ошибка при определении типа операции в компоненте DialogCreateJournal"
          );
        }
      }
    } catch (error) {
      console.error("Error occurred while signing up:", error);
    }
    cancelCreateNewTag();
  };

  const { journals } = useContext(UserDataContext);
  return (
    <form onSubmit={handleSubmit(onSubmitTag)}>
      <DialogContent>
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextField
                error={!!errors.title}
                helperText={errors?.title?.message}
                label="Название тега"
                autoFocus
                value={field.value}
                margin="dense"
                onChange={(event) => field.onChange(event)}
                variant="standard"
                sx={{ m: 1, width: "100%" }}
              />
            )}
          />
          <FormControl sx={{ m: 1, width: "100%" }}>
            <InputLabel id="select-journal-label">Журнал</InputLabel>
            <Controller
              control={control}
              name="selectJournal"
              render={({ field }) => (
                <Select
                  error={!!errors.selectJournal}
                  labelId="select-journal-label"
                  id="select-journal"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  label="Журнал"
                  sx={{ height: "100%" }}
                  renderValue={() => {
                    console.log("field.value = ", field.value);
                    return JSON.parse(field.value).title;
                  }}
                  defaultValue=""
                >
                  <MenuItem
                    value={JSON.stringify({ title: "Все", journal_id: null })}
                  >
                    <Typography maxWidth={400} noWrap>
                      Все
                    </Typography>
                  </MenuItem>
                  {journals.map((journal) => (
                    <MenuItem
                      key={journal.journal_id}
                      value={JSON.stringify({
                        title: journal.title,
                        journal_id: journal.journal_id,
                      })}
                    >
                      <Box
                        component="img"
                        sx={{ height: "32px", mr: 1 }}
                        src={journal.emoji.emojiLink}
                      />
                      <Typography maxWidth={400} noWrap>
                        {journal.title}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button type="submit" variant="text">
          {"Сохранить"}
        </Button>
      </DialogActions>
    </form>
  );
}
