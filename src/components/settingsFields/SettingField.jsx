import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { TextField, Button, Box, CircularProgress } from "@mui/material";

export default function SettingField({
  sx,
  schema,
  data,
  name,
  handleSubmitOnServer,
}) {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: data,
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    handleSubmitOnServer({ data, loading: () => setLoading(false) });
    setLoading(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        justifyContent: "flex-start",
        flexDirection: "row",
        flex: "5 ",
      }}
      component={"form"}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        control={control}
        name="title"
        defaultValue=""
        render={({ field }) => (
          <TextField
            error={!!errors?.title}
            helperText={errors?.title?.message}
            id="outlined-basic"
            label={name}
            variant="outlined"
            value={field.value}
            sx={{ flex: "6" }}
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
  );
}
