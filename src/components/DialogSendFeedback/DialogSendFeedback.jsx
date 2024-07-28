import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useContext } from "react";
import { UserDataContext } from "../../context/UserDataContext";
import { Button, DialogActions } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { feedbackSchema } from "../../pages/validtionSchemas";

let defaultValues = {title: '', content: ''}

export default function DialogSendFeedback({handleCloseFeedback}) {
    const { handleCreateFeedback } = useContext(UserDataContext);
    const { 
        control, 
        handleSubmit, 
        formState: { errors } 
    } = useForm({
        defaultValues,
        resolver: yupResolver(feedbackSchema),
    });

    function onSubmitFeedback(data) {
      handleCreateFeedback(data);
      handleCloseFeedback();
    }

    return (
        <form onSubmit={handleSubmit(onSubmitFeedback)}>
        <DialogContent
        sx={{ display: 'flex', flexDirection:'column', width: '100%' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection:'column', 
                width: '100%',
              }}
            >
                <Controller
                  control={ control }
                  name='title'
                  render={({field}) => (
                    <TextField
                      error={!!errors.title}
                      helperText={errors?.title?.message}
                      label="Заголовок"
                      autoFocus
                      value={field.title}
                      margin="dense"
                      onChange={(e) => field.onChange(e)}
                      variant="standard"
                      sx={{ m: 1, width: '100%' }}
                    />)}
                />
                <Controller
                    control={ control }
                    name='content'
                    render={({field}) => (
                        <TextField
                            error={!!errors.content}
                            helperText={errors?.content?.message}
                            id="standard-multiline-static"
                            label="Описание проблемы"
                            multiline
                            value={field.content}
                            onChange={(e) => field.onChange(e)}
                            variant="standard"
                            sx={{ m: 1, width: '100%' }}
                        />)}
                />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button type='submit' variant='text'>Отправить</Button>
        </DialogActions>
        </form>
    )
}