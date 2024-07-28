import { useState, useContext } from "react";
import { UserDataContext } from "../../context/UserDataContext";
import {
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

const defaulJournal = JSON.stringify({ title: "Все", journal_id: null });

export default function DialogChoiceJournals({ cancelDownloadData }) {
  const { handleGetPDFData, journals } = useContext(UserDataContext);
  const [selectedJournal, setSelectedJournal] = useState(defaulJournal);

  const [loadingButtonDownload, setLoadingDownloadButton] = useState(false);
  const onSubmit = () => {
    const journal_id =
      JSON.parse(selectedJournal).journal_id !== null
        ? JSON.parse(selectedJournal).journal_id
        : null;
    handleGetPDFData({
      journal_id,
      cancelDownloadData: () => cancelDownloadData(),
      loading: () => setLoadingDownloadButton(false),
    });
    setLoadingDownloadButton(true);
  };

  return (
    <>
      <DialogContent>
        <FormControl sx={{ width: "100%" }}>
          <InputLabel id="select-journal-label">Журнал</InputLabel>
          <Select
            sx={{ width: "100%", paddingRight: 4, height: "100%" }}
            labelId="select-journal-label"
            id="select-journal"
            value={selectedJournal}
            onChange={(event) => {
              setSelectedJournal(event.target.value);
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
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelDownloadData}>Отмена</Button>
        {!loadingButtonDownload ? (
          <Button onClick={onSubmit} sx={{ width: "7rem", height: "3.5rem" }}>
            Загрузить
          </Button>
        ) : (
          <Button
            sx={{ width: "7rem", height: "3.5rem" }}
            disabled
            variant="text"
            type="submit"
          >
            <CircularProgress />
          </Button>
        )}
      </DialogActions>
    </>
  );
}
