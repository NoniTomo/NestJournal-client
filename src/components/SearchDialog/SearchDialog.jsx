import { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import DialogContent from "@mui/material/DialogContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Chip from "@mui/material/Chip";
import { UserDataContext } from "../../context/UserDataContext";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Divider,
  Pagination,
  PaginationItem,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import { useTheme } from "@emotion/react";

import { Link as NavLink, useLocation, useNavigate } from "react-router-dom";
import { RequestClient } from "../../context/AuthContext";

const defaulJournal = JSON.stringify({ title: "Все", journal_id: null });

export default function SearchDialog() {
  const theme = useTheme();
  const [selectedJournal, setSelectedJournal] = useState(defaulJournal);
  const [selectedTags, setSelectedTags] = useState([]);
  const { journals, tags } = useContext(UserDataContext);
  let location = useLocation();
  let navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(
    parseInt(location.search?.split("=")[1] || 1)
  );
  const [pageQty, setPageQty] = useState(0);

  useEffect(() => {
    let req = `search?query=${query}&page=${page - 1}`;
    if (JSON.parse(selectedJournal).journal_id !== null)
      req += `&journal=${JSON.parse(selectedJournal).journal_id}`;
    if (selectedTags.length !== 0)
      for (let tag of selectedTags) req += `&tag=${JSON.parse(tag).tag_id}`;
    RequestClient.get(req).then(({ data }) => {
      setPosts(data.data_notes);
      setPageQty(data.nbPages);
      if (data.nbPages < page) {
        setPage(1);
        navigate();
      }
    });
  }, [query, selectedTags, selectedJournal, page, navigate]);

  const handleChangeJournal = (event) => {
    setSelectedJournal(event.target.value);
  };

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

  function getStyles(name, selectedTags, theme) {
    return {
      fontWeight:
        selectedTags.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  const handleChangeTags = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedTags(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <DialogContent>
      <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }}>
        <TextField
          type="search"
          label="Найти"
          autoFocus
          value={query}
          margin="dense"
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          variant="standard"
          sx={{ m: 1, width: "97%" }}
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
            <Select
              sx={{ width: "100%", paddingRight: 4, height: "100%" }}
              labelId="select-journal-label"
              id="select-journal"
              value={selectedJournal}
              onChange={(event) => {
                setSelectedJournal(event.target.value);
                setSelectedTags([]);
              }}
              label="Журнал"
              renderValue={() => JSON.parse(selectedJournal).title}
              defaultValue=""
            >
              <MenuItem
                key={0}
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
          </FormControl>
          <FormControl sx={{ width: "100%" }}>
            <InputLabel id="demo-multiple-chip-label_note">Теги</InputLabel>
            <Select
              sx={{ width: "100%", paddingRight: 4 }}
              labelId="demo-multiple-chip-label_note"
              id="demo-multiple-chip"
              multiple
              value={selectedTags}
              onChange={(event) => handleChangeTags(event)}
              input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
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
                .filter((tag) =>
                  JSON.parse(selectedJournal).journal_id !== null
                    ? tag.selectJournal.journal_id ===
                        JSON.parse(selectedJournal).journal_id ||
                      tag.selectJournal.journal_id === null
                    : true
                )
                .map((tag) => (
                  <MenuItem
                    key={tag.tag_id}
                    value={JSON.stringify(tag)}
                    style={getStyles(tag.title, selectedTags, theme)}
                  >
                    <Typography maxWidth={400} noWrap>
                      {tag.title}
                    </Typography>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
        <Divider />
        <Stack sx={{ width: "100%", justifyContent: "center" }} spacing={2}>
          {!!pageQty && (
            <Pagination
              count={pageQty}
              page={page}
              onChange={(_, num) => setPage(num)}
              showFirstButton
              showLastButton
              sx={{ marginY: 3, marginX: "auto" }}
              renderItem={(item) => (
                <PaginationItem
                  component={NavLink}
                  to={`?page=${item.page}`}
                  {...item}
                />
              )}
            />
          )}
          {posts.map((note) => {
            let content = "";
            let contentFlag = true;
            for (let i = 0; i < note.content?.length; i++) {
              if (note.content[i] === "<") contentFlag = false;
              if (contentFlag) content += note.content[i];
              if (note.content[i] === ">") contentFlag = true;
            }
            return (
              <Card
                key={note.note_id}
                onClick={() =>
                  navigate("/main", {
                    state: { closeSearchDialog: true, note: note },
                  })
                }
              >
                <CardContent>
                  <Typography variant="р6" component="div" noWrap>
                    {note.title}
                  </Typography>
                  <Divider />
                  <Typography variant="body2" noWrap>
                    {content}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Перейти к записи</Button>
                </CardActions>
              </Card>
            );
          })}
        </Stack>
      </Box>
    </DialogContent>
  );
}
