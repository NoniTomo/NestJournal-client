import { useContext, useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { UserDataContext } from "../context/UserDataContext";

import Notes from "../components/Notes/Notes.jsx";

import {
  NestedListJournals,
  NestedListTags,
} from "../components/NestedListNest/NestedListNest.jsx";

import CustomAvatar from "../components/CustomAvatar/CustomAvatar.jsx";

import { styled, useTheme } from "@mui/material/styles";
import { Dialog, DialogActions, useMediaQuery } from "@mui/material";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Button from "@mui/material/Button";
import ListSubheader from "@mui/material/ListSubheader";

import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ToggleTheme from "../components/ToggleTheme/ToggleTheme.jsx";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FolderIcon from "@mui/icons-material/Folder";
import { StackIcon } from "../utils/icons.js";

import DialogSendFeedback from "../components/DialogSendFeedback/DialogSendFeedback.jsx";

const drawerWidth = 300;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    [theme.breakpoints.up("sm")]: {
      marginLeft: `-${drawerWidth}px`,
      width: `calc(100% - ${drawerWidth}px)`,
    },
    [theme.breakpoints.down("sm")]: {
      marginLeft: `-100vw`,
      width: `0`,
    },
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function MainAppPage(props) {
  const {
    notes,
    filesCount,
    handleGetJournals,
    handleGetTags,
    notesCount,
    handleGetUsername,
    handleGetAvatar,
  } = useContext(UserDataContext);
  const navigate = useNavigate();
  let location = useLocation();
  const { handleLogOut } = useContext(AuthContext);
  const { isUserLogged } = useContext(AuthContext);

  useEffect(() => {
    if (location.state?.closeSearchDialog) handleCloseSearch();
  }, [location.state]);

  useEffect(() => {
    async function fetch() {
      Promise.all([
        handleGetJournals(),
        handleGetTags(),
        handleGetUsername(),
        handleGetAvatar(),
      ]);
    }

    fetch();
    if (!isUserLogged) navigate("../sign-in", { replace: true });
  }, [isUserLogged]);

  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  useContext(UserDataContext);

  const handleOpenFeedback = (location) => {
    setOpenFeedbackDialog(true);
    return location;
  };
  const handleCloseFeedback = () => {
    setOpenFeedbackDialog(false);
  };

  const handleOpenSearch = () => {
    setOpenSearch(true);
    setOpen(false);
  };
  const handleCloseSearch = () => {
    setOpenSearch(false);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const menuItems = [
    {
      name: "Все записи",
      disabled: !(location.pathname !== "/main" || location.search !== ""),
      onClick: () => {
        handleDrawerClose();
        navigate("/main");
      },
      icon: <StackIcon />,
    },
    {
      name: "Все файлы",
      disabled: location.pathname === "/main/files",
      onClick: () => {
        handleDrawerClose();
        navigate("files");
      },
      icon: <FolderIcon />,
    },
  ];

  const isMiddleScreen = useMediaQuery((theme) =>
    theme.breakpoints.between("sm", "lg")
  );
  const isLargeScreen = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const variantDrawer = {
    variant: isMiddleScreen ? "temporary" : "persistent",
    onClose: handleDrawerClose,
  };
  const variantMain = {
    open: isLargeScreen ? open : "",
  };

  if (location.pathname.includes("/main/search") && !openSearch)
    handleOpenSearch();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" {...variantMain}>
        <Toolbar sx={{ display: "flex" }}>
          <IconButton
            color="inherit"
            aria-label="Показать меню"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            sx={{ flexGrow: 1, justifyContent: "center", cursor: "pointer" }}
            variant="h6"
            noWrap
            component="div"
            onClick={() => {
              navigate("main");
            }}
          >
            NoteNest
          </Typography>
          <ToggleTheme />
          <Box
            sx={{
              p: 0,
              display: {
                xs: "none",
                sm: "none",
                md: "flex",
                lg: "flex",
                xl: "flex",
              },
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogOut();
                navigate("../sign-in", { replace: true });
              }}
            >
              <Button type="submit" variant="contained">
                Выйти
              </Button>
            </form>
          </Box>
        </Toolbar>
        <Container
          maxWidth={false}
          sx={{
            overflow: "auto",
            height: "95vh",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {location.pathname !== "/main/about" &&
          location.pathname !== "/main/settings" &&
          location.pathname !== "/main/files" ? (
            <Notes />
          ) : (
            <Outlet />
          )}
        </Container>
      </AppBar>
      <Drawer
        sx={{
          [theme.breakpoints.up("sm")]: {
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          },
          [theme.breakpoints.down("sm")]: {
            width: "100vw",
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: "100vw",
              boxSizing: "border-box",
            },
          },
        }}
        {...variantDrawer}
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <CustomAvatar
            handleOpenFeedback={handleOpenFeedback}
            setOpen={setOpen}
          />
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "1ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List id="back-to-top-anchor">
          {menuItems.map((setting) => (
            <ListItemButton
              sx={{ display: "flex" }}
              key={setting.name}
              onClick={setting.onClick}
              disabled={setting.disabled}
            >
              <ListItemIcon>{setting.icon}</ListItemIcon>
              <ListItemText sx={{ flexGrow: 1 }}>{setting.name}</ListItemText>
              {setting.name === "Все записи" && notes.length > 0 && (
                <Typography sx={{ width: "min-content" }}>
                  {notesCount}
                </Typography>
              )}
              {setting.name === "Все файлы" && filesCount > 0 && (
                <Typography sx={{ width: "min-content" }}>
                  {filesCount}
                </Typography>
              )}
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <List
          sx={{ width: "100%" }}
          component="nav"
          aria-labelledby="nested-list-subheader"
          subheader={
            <ListSubheader
              sx={{ bgcolor: "rgba(255, 255, 255, 0)" }}
              component="div"
              id="nested-list-subheader"
            >
              Мои дневники
            </ListSubheader>
          }
        >
          <ListItemButton
            onClick={() => {
              handleOpenSearch();
              navigate("./search");
            }}
          >
            <ListItemIcon>
              <SearchRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Найти" />
          </ListItemButton>
          <NestedListJournals handleDrawerClose={handleDrawerClose} />
          <NestedListTags handleDrawerClose={handleDrawerClose} />
        </List>
      </Drawer>
      <Dialog
        fullWidth
        open={openSearch}
        onClose={handleCloseSearch}
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            handleCloseSearch();
          },
        }}
      >
        <Outlet />
        <DialogActions>
          <Button
            onClick={() => {
              navigate("/main");
              handleCloseSearch();
            }}
          >
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        open={openFeedbackDialog}
        onClose={() => {
          handleCloseFeedback();
        }}
      >
        <DialogSendFeedback handleCloseFeedback={handleCloseFeedback} />
        <DialogActions>
          <Button
            onClick={(event) => {
              event.preventDefault();
              handleCloseFeedback();
            }}
          >
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
