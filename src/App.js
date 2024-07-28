
import { useContext } from 'react';
import './index.css';

import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';

import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MainAppPage from './pages/MainAppPage';
import ResetPassword from './pages/ResetPassword';
import { SnackbarProvider } from 'notistack';
import { AuthContext } from './context/AuthContext';
import SearchDialog from './components/SearchDialog/SearchDialog.jsx';
import Settings from './pages/Settings.jsx';
import About from './pages/About.jsx';
import Files from './pages/Files.jsx';
import NewPassword from './pages/NewPassword.jsx';

function App() { 
  return (
    <>
      <SnackbarProvider />
      <BrowserRouter>
        <Routes>
          <Route path='main' element={
            <RequireAuth redirectTo='/sign-in'>
              <MainAppPage/>
            </RequireAuth>
          }>
            <Route path="search" element={<SearchDialog />}/>
            <Route path="about" element={<About />}/>
            <Route path="settings" element={<Settings />}/>
            <Route path="files" element={<Files />}/>
          </Route>
          <Route path='sign-up' element={<SignUp/>}/>
          <Route path='sign-in' element={<SignIn/>}/>
          <Route path='reset-password' element={<ResetPassword/>}/>
          <Route path='auth/reset-password-link/:link' element={<NewPassword/>}/>
          <Route path='*' element={<Navigate to='main'/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

function RequireAuth({ children, redirectTo }) {
    const { isUserLogged } = useContext(AuthContext);
    return isUserLogged ? (children) : (<Navigate to={redirectTo} />);
}

/*
function App() {

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <div className={styles["header__user-avatar", "avatar"]}><img className={styles.avatar} src='https://oir.mobi/uploads/posts/2020-04/1586459530_43-p-koti-v-ochkakh-68.jpg'/></div>
                <div className={styles["header__user-name"]}>Сингтон</div>
                <div className={styles["header__app-name"]}>YouJournal</div>
                <div className={styles["header__toggle-theme"]}><input type="checkbox"/></div>
                <div className={styles["header__logout-button"]}><Button type="submit">Выйти</Button></div>
            </div>
            <form class={styles.search__form}>
                <input className={styles.search__input} />
            </form>
            <div className={styles.nav}>
                <ul className="nav__li">
                    <li className="nav__list"><a>Понедельник</a></li>
                    <li className="nav__list"><a>Вторник</a></li>
                    <li className="nav__list"><a>Среда</a></li>
                    <li className="nav__list"><a>Понедельник</a></li>
                    <li className="nav__list"><a>Вторник</a></li>
                    <li className="nav__list"><a>Среда</a></li>
                    <li className="nav__list"><a>Понедельник</a></li>
                    <li className="nav__list"><a>Вторник</a></li>
                    <li className="nav__list"><a>Среда</a></li>
                    <li className="nav__list"><a>Понедельник</a></li>
                    <li className="nav__list"><a>Вторник</a></li>
                    <li className="nav__list"><a>Среда</a></li>
                </ul>
            </div>
            <div className={styles.todos}>
                <ul className={styles.todos__ul}>
                    <li className={styles.todos__li}>
                        <p className={styles.todos__text}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit</p>
                        <input className={styles.todos__chekbox} type="checkbox"/>
                    </li>
                    <li className={styles.todos__li}>
                        <p className={styles.todos__text}>Lorem ipsum dolor sit amet, consectetur adipisicing elit</p>
                        <input className={styles.todos__chekbox} type="checkbox"/>
                    </li>
                    <li className={styles.todos__li}>
                        <p className={styles.todos__text}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit</p>
                        <input className={styles.todos__chekbox} type="checkbox"/>
                    </li>
                    <li className={styles.todos__li}>
                        <p className={styles.todos__text}>Lorem ipsum dolor sit amet, consectetur adipisicing elit</p>
                        <input className={styles.todos__chekbox} type="checkbox"/>
                    </li>
                    <li className={styles.todos__li}>
                        <p className={styles.todos__text}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit</p>
                        <input className={styles.todos__chekbox} type="checkbox"/>
                    </li>
                    <li className={styles.todos__li}>
                        <p className={styles.todos__text}>Lorem ipsum dolor sit amet, consectetur adipisicing elit</p>
                        <input className={styles.todos__chekbox} type="checkbox"/>
                    </li>
                    <li className={styles.todos__li}>
                        <p className={styles.todos__text}>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit</p>
                        <input className={styles.todos__chekbox} type="checkbox"/>
                    </li>
                    <li className={styles.todos__li}>
                        <p className={styles.todos__text}>Lorem ipsum dolor sit amet, consectetur adipisicing elit</p>
                        <input className={styles.todos__chekbox} type="checkbox"/>
                    </li>
                </ul>
            </div>
            <div className={styles.wrapper__footer}>YouJournal v0.0.1</div>
        </div>
    )
}

export default App;
*/