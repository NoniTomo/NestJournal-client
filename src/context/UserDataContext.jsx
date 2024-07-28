import {
  createContext,
  useState,
  useReducer,
  useEffect,
  useContext,
} from "react";
import { AuthContext, RequestClient } from "./AuthContext.jsx";
import showErrorMessage from "../utils/showErrorMessage.js";
import inMemoryJWT from "../services/inMemoryJWT";

export const UserDataContext = createContext({});

function tagsReducer(state, action) {
  switch (action.type) {
    case "create-tag": {
      return [
        ...state,
        {
          tag_id: action.tag.tag_id,
          title: action.tag.title,
          selectJournal: {
            title: action.tag.selectJournal.title,
            journal_id: action.tag.selectJournal.journal_id,
          },
        },
      ];
    }
    case "delete-tag": {
      return state.filter((tag) => {
        return +action.tag_id !== +tag.tag_id;
      });
    }
    case "update-tag": {
      return state.map((item) => {
        if (+item.tag_id !== +action.tag.tag_id) {
          return item;
        } else {
          return {
            tag_id: action.tag.tag_id,
            title: action.tag.title,
            selectJournal: {
              title: action.tag.selectJournal.title,
              journal_id: action.tag.selectJournal.journal_id,
            },
          };
        }
      });
    }
    case "get-tags": {
      return [...action.data];
    }
    default: {
      showErrorMessage();
    }
  }
}
function notesReducer(state, action) {
  switch (action.type) {
    case "create-note": {
      return [
        ...state,
        {
          note_id: action.note.note_id,
          create_date: action.note.create_date,
          update_date: action.note.update_date,
          title: action.note.title,
          content: action.note.content,
          journal_fk: action.note.journal_fk,
          tags: action.note.tags,
        },
      ];
    }
    case "delete-note": {
      return state.filter((note) => {
        return +action.note_id !== +note.note_id;
      });
    }
    case "update-note": {
      return state.map((item) => {
        if (+item.note_id !== +action.note.note_id) {
          return item;
        } else {
          return {
            note_id: action.note.note_id,
            create_date: action.note.create_date,
            update_date: action.note.update_date,
            title: action.note.title,
            content: action.note.content,
            journal_fk: action.note.journal_fk,
            tags: action.note.tags,
          };
        }
      });
    }
    case "get-notes": {
      const insertData = state.filter(
        (el) =>
          action.data.findIndex((el_) => el_.note_id === el.note_id) === -1
      );
      return [...action.data, ...insertData];
    }
    case "delete-notes": {
      return [];
    }
    default: {
      showErrorMessage();
    }
  }
}
function filesReducer(state, action) {
  switch (action.type) {
    case "get-files": {
      return [...state, ...action.data];
    }
    case "delete-files": {
      return state.filter((file) => +file.note_id !== +action.note_id);
    }
    case "update-files": {
      return state.map((item) => {
        if (+item.note_id !== +action.note_id) {
          return item;
        } else {
          return {
            note_id: action.note_id,
            paths: action.files,
          };
        }
      });
    }
    default: {
      showErrorMessage();
    }
  }
}
function journalsReducer(state, action) {
  switch (action.type) {
    case "create-journal": {
      return [
        ...state,
        {
          journal_id: action.journal.journal_id,
          title: action.journal.title,
          description: action.journal.description,
          emoji: {
            emojiValue: action.journal.emoji.emojiValue,
            emojiLink: action.journal.emoji.emojiLink,
          },
        },
      ];
    }
    case "delete-journal": {
      return state.filter((journal) => {
        return +action.journal_id !== +journal.journal_id;
      });
    }
    case "update-journal": {
      return state.map((item) => {
        if (+item.journal_id !== +action.journal.journal_id) {
          return item;
        } else {
          return {
            journal_id: action.journal.journal_id,
            title: action.journal.title,
            description: action.journal.description,
            emoji: {
              emojiValue: action.journal.emoji.emojiValue,
              emojiLink: action.journal.emoji.emojiLink,
            },
          };
        }
      });
    }
    case "get-journals": {
      return [...action.data];
    }
    default: {
      showErrorMessage();
    }
  }
}

function UserDataProvider({ children }) {
  const [journals, dispatchJournals] = useReducer(journalsReducer, []);
  const [tags, dispatchTags] = useReducer(tagsReducer, []);
  const [notes, dispatchNotes] = useReducer(notesReducer, []);
  const [files, dispatchFiles] = useReducer(filesReducer, []);
  const [notesCount, setNotesCount] = useState(0);
  const [filesCount, setFilesCount] = useState(0);
  const [email, setEmail] = useState("");
  const [emailVerify, setEmailVerify] = useState(false);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");

  const [hasMoreNotes, setHasMoreNotes] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [errorNote, setErrorNote] = useState(false);

  const { handleLogOut } = useContext(AuthContext);

  useEffect(() => {
    if (!!notes.length) handleGetNotesCount();
    if (!!files.length) handleGetFilesCount();
  }, [notes]);

  const handleUpdateEmail = async ({ data, loading }) => {
    return await RequestClient.patch("update-email", {
      title: data.title,
    })
      .then((_) => {
        setEmail(data.title);
        setEmailVerify(false);
        loading();
      })
      .catch((error) => {
        showErrorMessage(error);
        loading();
      });
  };
  const handleUpdateUsername = async ({ data, loading }) => {
    await RequestClient.patch("update-username", {
      title: data.title,
    })
      .then((_) => {
        setUsername(data.title);
        loading();
      })
      .catch((error) => {
        showErrorMessage(error);
        loading();
      });
  };
  const handleUpdatePassword = async ({ data, loading }) => {
    await RequestClient.patch("update-password", {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    })
      .then((_) => {
        loading();
      })
      .catch((error) => {
        showErrorMessage(error);
        loading();
      });
  };
  const handleGetUsername = async () => {
    await RequestClient.get("/get-username")
      .then((res) => {
        setUsername(res.data.username);
      })
      .catch((error) => {
        showErrorMessage(error);
      });
  };
  const handleGetEmail = async () => {
    await RequestClient.get("/get-email")
      .then((res) => {
        setEmail(res.data.email);
        setEmailVerify(res.data.is_activated);
      })
      .catch((error) => {
        showErrorMessage(error);
      });
  };
  const handleGetNotesCount = async () => {
    await RequestClient.get(`/notes-count`)
      .then(async (res) => {
        setNotesCount(res.data.count);
      })
      .catch((error) => {
        showErrorMessage(error);
      });
  };
  const handleGetFilesCount = async () => {
    await RequestClient.get(`/file/files-count`)
      .then(async (res) => {
        setFilesCount(res.data.count);
      })
      .catch((error) => {
        showErrorMessage(error);
      });
  };
  const handleCreateJournal = async ({ title, description, emoji }) => {
    const result = await RequestClient.post(`/journal/create`, {
      title: title,
      description: description,
      icon: emoji.emojiValue,
      icon_link: emoji.emojiLink,
    })
      .then(async (res) => {
        dispatchJournals({
          type: "create-journal",
          journal: {
            journal_id: res.data.journal_id,
            title: title,
            description: description,
            emoji: {
              emojiValue: emoji.emojiValue,
              emojiLink: emoji.emojiLink,
            },
          },
        });
        return res.data;
      })
      .catch((error) => {
        showErrorMessage(error);
      });
    return result;
  };
  const handleUpdateJournal = async ({
    journal_id,
    title,
    description,
    emoji,
  }) => {
    const result = await RequestClient.patch(`/journal/${journal_id}/update`, {
      title: title,
      description: description,
      icon: emoji.emojiValue,
      icon_link: emoji.emojiLink,
    })
      .then((_) => {
        dispatchJournals({
          type: "update-journal",
          journal: {
            journal_id: journal_id,
            title: title,
            description: description,
            emoji: {
              emojiValue: emoji.emojiValue,
              emojiLink: emoji.emojiLink,
            },
          },
        });
      })
      .catch((error) => {
        showErrorMessage(error);
      });

    return result;
  };
  const handleDeleteJournal = async (journal_id) => {
    await RequestClient.delete(`/journal/${journal_id}/delete`)
      .then(async (_) => {
        dispatchJournals({
          type: "delete-journal",
          journal_id: journal_id,
        });
        await handleGetTags();
      })
      .catch((error) => {
        showErrorMessage(error);
      });
  };
  const handleGetJournals = async () => {
    await RequestClient.get(`/journal/get-journals`)
      .then((res) => {
        dispatchJournals({
          type: "get-journals",
          data: res.data,
        });
      })
      .catch((error) => {
        showErrorMessage(error);
      });
  };
  const getConcreteNote = async ({ note_id }) => {
    const data = await RequestClient.get(`/get-note/${note_id}`, {
      note_id,
    }).then((res) => {
      return res.data;
    });
    return data;
  };
  const handleCreateTag = async ({ title, selectJournal }) => {
    const result = await RequestClient.post(`/tag/create`, {
      title,
      journal_id: selectJournal.journal_id,
    })
      .then(async (res) => {
        dispatchTags({
          type: "create-tag",
          tag: {
            tag_id: res.data.tag_id,
            title: title,
            selectJournal: {
              title: selectJournal.title,
              journal_id: selectJournal.journal_id,
            },
          },
        });
        return res.data;
      })
      .catch((error) => {
        showErrorMessage(error);
      });
    return result;
  };
  const handleUpdateTag = async ({ tag_id, title, selectJournal }) => {
    const result = await RequestClient.patch(`/tag/${tag_id}/update`, {
      title,
      journal_id: selectJournal.journal_id,
    })
      .then((_) => {
        dispatchTags({
          type: "update-tag",
          tag: {
            tag_id: tag_id,
            title: title,
            selectJournal: {
              title: selectJournal.title,
              journal_id: selectJournal.journal_id,
            },
          },
        });
      })
      .catch((error) => {
        showErrorMessage(error);
      });

    return result;
  };
  const handleDeleteTag = async (tag_id) => {
    await RequestClient.delete(`/tag/${tag_id}/delete`)
      .then((_) => {
        dispatchTags({
          type: "delete-tag",
          tag_id: tag_id,
        });
      })
      .catch((error) => {
        showErrorMessage(error);
      });
  };
  const handleGetTags = async () => {
    await RequestClient.get(`/tag/get-tags`)
      .then((res) => {
        const data = res.data.map((tag) => {
          const selectJournal =
            tag.journal_title && tag.journal_fk
              ? { title: tag.journal_title, journal_id: tag.journal_fk }
              : { title: "Все", journal_id: null };
          return {
            tag_id: tag.tag_id,
            title: tag.title,
            selectJournal: { ...selectJournal },
          };
        });
        dispatchTags({
          type: "get-tags",
          data: data,
        });
      })
      .catch((error) => {
        showErrorMessage(error);
      });
  };

  const handleCreateFeedback = async ({ title, content }) => {
    await RequestClient.post(`/feedback/send`, {
      title,
      content,
    }).catch((error) => {
      showErrorMessage(error);
    });
  };

  const handleGetNotes = async ({ paramsNote, pageNumber }) => {
    setLoadingNote(() => true);
    setErrorNote(false);
    await RequestClient.get(`/get-notes`, {
      params: { ...paramsNote, page: pageNumber },
    })
      .then((res) => {
        dispatchNotes({
          type: "get-notes",
          data: res.data.data_notes,
        });
        dispatchFiles({
          type: "get-files",
          data: res.data.files,
        });
        setHasMoreNotes(res.data.data_notes.length > 0);
        setLoadingNote(() => false);
      })
      .catch((error) => {
        setErrorNote(true);
        showErrorMessage(error);
      });
  };
  const handleCreateNote = async ({
    save,
    close,
    formData,
    title,
    content,
    journal,
    tags,
  }) => {
    formData.append("title", JSON.stringify(title));
    formData.append("content", JSON.stringify(content));
    formData.append("journal", JSON.stringify(journal));
    formData.append("tags", JSON.stringify(tags));

    await RequestClient.post(`/note/create`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        if (save) {
          dispatchNotes({
            type: "create-note",
            note: {
              note_id: res.data.note_id,
              create_date: res.data.create_date,
              update_date: null,
              title: title,
              content: content,
              journal_fk: journal.journal_id,
              tags: tags.map((tag) => {
                return { tag_fk: tag.tag_id };
              }),
            },
          });
          dispatchFiles({
            type: "get-files",
            data: res.data.files,
          });
        }
        close();
      })
      .catch((error) => {
        showErrorMessage(error);
      });
  };
  const handleUpdateNote = async ({
    save,
    close,
    note_id,
    title,
    formData,
    create_date,
    content,
    journal,
    tags,
    files_old,
  }) => {
    formData.append("note_id", JSON.stringify(note_id));
    formData.append("title", JSON.stringify(title));
    formData.append("create_date", JSON.stringify(create_date));
    formData.append("content", JSON.stringify(content));
    formData.append("journal", JSON.stringify(journal));
    formData.append("tags", JSON.stringify(tags));
    formData.append("files_old", JSON.stringify(files_old));

    await RequestClient.patch(`/note/${note_id}/update`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        if (save) {
          dispatchNotes({
            type: "update-note",
            note: {
              note_id: note_id,
              create_date: create_date,
              update_date: res.data.update_date,
              title: title,
              content: content,
              journal_fk: journal.journal_id,
              tags: tags.map((tag) => {
                return { tag_fk: tag.tag_id };
              }),
            },
          });
          const files =
            res.data.files.length > 0
              ? [...files_old, ...res.data.files[0]?.paths]
              : [...files_old];
          dispatchFiles({
            type: "update-files",
            note_id: note_id,
            files: files,
          });
        } else {
          dispatchNotes({
            type: "delete-note",
            note_id: note_id,
          });
          dispatchFiles({
            type: "delete-files",
            note_id: note_id,
          });
        }
        close();
      })
      .catch((error) => {
        showErrorMessage(error);
      });
  };
  const handleDeleteNote = async (note_id) => {
    await RequestClient.delete(`/note/${note_id}/delete`)
      .then((_) => {
        dispatchNotes({
          type: "delete-note",
          note_id: note_id,
        });
        dispatchFiles({
          type: "delete-files",
          note_id: note_id,
        });
      })
      .catch((error) => {
        showErrorMessage(error);
      });
  };
  const handleChangeLocation = () => {
    dispatchNotes({
      type: "delete-notes",
      data: [],
    });
  };
  const handleDeleteAccount = async () => {
    await handleLogOut();
    await RequestClient.delete(`/delete-account`).catch((error) => {
      showErrorMessage(error);
    });
  };
  const handleGetPDFData = async ({
    journal_id,
    cancelDownloadData,
    loading,
  }) => {
    try {
      const accessToken = inMemoryJWT.getToken();
      const response = await fetch("http://localhost:8090/main/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ journal_id }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "all_data.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); // Clean up URL object after download
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      loading();
      cancelDownloadData();
    }
  };
  const handleChangeAvatar = async ({ formData, loading }) => {
    await RequestClient.post(`/update-avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        setAvatar(res.data.avatar);
      })
      .catch((error) => {
        showErrorMessage(error);
      })
      .finally(() => {
        loading();
      });
  };
  const handleGetAvatar = async () => {
    await RequestClient.get(`/get-avatar`)
      .then((res) => {
        setAvatar(res.data.avatar);
      })
      .catch((error) => {
        showErrorMessage(error);
      });
  };
  const handleGetNewActivationLink = async () => {
    await RequestClient.get("/get-new-activation-link")
      .then((_) => {})
      .catch((error) => {
        showErrorMessage(error);
      });
  };

  return (
    <UserDataContext.Provider
      value={{
        journals,
        tags,
        notes,

        handleGetJournals,
        handleCreateJournal,
        handleUpdateJournal,
        handleDeleteJournal,

        handleGetTags,
        handleCreateTag,
        handleUpdateTag,
        handleDeleteTag,

        handleCreateFeedback,

        handleGetNotes,
        errorNote,
        loadingNote,
        setLoadingNote,
        hasMoreNotes,
        handleCreateNote,
        handleUpdateNote,
        handleDeleteNote,
        handleChangeLocation,

        notesCount,
        handleGetNotesCount,
        email,
        emailVerify,
        handleGetEmail,
        handleUpdateEmail,
        username,
        handleGetUsername,
        handleUpdateUsername,

        handleUpdatePassword,
        handleDeleteAccount,
        handleGetPDFData,
        handleChangeAvatar,
        handleGetAvatar,
        avatar,

        files,
        filesCount,
        getConcreteNote,
        handleGetNewActivationLink,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

export default UserDataProvider;
