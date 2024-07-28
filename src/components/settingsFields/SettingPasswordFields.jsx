import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { TextField, Button, Box, CircularProgress } from "@mui/material";

const defaultValue = {
  oldPassword: "",
  newPassword: "",
};

export default function SettingPasswordFields({
  sx,
  schema,
  handleSubmitOnServer,
}) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValue,
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    handleSubmitOnServer({ data, loading: () => setLoading(false) });
    setLoading(true);
  };

  return (
    <Box sx={{ ...sx }} component={"form"} onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="oldPassword"
        defaultValue=""
        render={({ field }) => (
          <TextField
            type="password"
            label="Старый пароль"
            error={!!errors?.oldPassword}
            helperText={errors?.oldPassword?.message}
            id="outlined-old-password"
            variant="outlined"
            value={field.value}
            onChange={(event) => field.onChange(event.target.value)}
            {...field}
          />
        )}
      />
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "flex-start",
          flexDirection: "row",
          flex: "5 ",
        }}
      >
        <Controller
          control={control}
          name="newPassword"
          defaultValue=""
          render={({ field }) => (
            <TextField
              type="password"
              sx={{ flex: "6" }}
              error={!!errors?.newPassword}
              helperText={errors?.newPassword?.message}
              id="outlined-new-password"
              label="Новый пароль"
              variant="outlined"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              {...field}
            />
          )}
        />
        {!loading ? (
          <Button
            variant="text"
            sx={{ width: "7rem", height: "3.5rem", margin: "0 auto" }}
            type="submit"
          >
            Применить
          </Button>
        ) : (
          <Button
            disabled
            variant="text"
            sx={{ width: "7rem", height: "3.5rem", margin: "0 auto" }}
            type="submit"
          >
            <CircularProgress />
          </Button>
        )}
      </Box>
    </Box>
  );
}
