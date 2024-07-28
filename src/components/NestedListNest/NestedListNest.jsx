import * as React from "react";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Dialog from "@mui/material/Dialog";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { UserDataContext } from "../../context/UserDataContext";
import { useLocation, useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";

import AddIcon from "@mui/icons-material/Add";
import DialogCreateJournal from "../DialogCreateJournal/DialogCreateJournal";
import DialogCreateTag from "../DialogCreateTag/DialogCreateTag";
import Box from "@mui/material/Box";
import TagIcon from "@mui/icons-material/Tag";

const nameJournal = "Журналы";
const nameTags = "Теги";

export function NestedListJournals({ handleDrawerClose }) {
  const { journals } = React.useContext(UserDataContext);
  return (
    <NestedList
      handleDrawerClose={handleDrawerClose}
      listName={nameJournal}
      data={journals}
    />
  );
}

export function NestedListTags({ handleDrawerClose }) {
  const { tags } = React.useContext(UserDataContext);
  const location = useLocation();
  const checkLocation =
    location.search !== "" &&
    location.search.slice(1).split("=")[0] === "journal";

  return (
    <NestedList
      handleDrawerClose={handleDrawerClose}
      listName={nameTags}
      data={
        checkLocation
          ? tags.filter(
              (tag) =>
                +tag.selectJournal.journal_id ===
                  +location.search.slice(1).split("=")[1] ||
                tag.selectJournal.journal_id == null
            )
          : tags
      }
    />
  );
}
/*
const options = [
    {name: 'Редактировать'},
    {name: 'Удалить'}
]
*/
function NestedList({ listName, data, handleDrawerClose }) {
  const [open, setOpen] = React.useState(false);
  const [openNewJournalDialog, setOpenNewJournalDialog] = React.useState(false);
  const [openNewTagDialog, setOpenNewTagDialog] = React.useState(false);

  const navigate = useNavigate();

  const handleClick = () => {
    setOpen(!open);
  };

  function createNewJournal() {
    setOpenNewJournalDialog(true);
  }

  function createNewTags() {
    setOpenNewTagDialog(true);
  }

  function cancelCreateNewJournal() {
    setOpenNewJournalDialog(false);
  }

  function cancelCreateNewTag() {
    setOpenNewTagDialog(false);
  }

  function handleCreate({ event, listName }) {
    event.stopPropagation();
    switch (listName) {
      case nameJournal: {
        createNewJournal();
        break;
      }
      case nameTags: {
        createNewTags();
        break;
      }
      default:
        console.error(
          "Ошибка при создании нового элемента в компоненте NestedListNest"
        );
    }
  }

  return (
    <>
      <ListItemButton onClick={handleClick}>
        {open ? <ExpandLess /> : <ExpandMore />}
        <ListItemText primary={listName} />
        <IconButton
          aria-label="Создать"
          onClick={(event) => {
            handleCreate({ event, listName });
          }}
        >
          <AddIcon />
        </IconButton>
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {data.length ? (
            data.map((element) => (
              <ListItemButton
                key={
                  listName === "Журналы" ? element.journal_id : element.tag_id
                }
                onClick={async (e) => {
                  await handleDrawerClose();

                  navigate(
                    `.?${listName === "Журналы" ? "journal" : "tag"}=${
                      listName === "Журналы"
                        ? element.journal_id
                        : element.tag_id
                    }`
                  );
                }}
                sx={{
                  pl: 4,
                  "& .addMenuButtons": {
                    display: "none",
                  },
                  "& .countTypography": {
                    display: "block",
                  },
                  "& :hover": {
                    "& .addMenuButtons": {
                      display: "block",
                    },
                    "& .countTypography": {
                      display: "none",
                    },
                  },
                }}
              >
                {listName === "Журналы" && (
                  <Box
                    component="img"
                    sx={{ width: "1.5rem", mr: 1 }}
                    src={element?.emoji?.emojiLink}
                  />
                )}
                {listName === "Теги" && <TagIcon />}
                <ListItemText>
                  <Typography noWrap variant="body1">
                    {element.title}
                  </Typography>
                </ListItemText>
                <Typography
                  className="countTypography"
                  sx={{ width: "min-content" }}
                >
                  {element.count}
                </Typography>
              </ListItemButton>
            ))
          ) : (
            <ListItemButton disabled>
              <ListItemText
                sx={{ ml: "1.5rem" }}
              >{`У вас ещё нет ${listName.slice(0, -1)}ов`}</ListItemText>
            </ListItemButton>
          )}
        </List>
      </Collapse>
      <Dialog
        fullWidth
        open={openNewJournalDialog}
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
        open={openNewTagDialog}
        onClose={() => {
          cancelCreateNewTag();
        }}
      >
        <DialogCreateTag cancelCreateNewTag={() => cancelCreateNewTag()} />
        <DialogActions>
          <Button
            onClick={() => {
              cancelCreateNewTag();
            }}
          >
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
