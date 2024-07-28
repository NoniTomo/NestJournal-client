import { useState, useEffect, useRef, useCallback } from "react";
import {
  ImageListItem,
  Grid,
  Typography,
  Stack,
  Chip,
  ImageList,
  useMediaQuery,
  DialogContentText,
  DialogTitle,
  DialogContent,
  Box,
  CircularProgress,
} from "@mui/material";
import { useContext } from "react";
import { UserDataContext } from "../../context/UserDataContext";
import SellIcon from "@mui/icons-material/Sell";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import CreateIcon from "@mui/icons-material/Create";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import AddIcon from "@mui/icons-material/Add";
import Editor from "../Editor/Editor";
import CloseIcon from "@mui/icons-material/Close";
import useExtensions from "../Editor/UseExtensions.jsx";

import { styled, useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import { useLocation, useNavigate } from "react-router-dom";

import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DialogCreateJournal from "../DialogCreateJournal/DialogCreateJournal";
import DialogCreateTag from "../DialogCreateTag/DialogCreateTag";
import config from "../../config";

import { RichTextEditor, RichTextReadOnly } from "mui-tiptap";

const MainText = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(1),
  [theme.breakpoints.up("sm")]: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: 0,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 40 + "vw",
      marginLeft: 0,
    }),
  },
  [theme.breakpoints.down("sm")]: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: 0,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 100 + "vw",
    }),
  },
  position: "relative",
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

export default function Notes() {
  const {
    notes,
    tags,
    journals,
    handleDeleteJournal,
    handleDeleteTag,
    handleDeleteNote,
    errorNote,
    loadingNote,
    hasMoreNotes,
    handleGetNotes,
    handleChangeLocation,
    getConcreteNote,
    files,
  } = useContext(UserDataContext);
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  let location = useLocation();
  let paramsFilter =
    location.search !== ""
      ? {
          type: location.search?.slice(1).split("=")[0],
          param: location.search?.slice(1).split("=")[1],
        }
      : null;

  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isMiddleScreen = useMediaQuery((theme) =>
    theme.breakpoints.between("sm", "md")
  );
  const [openNewJournalCreateDialog, setOpenNewJournalCreateDialog] =
    useState(false);
  const [openNewJournalUpdateDialog, setOpenNewJournalUpdateDialog] =
    useState(false);
  const [openDeleteJournalDialog, setOpenDeleteJournalDialog] = useState(false);
  const [openNewTagDialog, setOpenNewTagDialog] = useState(false);
  const [openDeleteTagDialog, setOpenDeleteTagDialog] = useState(false);

  const [openJournal, setOpenJournal] = useState();
  const colsImage = {
    cols: isSmallScreen || open ? 2 : isMiddleScreen ? 3 : 4,
  };
  const [localeNotes, setLocaleNotes] = useState([]);
  const [typeNoteAction, setTypeNoteAction] = useState({});

  const [pageNumberNote, setPageNumberNote] = useState(1);
  const [paramsNote, setParamsNote] = useState(null);

  const mobilePosition = useMediaQuery(theme.breakpoints.down("md"));
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [choiceImage, setChoiceImage] = useState({});
  const closeImageDialog = () => {
    setOpenImageDialog(false);
  };

  const observer = useRef();
  const lastNoteElementRef = useCallback(
    (node) => {
      if (loadingNote) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreNotes) {
          setPageNumberNote(pageNumberNote + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingNote, hasMoreNotes]
  );

  useEffect(() => {
    const handleNote = async () => {
      if (location.state?.note && notes.length !== 0) {
        const existingNote = notes.find(
          (note_el) => note_el.note_id === location.state.note.note_id
        );

        if (!existingNote) {
          const data = await getConcreteNote({
            note_id: location.state.note.note_id,
          });
          if (data) {
            const noteJournal = journals.find(
              (journal) => journal.journal_id === data.note.journal_fk
            );
            const noteTags = data.note.tags.map((tag) =>
              JSON.stringify(
                tags.find((tag_el) => tag_el.tag_id === tag.tag_fk)
              )
            );

            setTypeNoteAction({
              type: "update-note",
              note: {
                title: data.note.title,
                content: data.note.content,
                journal: JSON.stringify({
                  title: noteJournal?.title,
                  journal_id: data.note.journal_fk,
                }),
                tags: noteTags,
                create_date: data.note.create_date,
                note_id: data.note.note_id,
              },
              files: data.files[0].paths,
            });
          }
        } else {
          const note = location.state.note;
          const noteContent = notes.find(
            (note_el) => note_el.note_id === note.note_id
          ).content;
          const noteJournal = journals.find(
            (journal) => journal.journal_id === note.journal_fk
          );
          const noteTags = note.tags.map((tag) =>
            JSON.stringify(tags.find((tag_el) => tag_el.tag_id === tag.tag_fk))
          );
          const noteFiles =
            files.find((file) => +file.note_id === +note.note_id)?.paths || [];

          setTypeNoteAction({
            type: "update-note",
            note: {
              title: note.title,
              content: noteContent,
              journal: JSON.stringify({
                title: noteJournal?.title,
                journal_id: note.journal_fk,
              }),
              tags: noteTags,
              create_date: note.create_date,
              note_id: note.note_id,
            },
            files: noteFiles,
          });
        }
        handleDrawerOpen();
      }
    };

    handleNote();
  }, [location.state]);

  useEffect(() => {
    if (paramsNote !== null) {
      handleGetNotes({ paramsNote: paramsNote, pageNumber: pageNumberNote });
    }
  }, [pageNumberNote, paramsNote]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const journalParam = searchParams.get("journal");
    if (journalParam) {
      setParamsNote({ journal: journalParam });
    }
  }, [location.search]);

  useEffect(() => {
    let paramsObj = {},
      name = "";
    let arraySearchParams = location.search.slice(1).split("=");
    for (let i = 0; i < arraySearchParams.length; i++) {
      i % 2 === 0
        ? (name = arraySearchParams[i])
        : (paramsObj[name] = arraySearchParams[i]);
    }
    setPageNumberNote(1);
    handleChangeLocation();
    setParamsNote(paramsObj);
  }, [location]);

  useEffect(() => {
    const newNotes = notes.reduce((newNotes, note) => {
      const create_date = new Date(note.create_date);
      const update_date = new Date(note.update_date);

      return [
        { ...note, update_date: update_date, create_date: create_date },
        ...newNotes,
      ];
    }, []);
    setLocaleNotes(
      newNotes.sort(
        (item_1, item_2) =>
          item_2.create_date.getTime() - item_1.create_date.getTime()
      )
    );
  }, [notes]);

  const navigate = useNavigate();

  function createNewJournal() {
    setOpenNewJournalCreateDialog(true);
  }
  function cancelCreateNewJournal() {
    setOpenNewJournalCreateDialog(false);
  }

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function changeJournal() {
    setOpenNewJournalUpdateDialog(true);
  }
  function cancelChangeJournal() {
    setOpenNewJournalUpdateDialog(false);
  }

  function deleteJournal() {
    setOpenDeleteJournalDialog(true);
  }
  function cancelDeleteJournal() {
    setOpenDeleteJournalDialog(false);
  }
  async function agreeDeleteJournal() {
    cancelDeleteJournal();
    try {
      await handleDeleteJournal(paramsFilter.param);
    } catch (error) {
      console.error("Error occurred while signing up:", error);
    }
  }

  function changeTag() {
    setOpenNewTagDialog(true);
  }
  function cancelChangeTag() {
    setOpenNewTagDialog(false);
  }
  function deleteTag() {
    setOpenDeleteTagDialog(true);
  }
  function cancelDeleteTag() {
    setOpenDeleteTagDialog(false);
  }
  async function agreeDeleteTag() {
    cancelDeleteTag();
    try {
      await handleDeleteTag(paramsFilter.param);
    } catch (error) {
      console.error("Error occurred while signing up:", error);
    }
  }

  const extensions = useExtensions({
    placeholder: "Напишите здесь что-нибудь...",
  });

  const getCurrentJournal = journals.find(
    (element) => element?.journal_id === +paramsFilter?.param
  );
  const getCurrentTag = tags.find(
    (element) => element?.tag_id === +paramsFilter?.param
  );
  const journalWrap = Boolean(openJournal);
  return (
    <>
      <CssBaseline />
      {paramsFilter?.param && (
        <div
          style={{
            display: "block",
            margin: "auto",
            width: "100%",
            maxWidth: "1100px",
          }}
        >
          <MainText
            open={open}
            sx={{ display: "flex", flexDirection: "row", maxWidth: "1100px" }}
          >
            <IconButton
              sx={{ height: "min-content" }}
              onClick={() => setOpenJournal(!openJournal)}
            >
              {!openJournal ? (
                <KeyboardArrowDownIcon />
              ) : (
                <KeyboardArrowUpIcon />
              )}
            </IconButton>
            {paramsFilter.type === "journal" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "95%",
                }}
              >
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Box
                    component="img"
                    sx={{ height: "32px", mr: 1 }}
                    src={getCurrentJournal?.emoji?.emojiLink}
                  />
                  <Typography
                    variant="h6"
                    noWrap={journalWrap}
                    sx={{ wordBreak: "break-word" }}
                  >
                    {getCurrentJournal?.title}
                  </Typography>
                </div>
                {openJournal && (
                  <Typography
                    gutterBottom
                    variant="body1"
                    sx={{ wordBreak: "break-word" }}
                  >
                    {getCurrentJournal?.description}
                  </Typography>
                )}
                {openJournal && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Button
                      value="Изменить"
                      aria-label="change"
                      color="inherit"
                      onClick={changeJournal}
                      variant="text"
                      startIcon={<CreateIcon />}
                    >
                      Изменить
                    </Button>
                    <Button
                      value="Удалить"
                      aria-label="delete"
                      color="inherit"
                      onClick={deleteJournal}
                      variant="text"
                      startIcon={<RestoreFromTrashIcon />}
                    >
                      Удалить
                    </Button>
                  </div>
                )}
              </div>
            )}
            {paramsFilter.type === "tag" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "95%",
                }}
              >
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <SellIcon />
                  <Typography variant="h6" noWrap={journalWrap}>
                    {getCurrentTag?.title}
                  </Typography>
                </div>
                {openJournal && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Button
                      value="Изменить"
                      aria-label="change"
                      color="inherit"
                      onClick={changeTag}
                      variant="text"
                      startIcon={<CreateIcon />}
                    >
                      Изменить
                    </Button>
                    <Button
                      value="Удалить"
                      aria-label="delete"
                      color="inherit"
                      onClick={deleteTag}
                      variant="text"
                      startIcon={<RestoreFromTrashIcon />}
                    >
                      Удалить
                    </Button>
                  </div>
                )}
              </div>
            )}
          </MainText>
        </div>
      )}
      <div
        style={{
          display: "block",
          margin: "auto",
          height: "50px",
          width: "100%",
          maxWidth: "1100px",
        }}
      >
        <MainText open={open}>
          <div
            style={{
              display: "block",
              margin: "auto",
              width: "50%",
              minWidth: "150px",
            }}
          >
            <Button
              value="Добавить новую запись"
              aria-label="change"
              color="primary"
              onClick={() => {
                setTypeNoteAction({
                  type: "create-note",
                  note: {
                    title: "",
                    content: "",
                    journal: getCurrentJournal
                      ? JSON.stringify({
                          title: getCurrentJournal.title,
                          journal_id: getCurrentJournal.journal_id,
                        })
                      : JSON.stringify({
                          title: journals[journals.length - 1]?.title,
                          journal_id: journals[journals.length - 1]?.journal_id,
                        }),
                    tags: [],
                  },
                });
                handleDrawerOpen();
              }}
              sx={{ width: "100%" }}
              variant="contained"
              disabled={open ? true : false}
              startIcon={<AddIcon />}
            >
              Новая запись
            </Button>
          </div>
        </MainText>
      </div>
      <Box
        style={{
          display: "block",
          margin: "auto",
          width: "90%",
          minWidth: "300px",
        }}
      >
        {loadingNote && (
          <CircularProgress
            sx={{ display: "inline-block", margin: "auto", width: "100%" }}
          />
        )}
        <MainText open={open}>
          {notes?.length > 0 &&
            localeNotes.map((note, index) => {
              const paramRef =
                localeNotes.length === index + 1
                  ? { ref: lastNoteElementRef }
                  : null;
              return !mobilePosition ? (
                <Grid
                  {...paramRef}
                  key={note.note_id}
                  container
                  sx={{
                    margin: "20px 0",
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Grid md={3} item>
                    <Box
                      sx={{
                        mb: 3,
                        display: "flex",
                        width: "max-content",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h4">
                          {note.create_date.getHours() / 10 >= 1
                            ? note.create_date.getHours()
                            : "0" + note.create_date.getHours()}
                        </Typography>
                        <Typography variant="h4">{`:`}</Typography>
                        <Typography variant="h4">
                          {note.create_date.getMinutes() / 10 >= 1
                            ? note.create_date.getMinutes()
                            : "0" + note.create_date.getMinutes()}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {`${
                          note.create_date.getUTCDate() / 10 >= 1
                            ? note.create_date.getUTCDate()
                            : "0" + note.create_date.getUTCDate()
                        }.${
                          (note.create_date.getUTCMonth() + 1) / 10 >= 1
                            ? +note.create_date.getUTCMonth() + 1
                            : "0" + (+note.create_date.getUTCMonth() + 1)
                        }.${note.create_date.getFullYear()}`}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid md={9} item>
                    <Grid container spacing={2}>
                      <Grid md={12} sx={{ width: "100%" }} item>
                        <Typography
                          variant="h6"
                          sx={{ wordBreak: "break-word" }}
                        >
                          {note.title}
                        </Typography>
                      </Grid>
                      <Grid md={12} sx={{ width: "100%" }} item>
                        <div>
                          <RichTextReadOnly
                            content={note.content}
                            extensions={extensions}
                          />
                        </div>
                      </Grid>
                      <Grid md={12} item>
                        {note.update_date.getFullYear() !== 1970 && (
                          <div
                            style={{
                              display: "flex",
                              width: "100%",
                              justifyContent: "right",
                            }}
                          >
                            <Typography variant="body1">
                              {` UPD: ${
                                note.update_date.getHours() / 10 >= 1
                                  ? note.update_date.getHours()
                                  : "0" + note.update_date.getHours()
                              } : ${
                                note.update_date.getMinutes() / 10 >= 1
                                  ? note.update_date.getMinutes()
                                  : "0" + note.update_date.getMinutes()
                              } ${
                                note.update_date.getUTCDate() / 10 >= 1
                                  ? note.update_date.getUTCDate()
                                  : "0" + note.update_date.getUTCDate()
                              }.${
                                (note.update_date.getUTCMonth() + 1) / 10 >= 1
                                  ? +note.update_date.getUTCMonth() + 1
                                  : "0" + (+note.update_date.getUTCMonth() + 1)
                              }.${note.update_date.getFullYear()}`}
                            </Typography>
                          </div>
                        )}
                      </Grid>
                      <Grid md={12} sx={{ width: "100%" }} item>
                        <ImageList gap={12} {...colsImage}>
                          {(() => {
                            return (
                              files.filter(
                                (file) => +file.note_id === +note.note_id
                              )[0]?.paths &&
                              files
                                .filter(
                                  (file) => +file.note_id === +note.note_id
                                )[0]
                                ?.paths.map((item) => (
                                  <ImageListItem key={item.file_id}>
                                    <img
                                      style={{
                                        width: "80%",
                                        height: "30vmin",
                                        borderRadius: "10%",
                                      }}
                                      src={`${
                                        config.API_URL + "/static/" + item.path
                                      }`}
                                      alt={`${
                                        config.API_URL + "/static/" + item.path
                                      }`}
                                      loading="lazy"
                                      onClick={() => {
                                        setChoiceImage({
                                          file_id: item.file_id,
                                          path: item.path,
                                        });
                                        setOpenImageDialog(true);
                                      }}
                                    />
                                  </ImageListItem>
                                ))
                            );
                          })()}
                        </ImageList>
                      </Grid>
                      <Grid md={12} sx={{ width: "100%" }} item>
                        <Stack direction="row" flexWrap="wrap" spacing={1}>
                          {tags.length > 0 &&
                            tags
                              .filter((tag) =>
                                note.tags.find(
                                  (tagInNote) => tag.tag_id === tagInNote.tag_fk
                                )
                              )
                              .slice(0, 15)
                              .map((tag) => (
                                <Chip
                                  key={tag.tag_id}
                                  icon={<SellIcon />}
                                  label={tag.title}
                                />
                              ))}
                        </Stack>
                      </Grid>
                      <Grid md={12} sx={{ width: "100%" }} item>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <Button
                            value="Изменить"
                            aria-label="change"
                            color="inherit"
                            onClick={() => {
                              setTypeNoteAction({
                                type: "update-note",
                                note: {
                                  title: note.title,
                                  content: notes.find(
                                    (note_el) =>
                                      note_el.note_id === note.note_id
                                  ).content,
                                  journal: JSON.stringify({
                                    title: journals.find(
                                      (journal) =>
                                        journal.journal_id === note.journal_fk
                                    )?.title,
                                    journal_id: note.journal_fk,
                                  }),
                                  tags: note.tags.map((tag) =>
                                    JSON.stringify(
                                      tags.find(
                                        (tag_el) => tag_el.tag_id === tag.tag_fk
                                      )
                                    )
                                  ),
                                  create_date: notes.find(
                                    (note_) => note_.note_id === note.note_id
                                  ).create_date,
                                  note_id: note.note_id,
                                },
                                files: files.find(
                                  (file) => +file.note_id === +note.note_id
                                )?.paths,
                              });
                              handleDrawerOpen();
                            }}
                            sx={{ ...(open && { display: "none" }) }}
                            variant="text"
                            startIcon={<CreateIcon />}
                          >
                            Изменить
                          </Button>
                          <Button
                            value="Удалить"
                            aria-label="delete"
                            color="inherit"
                            onClick={() => handleDeleteNote(note.note_id)}
                            sx={{ ...(open && { display: "none" }) }}
                            variant="text"
                            startIcon={<RestoreFromTrashIcon />}
                          >
                            Удалить
                          </Button>
                        </Box>
                      </Grid>
                      {errorNote && (
                        <Grid md={12} item>
                          Ошибка
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                <Grid
                  {...paramRef}
                  key={note.note_id}
                  container
                  sx={{
                    margin: "20px 0",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Grid md={12} sx={{ width: "100%" }} item>
                    <Box
                      sx={{
                        mb: 3,
                        display: "flex",
                        width: "max-content",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h4">
                          {note.create_date.getHours() / 10 >= 1
                            ? note.create_date.getHours()
                            : "0" + note.create_date.getHours()}
                        </Typography>
                        <Typography variant="h4">{`:`}</Typography>
                        <Typography variant="h4">
                          {note.create_date.getMinutes() / 10 >= 1
                            ? note.create_date.getMinutes()
                            : "0" + note.create_date.getMinutes()}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {`${
                          note.create_date.getUTCDate() / 10 >= 1
                            ? note.create_date.getUTCDate()
                            : "0" + note.create_date.getUTCDate()
                        }.${
                          (note.create_date.getUTCMonth() + 1) / 10 >= 1
                            ? +note.create_date.getUTCMonth() + 1
                            : "0" + (+note.create_date.getUTCMonth() + 1)
                        }.${note.create_date.getFullYear()}`}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid md={12} sx={{ width: "100%" }} item>
                    <Typography variant="h6" sx={{ wordBreak: "break-word" }}>
                      {note.title}
                    </Typography>
                  </Grid>
                  <Grid md={12} sx={{ width: "100%" }} item>
                    <div>
                      <RichTextReadOnly
                        content={note.content}
                        extensions={extensions}
                      />
                    </div>
                  </Grid>
                  <Grid md={12} item>
                    {note.update_date.getFullYear() !== 1970 && (
                      <div
                        style={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "right",
                        }}
                      >
                        <Typography variant="body1">
                          {` UPD: ${
                            note.update_date.getHours() / 10 >= 1
                              ? note.update_date.getHours()
                              : "0" + note.update_date.getHours()
                          } : ${
                            note.update_date.getMinutes() / 10 >= 1
                              ? note.update_date.getMinutes()
                              : "0" + note.update_date.getMinutes()
                          } ${
                            note.update_date.getUTCDate() / 10 >= 1
                              ? note.update_date.getUTCDate()
                              : "0" + note.update_date.getUTCDate()
                          }.${
                            (note.update_date.getUTCMonth() + 1) / 10 >= 1
                              ? +note.update_date.getUTCMonth() + 1
                              : "0" + (+note.update_date.getUTCMonth() + 1)
                          }.${note.update_date.getFullYear()}`}
                        </Typography>
                      </div>
                    )}
                  </Grid>
                  <Grid md={12} sx={{ width: "100%" }} item>
                    <ImageList gap={12} {...colsImage}>
                      {(() => {
                        return (
                          files.filter(
                            (file) => +file.note_id === +note.note_id
                          )[0]?.paths &&
                          files
                            .filter(
                              (file) => +file.note_id === +note.note_id
                            )[0]
                            ?.paths.map((item) => (
                              <ImageListItem key={item.file_id}>
                                <img
                                  style={{
                                    width: "80%",
                                    height: "30vmin",
                                    borderRadius: "10%",
                                  }}
                                  src={`${
                                    config.API_URL + "/static/" + item.path
                                  }`}
                                  alt={`${
                                    config.API_URL + "/static/" + item.path
                                  }`}
                                  loading="lazy"
                                  onClick={() => {
                                    setChoiceImage({
                                      file_id: item.file_id,
                                      path: item.path,
                                    });
                                    setOpenImageDialog(true);
                                  }}
                                />
                              </ImageListItem>
                            ))
                        );
                      })()}
                    </ImageList>
                  </Grid>
                  <Grid md={12} sx={{ width: "100%" }} item>
                    <Stack direction="row" flexWrap="wrap" spacing={1}>
                      {tags.length > 0 &&
                        tags
                          .filter((tag) =>
                            note.tags.find(
                              (tagInNote) => tag.tag_id === tagInNote.tag_fk
                            )
                          )
                          .slice(0, 15)
                          .map((tag) => (
                            <Chip
                              key={tag.tag_id}
                              icon={<SellIcon />}
                              label={tag.title}
                            />
                          ))}
                    </Stack>
                  </Grid>
                  <Grid md={12} sx={{ width: "100%" }} item>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        value="Изменить"
                        aria-label="change"
                        color="inherit"
                        onClick={() => {
                          setTypeNoteAction({
                            type: "update-note",
                            note: {
                              title: note.title,
                              content: notes.find(
                                (note_el) => note_el.note_id === note.note_id
                              ).content,
                              journal: JSON.stringify({
                                title: journals.find(
                                  (journal) =>
                                    journal.journal_id === note.journal_fk
                                )?.title,
                                journal_id: note.journal_fk,
                              }),
                              tags: note.tags.map((tag) =>
                                JSON.stringify(
                                  tags.find(
                                    (tag_el) => tag_el.tag_id === tag.tag_fk
                                  )
                                )
                              ),
                              create_date: notes.find(
                                (note_) => note_.note_id === note.note_id
                              ).create_date,
                              note_id: note.note_id,
                            },
                            files: files.find(
                              (file) => +file.note_id === +note.note_id
                            )?.paths,
                          });
                          handleDrawerOpen();
                        }}
                        sx={{ ...(open && { display: "none" }) }}
                        variant="text"
                        startIcon={<CreateIcon />}
                      >
                        Изменить
                      </Button>
                      <Button
                        value="Удалить"
                        aria-label="delete"
                        color="inherit"
                        onClick={() => handleDeleteNote(note.note_id)}
                        sx={{ ...(open && { display: "none" }) }}
                        variant="text"
                        startIcon={<RestoreFromTrashIcon />}
                      >
                        Удалить
                      </Button>
                    </Box>
                  </Grid>
                  {loadingNote && (
                    <Grid md={12} item>
                      ...Загрузка
                    </Grid>
                  )}
                  {errorNote && (
                    <Grid md={12} item>
                      Ошибка
                    </Grid>
                  )}
                </Grid>
              );
            })}
        </MainText>
      </Box>
      <Drawer
        sx={{
          [theme.breakpoints.up("sm")]: {
            width: "0",
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: "40vw",
              boxSizing: "border-box",
            },
          },
          [theme.breakpoints.down("sm")]: {
            width: "0",
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: "100vw",
              boxSizing: "border-box",
            },
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        {journals.length > 0 && Object.keys(typeNoteAction).length !== 0 ? (
          <Editor
            handlerDrawerClose={() => handleDrawerClose()}
            note={typeNoteAction.note}
            type={typeNoteAction.type}
            files={typeNoteAction.files}
          />
        ) : (
          <Button
            onClick={() => {
              handleDrawerClose();
              createNewJournal();
            }}
          >
            Создать журнал
          </Button>
        )}
      </Drawer>
      <Dialog
        fullWidth
        open={openNewJournalUpdateDialog}
        onClose={() => {
          cancelChangeJournal();
        }}
      >
        <DialogCreateJournal
          type="update-journal"
          cancelCreateNewJournal={() => cancelChangeJournal()}
          defaultValues={{ ...getCurrentJournal }}
        />
        <DialogActions>
          <Button
            onClick={() => {
              cancelChangeJournal();
            }}
          >
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        open={openNewTagDialog}
        onClose={() => {
          cancelChangeTag();
        }}
      >
        <DialogCreateTag
          type="update-tag"
          cancelCreateNewTag={() => cancelChangeTag()}
          defaultValues={{
            ...getCurrentTag,
            selectJournal: JSON.stringify({ ...getCurrentTag?.selectJournal }),
          }}
        />
        <DialogActions>
          <Button
            onClick={() => {
              cancelChangeTag();
            }}
          >
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        open={openNewJournalCreateDialog}
        onClose={() => {
          cancelCreateNewJournal();
        }}
      >
        <DialogCreateJournal
          cancelCreateNewJournal={() => cancelCreateNewJournal()}
        />
        <DialogActions>
          <Button
            onClick={() => {
              cancelCreateNewJournal();
            }}
          >
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        open={openDeleteJournalDialog}
        onClose={() => {
          cancelDeleteJournal();
        }}
      >
        <DialogTitle>Удаление журнала</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`При удаление журнала все данные будут потеряны!\nВы уверены, что хотите удалить журнал «${getCurrentJournal?.title}»?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              cancelDeleteJournal();
            }}
          >
            Нет
          </Button>
          <Button
            onClick={() => {
              agreeDeleteJournal();
              navigate("/main");
            }}
          >
            Да
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        open={openDeleteTagDialog}
        onClose={() => {
          cancelDeleteTag();
        }}
      >
        <DialogTitle>Удаление тега</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Вы уверены, что хотите удалить тег «${getCurrentTag?.title}»?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              cancelDeleteTag();
            }}
          >
            Нет
          </Button>
          <Button
            onClick={() => {
              agreeDeleteTag();
              navigate("/main");
            }}
          >
            Да
          </Button>
        </DialogActions>
      </Dialog>
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
              justifyContent: "end",
            }}
          >
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
              src={`${config.API_URL + "/static/" + choiceImage.path}`}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
