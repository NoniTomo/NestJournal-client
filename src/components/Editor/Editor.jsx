import { Lock, LockOpen, TextFields } from "@mui/icons-material";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  CircularProgress,
  Badge,
  ImageList,
} from "@mui/material";
import {
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect,
  forwardRef,
} from "react";
import {
  LinkBubbleMenu,
  MenuButton,
  RichTextEditor,
  RichTextReadOnly,
  TableBubbleMenu,
  insertImages,
} from "mui-tiptap";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Chip from "@mui/material/Chip";
import EditorMenuControls from "./EditorMenuControls";
import useExtensions from "./UseExtensions";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { noteSchema } from "../../pages/validtionSchemas";
import { UserDataContext } from "../../context/UserDataContext";
import { useTheme } from "@emotion/react";
import { useLocation } from "react-router-dom";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import config from "../../config";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Slide from "@mui/material/Slide";

import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function getStyles(name, selectedTags, theme) {
  return {
    fontWeight:
      selectedTags.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

function fileListToImageFiles(fileList) {
  return Array.from(fileList).filter((file) => {
    const mimeType = (file.type || "").toLowerCase();
    return mimeType.startsWith("image/");
  });
}

export default function Editor({ type, note, files = [], handlerDrawerClose }) {
  const extensions = useExtensions({
    placeholder: "Напишите здесь что-нибудь...",
  });

  const [openDialogFiles, setOpenDialogFiles] = useState(false);
  const { handleCreateNote, handleUpdateNote, journals, tags } =
    useContext(UserDataContext);
  let rteRef = useRef(null);
  const [isEditable, setIsEditable] = useState(true);
  const [showMenuBar, setShowMenuBar] = useState(true);
  const [countBadge, setCountBadge] = useState(0);
  const [openFullScreenTextEditor, setOpenFullScreenTextEditor] =
    useState(false);

  const handleClickOpenFullScreenTextEditor = () => {
    setOpenFullScreenTextEditor(true);
  };

  const handleCloseFullScreenTextEditor = () => {
    setOpenFullScreenTextEditor(false);
  };

  const theme = useTheme();
  const {
    control,
    handleSubmit,
    watch,
    reset,
    resetField,
    formState: { errors, isSubmitSuccessful },
  } = useForm({
    defaultValues: { ...note, files: null, files_old: files },
    resolver: yupResolver(noteSchema),
  });
  const location = useLocation();
  useEffect(() => {
    reset({ ...note, files: null, files_old: files });
    rteRef.current?.editor?.commands.setContent(note.content);
    setCountBadge(0);
  }, [reset, note, isSubmitSuccessful]);

  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [choiceImage, setChoiceImage] = useState({});

  const closeImageDialog = () => {
    setOpenImageDialog(false);
  };
  const handleNewImageFiles = useCallback((files, insertPosition) => {
    if (!rteRef.current?.editor) {
      return;
    }
    const attributesForImageFiles = files.map((file) => ({
      src: URL.createObjectURL(file),
      alt: file.name,
    }));

    insertImages({
      images: attributesForImageFiles,
      editor: rteRef.current.editor,
      insertPosition,
    });
  }, []);

  const [loadingDialogFiles, setLoadingDialogFiles] = useState(false);
  function cancelChangeAvatar() {
    setOpenDialogFiles(false);
    setLoadingDialogFiles(false);
  }

  function cancelDownloadData() {
    setOpenDialogFiles(false);
  }

  const handleDrop = useCallback(
    (view, event, _slice, _moved) => {
      if (!(event instanceof DragEvent) || !event.dataTransfer) {
        return false;
      }

      const imageFiles = fileListToImageFiles(event.dataTransfer.files);
      if (imageFiles.length > 0) {
        const insertPosition = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })?.pos;

        handleNewImageFiles(imageFiles, insertPosition);
        event.preventDefault();
        return true;
      }
      return false;
    },
    [handleNewImageFiles]
  );

  const handlePaste = useCallback((_view, event, _slice) => {
    if (!event.clipboardData) {
      return false;
    }

    const pastedImageFiles = fileListToImageFiles(event.clipboardData.files);
    if (pastedImageFiles.length > 0) {
      event.preventDefault();
      return true;
    }
    return false;
  });
  async function onSubmitNote(data) {
    const parse_data = {
      ...data,
      journal:
        typeof data.journal === "string"
          ? JSON.parse(data.journal)
          : data.journal,
      tags: data.tags.map((tag) =>
        typeof tag === "string" ? JSON.parse(tag) : tag
      ),
    };
    const formData = new FormData();
    if (!!data?.files?.length) {
      for (let i = 0; i < data.files.length; i++) {
        formData.append("file", data.files[i]);
      }
    }
    const params = new URLSearchParams(location.search);
    const journalId = parseInt(params.get("journal"), 10);
    const tagId = parseInt(params.get("tag"), 10);

    const save =
      (!params.has("journal") && !params.has("tag")) ||
      (params.has("journal") && parse_data.journal.journal_id === journalId) ||
      (params.has("tag") &&
        parse_data.tags.some((tag) => tag.tag_id === tagId));

    type === "create-note"
      ? await handleCreateNote({
          save,
          close: () => handlerDrawerClose(),
          formData: formData,
          ...parse_data,
        })
      : await handleUpdateNote({
          save,
          close: () => handlerDrawerClose(),
          ...parse_data,
          formData: formData,
          create_date: note.create_date,
          note_id: note.note_id,
        });
    setCountBadge(0);
  }

  const handleChangeTags = (event) => {
    const {
      target: { value },
    } = event;
    return typeof value === "string" ? value.split(",") : value;
  };

  return (
    <form onSubmit={handleSubmit(onSubmitNote)} id="editor-form">
      <Box
        sx={{
          p: 1,
          "& .ProseMirror": {
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              scrollMarginTop: showMenuBar ? 50 : 0,
            },
          },
        }}
      >
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField
              error={!!errors.title}
              helperText={errors?.title?.message}
              label="Заголовок"
              autoFocus
              value={field.value}
              margin="dense"
              onChange={(event) => field.onChange(event)}
              variant="standard"
              sx={{ mb: 1, width: "100%" }}
            />
          )}
        />
        <Box
          sx={{
            width: "100%",
            maxHeight: "max-content",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <FormControl sx={{ width: "100%" }}>
            <InputLabel id="select-journal-label">Журнал</InputLabel>
            <Controller
              control={control}
              name="journal"
              render={({ field }) => (
                <Select
                  sx={{ width: "100%", paddingRight: 4, height: "100%" }}
                  error={!!errors.selectJournal}
                  helperText={errors?.title?.message}
                  labelId="select-journal-label"
                  id="select-journal"
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                    resetField("tags", { defaultValue: [] });
                  }}
                  label="Журнал"
                  renderValue={() => JSON.parse(field.value).title}
                  defaultValue=""
                >
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
          <FormControl sx={{ width: "100%" }}>
            <InputLabel id="demo-multiple-chip-label_note">Теги</InputLabel>
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <Select
                  sx={{ width: "100%", paddingRight: 4 }}
                  labelId="demo-multiple-chip-label_note"
                  id="demo-multiple-chip"
                  multiple
                  value={field.value}
                  onChange={(event) => field.onChange(handleChangeTags(event))}
                  input={
                    <OutlinedInput id="select-multiple-chip" label="Chip" />
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "nowrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={JSON.parse(value).tag_id}
                          label={JSON.parse(value).title}
                        />
                      ))}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {tags
                    .filter(
                      (tag) =>
                        tag.selectJournal.journal_id ===
                          JSON.parse(watch("journal")).journal_id ||
                        tag.selectJournal.journal_id === null
                    )
                    .map((tag) => (
                      <MenuItem
                        key={tag.tag_id}
                        value={JSON.stringify(tag)}
                        style={getStyles(tag.title, field.value, theme)}
                      >
                        <Typography maxWidth={400} noWrap>
                          {tag.title}
                        </Typography>
                      </MenuItem>
                    ))}
                </Select>
              )}
            />
          </FormControl>
          <FormControl
            sx={{
              width: "100px",
              display: "inline-block",
              margin: "auto auto",
              mr: "8px",
            }}
          >
            <Controller
              control={control}
              name="files"
              render={({ field }) => (
                <>
                  <IconButton
                    sx={{ cursor: "pointer" }}
                    onClick={() => setOpenDialogFiles(true)}
                    aria-label="Прикрепить файлы"
                    color="primary"
                    size="large"
                  >
                    <Badge badgeContent={countBadge} color="secondary">
                      <AttachFileIcon fontSize="inherit" />
                    </Badge>
                  </IconButton>
                  <Dialog
                    fullWidth
                    open={openDialogFiles}
                    onClose={() => {
                      cancelDownloadData();
                    }}
                  >
                    <DialogContent>
                      <DialogContentText>
                        {`Выберите фотографию`}
                      </DialogContentText>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          setCountBadge(e.target.files.length);
                          field.onChange(e.target.files);
                        }}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => {
                          cancelChangeAvatar();
                        }}
                      >
                        Отмена
                      </Button>
                      {!loadingDialogFiles ? (
                        <Button onClick={cancelChangeAvatar}>Применить</Button>
                      ) : (
                        <Button disabled variant="text">
                          <CircularProgress />
                        </Button>
                      )}
                    </DialogActions>
                  </Dialog>
                </>
              )}
            />
          </FormControl>
        </Box>
        <Controller
          sx={{ width: "100%" }}
          control={control}
          name="content"
          defaultValue=""
          render={({ field }) => (
            <>
              <RichTextEditor
                ref={rteRef}
                extensions={extensions}
                content={field.value}
                onUpdate={({ editor }) => {
                  field.onChange(editor.getHTML());
                }}
                editable={isEditable}
                editorProps={{
                  handleDrop: handleDrop,
                  handlePaste: handlePaste,
                }}
                renderControls={() => <EditorMenuControls />}
                RichTextFieldProps={{
                  // The "outlined" variant is the default (shown here only as
                  // example), but can be changed to "standard" to remove the outlined
                  // field border from the editor
                  variant: "outlined",
                  MenuBarProps: {
                    hide: !showMenuBar,
                  },
                  // Below is an example of adding a toggle within the outlined field
                  // for showing/hiding the editor menu bar, and a "submit" button for
                  // saving/viewing the HTML content
                  footer: (
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        borderTopStyle: "solid",
                        borderTopWidth: 1,
                        borderTopColor: (theme) => theme.palette.divider,
                        py: 1,
                        px: 1.5,
                      }}
                    >
                      <MenuButton
                        value="formatting"
                        tooltipLabel={
                          showMenuBar ? "Hide formatting" : "Show formatting"
                        }
                        size="small"
                        onClick={() =>
                          setShowMenuBar((currentState) => !currentState)
                        }
                        selected={showMenuBar}
                        IconComponent={TextFields}
                      />

                      <MenuButton
                        value="formatting"
                        tooltipLabel={
                          isEditable
                            ? "Prevent edits (use read-only mode)"
                            : "Allow edits"
                        }
                        size="small"
                        onClick={() =>
                          setIsEditable((currentState) => !currentState)
                        }
                        selected={!isEditable}
                        IconComponent={isEditable ? Lock : LockOpen}
                      />

                      <Button
                        variant="text"
                        size="small"
                        onClick={handleClickOpenFullScreenTextEditor}
                      >
                        <FullscreenIcon />
                      </Button>

                      <Button type="submit" variant="contained" size="small">
                        Сохранить
                      </Button>
                    </Stack>
                  ),
                }}
              >
                {() => (
                  <>
                    <LinkBubbleMenu />
                    <TableBubbleMenu />
                  </>
                )}
              </RichTextEditor>
              <Dialog
                fullScreen
                open={openFullScreenTextEditor}
                onClose={handleCloseFullScreenTextEditor}
                TransitionComponent={Transition}
              >
                <AppBar sx={{ position: "relative" }}>
                  <Toolbar>
                    <Typography
                      sx={{ ml: 2, flex: 1 }}
                      variant="h6"
                      component="div"
                    >
                      {watch("title")}
                    </Typography>
                    <Button
                      color="inherit"
                      onClick={handleCloseFullScreenTextEditor}
                      type="submit"
                      variant="text"
                      size="small"
                    >
                      <FullscreenExitIcon />
                    </Button>
                  </Toolbar>
                </AppBar>
                <RichTextEditor
                  ref={rteRef}
                  extensions={extensions}
                  content={field.value}
                  onUpdate={({ editor }) => {
                    field.onChange(editor.getHTML());
                  }}
                  editable={isEditable}
                  editorProps={{
                    handleDrop: handleDrop,
                    handlePaste: handlePaste,
                  }}
                  renderControls={() => <EditorMenuControls />}
                  RichTextFieldProps={{
                    // The "outlined" variant is the default (shown here only as
                    // example), but can be changed to "standard" to remove the outlined
                    // field border from the editor
                    variant: "outlined",
                    MenuBarProps: {
                      hide: !showMenuBar,
                    },
                    // Below is an example of adding a toggle within the outlined field
                    // for showing/hiding the editor menu bar, and a "submit" button for
                    // saving/viewing the HTML content
                    footer: (
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          borderTopStyle: "solid",
                          borderTopWidth: 1,
                          borderTopColor: (theme) => theme.palette.divider,
                          py: 1,
                          px: 1.5,
                        }}
                      >
                        <MenuButton
                          value="formatting"
                          tooltipLabel={
                            showMenuBar ? "Hide formatting" : "Show formatting"
                          }
                          size="small"
                          onClick={() =>
                            setShowMenuBar((currentState) => !currentState)
                          }
                          selected={showMenuBar}
                          IconComponent={TextFields}
                        />

                        <MenuButton
                          value="formatting"
                          tooltipLabel={
                            isEditable
                              ? "Prevent edits (use read-only mode)"
                              : "Allow edits"
                          }
                          size="small"
                          onClick={() =>
                            setIsEditable((currentState) => !currentState)
                          }
                          selected={!isEditable}
                          IconComponent={isEditable ? Lock : LockOpen}
                        />

                        <Button
                          type="submit"
                          variant="contained"
                          size="small"
                          onClick={handleCloseFullScreenTextEditor}
                          form="editor-form"
                        >
                          Сохранить
                        </Button>
                      </Stack>
                    ),
                  }}
                >
                  {() => (
                    <>
                      <LinkBubbleMenu />
                      <TableBubbleMenu />
                    </>
                  )}
                </RichTextEditor>
              </Dialog>
            </>
          )}
        />
        <Controller
          control={control}
          name="files_old"
          render={({ field }) => {
            return (
              <>
                <div
                  style={{
                    height: "120px",
                    overflowX: "auto",
                    overflowY: "hidden",
                  }}
                >
                  <ImageList
                    style={{
                      display: "flex",
                      justifyContent: "start",
                      gap: "10px",
                      flexDirection: "row",
                      width: "max-content",
                    }}
                  >
                    {files &&
                      files.length > 0 &&
                      field.value.map((file) => (
                        <div
                          key={file.file_id}
                          alt={file.file_id}
                          style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "10%",
                            backgroundSize: "cover",
                            backgroundImage: `url(${
                              config.API_URL + "/static/" + file.path
                            })`,
                          }}
                          onClick={() => {
                            setChoiceImage({
                              file_id: file.file_id,
                              path: file.path,
                            });
                            setOpenImageDialog(true);
                          }}
                        />
                      ))}
                  </ImageList>
                </div>
                <Dialog
                  fullWidth
                  maxWidth={"xl"}
                  open={openImageDialog}
                  onClose={() => {
                    closeImageDialog();
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      height: "100%",
                      width: "100%",
                      backgroundColor: "black",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          field.onChange(
                            field.value.filter(
                              (file) => +file.file_id !== +choiceImage.file_id
                            )
                          );
                          closeImageDialog();
                        }}
                      >
                        <DeleteIcon style={{ color: "white" }} />
                      </IconButton>
                      <IconButton onClick={() => closeImageDialog()}>
                        <CloseIcon style={{ color: "white" }} />
                      </IconButton>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <img
                        style={{
                          maxWidth: "100%",
                          width: "auto",
                          height: "80vh",
                          display: "block",
                          objectFit: "contain",
                        }}
                        alt={choiceImage.file_id}
                        src={`${
                          config.API_URL + "/static/" + choiceImage.path
                        }`}
                      />
                    </div>
                  </div>
                </Dialog>
              </>
            );
          }}
        />
      </Box>
    </form>
  );
}
