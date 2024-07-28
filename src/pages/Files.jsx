import { useState, useEffect, useRef, useCallback } from "react";
import {
  ImageListItem,
  Grid,
  Typography,
  ImageList,
  useMediaQuery,
  Box,
  CircularProgress,
} from "@mui/material";
import { useContext } from "react";
import { UserDataContext } from "../context/UserDataContext";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";

import { styled } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useLocation } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

import config from "../config";

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

export default function Notes() {
  const {
    notes,
    errorNote,
    loadingNote,
    hasMoreNotes,
    handleGetNotes,
    handleChangeLocation,
    files,
  } = useContext(UserDataContext);

  let location = useLocation();

  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [choiceImage, setChoiceImage] = useState({});

  const closeImageDialog = () => {
    setOpenImageDialog(false);
  };

  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isMiddleScreen = useMediaQuery((theme) =>
    theme.breakpoints.between("sm", "md")
  );

  const colsImage = { cols: isSmallScreen ? 2 : isMiddleScreen ? 3 : 4 };
  const [localeNotes, setLocaleNotes] = useState([]);

  const [pageNumberNote, setPageNumberNote] = useState(1);
  const [paramsNote, setParamsNote] = useState(null);

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
    const newNotes = notes
      .filter(
        (note) =>
          files.filter((file) => +file.note_id === +note.note_id)[0]?.paths
            .length > 0
      )
      .reduce((newNotes, note) => {
        const create_date = new Date(note.create_date);
        const update_date = new Date(note.update_date);
        let content = "";
        let contentFlag = true;
        for (let i = 0; i < note.content?.length; i++) {
          if (note.content[i] === "<") contentFlag = false;
          if (contentFlag) content += note.content[i];
          if (note.content[i] === ">") contentFlag = true;
        }
        return [
          {
            ...note,
            content: content,
            update_date: update_date,
            create_date: create_date,
          },
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

  return (
    <>
      <CssBaseline />
      <Box
        style={{
          display: "block",
          margin: "auto",
          width: "90%",
          minWidth: "400px",
        }}
      >
        {loadingNote && <CircularProgress sx={{ justifyContent: "center" }} />}
        <MainText open={false}>
          {notes?.length > 0 ? (
            localeNotes.map((note, index) => {
              const paramRef =
                localeNotes.length === index + 1
                  ? { ref: lastNoteElementRef }
                  : null;
              return (
                (files.filter((file) => +file.note_id === +note.note_id)[0]
                  ?.paths.length > 0 ||
                  paramRef) && (
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
                        <Grid md={12} item>
                          <ImageList gap={12} {...colsImage}>
                            {files.filter(
                              (file) => +file.note_id === +note.note_id
                            )[0]?.paths &&
                              files
                                .filter(
                                  (file) => +file.note_id === +note.note_id
                                )[0]
                                .paths.map((item) => (
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
                                ))}
                          </ImageList>
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
                    </Grid>
                  </Grid>
                )
              );
            })
          ) : (
            <Typography>У вас пока нет файлов</Typography>
          )}
        </MainText>
      </Box>
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
