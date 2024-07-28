
import {useState} from 'react';
import Box from '@mui/material/Box';
import {Divider, Menu, MenuItem, Typography} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { Avatar } from '@mui/material';
import { useLocation } from 'react-router-dom';

import LogoutIcon from '@mui/icons-material/Logout.js';
import SettingsIcon from '@mui/icons-material/Settings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import InfoIcon from '@mui/icons-material/Info';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';

import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { UserDataContext } from '../../context/UserDataContext.jsx';
import { ColorModeContext } from '../../index.js';
import config from '../../config.js';

export default function CustomAvatar ({setOpen, handleOpenFeedback}){
    const { username, avatar } = useContext(UserDataContext);
    const [anchorElUser, setAnchorElUser] = useState(false);
    const { handleLogOut } = useContext(AuthContext)
    const navigate = useNavigate();
    const location = useLocation();
    const colorMode = useContext(ColorModeContext);

    const [srcProp, setSrcProp] = useState({});
    useEffect(() => {
      if (avatar !== '') setSrcProp({src: config.API_URL + '/static/' + avatar})
    }, [avatar])

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(true);
    }
    const handleCloseUserMenu = (event) => {
        setAnchorElUser(false);
    }

    const settings = [
        { id: 1, name: 'Настройки', selected: location.pathname === '/main/settings' ? true : false, icon: (<SettingsIcon />), onSubmit: () => {
            setOpen(false);
            navigate('settings');
        }}, 
        { id: 2, name: 'Сообщить о проблеме', selected: location.pathname === '/main/new-feedback' ? true : false, icon: (<SupportAgentIcon />), onSubmit: () => {
            setOpen(false);
            handleOpenFeedback(location.pathname);
        }}, 
        { id: 3, name: 'О приложении', selected: location.pathname === '/main/about' ? true : false, icon: (<InfoIcon/>), onSubmit: () => {
            setOpen(false);
            navigate('about');
        }}, 
        { id: 4, name: 'Сменить тему', icon: (<ChangeCircleIcon/>), onSubmit: () => {
            colorMode.toggleColorMode();
        }}, 
        { id: 5, name: 'Выйти', selected: false, icon: (<LogoutIcon/>), onSubmit: () =>{
            handleLogOut();
            setOpen(false);
            navigate('../sign-in', { replace: true });
        }}, 
    ];

    return (
    <Box sx={{flexGrow: 1, width: '80%'}}>
        <Tooltip sx={{width: '100%'}}>
            <Button onClick={handleOpenUserMenu} startIcon={<Avatar {...srcProp} alt={username} />}>
            <Typography
                variant="body1"
                noWrap
                sx={{
                    fontFamily: 'monospace',
                    fontWeight: 100,
                    letterSpacing: '.1rem',
                    textDecoration: 'none',
                }}
            >{username}</Typography>
            </Button>
        </Tooltip>
        <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
        >
            {settings.map((setting) => {
                const styles = (setting.name === "Сменить тему") ? {display: {xs: 'block', sm: 'block', md: 'none', lg: 'none', xl: 'none'}} : {display: 'block'};
                return (
                <MenuItem 
                    key={setting.id}
                    component='form' 
                    onClick={(event) => {
                        event.preventDefault();
                        handleCloseUserMenu();
                        setting.onSubmit();
                    }}
                    disabled={setting.selected}
                    sx={{...styles}}
                >
                    <Box sx={{display: { xs: 'flex'}}}>
                        {setting.name === "Выйти" && <Divider />}
                        {setting.icon}
                        <Typography 
                        sx={{
                            fontWeight: 200,
                            letterSpacing: '.05rem',
                            textDecoration: 'none',
                            }}
                        textAlign="center"
                        >{setting.name}</Typography>
                    </Box>
                </MenuItem>
            )})}
        </Menu>
    </Box>
    )
}   

/*import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext, themes } from '../../context/AppSettingsContext.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';
import Button from '../Button/Button.jsx';
import ToggleTheme from '../ToggleTheme/ToggleTheme.jsx';
import styles from './header.module.scss';
import { UserDataContext } from '../../context/UserDataContext.jsx';

export default function Header () {
    const { theme, setTheme  } = useContext(ThemeContext);
    const { handleLogOut } = useContext(AuthContext)
    const { userdata } = useContext(UserDataContext);
    const navigate = useNavigate();

    return (
        <div className={styles.header}>
            <div className={styles["header__user-avatar"]}>
            </div>
            <div className={styles["header__user-name"]}>
                {userdata.username}
            </div>
            <div className={styles["header__app-name"]}>
                YouJournal
            </div>
            <ToggleTheme
                onChange={() => {
                    if (theme === themes.light) setTheme(themes.dark)
                    if (theme === themes.dark) setTheme(themes.light)
                }}
                value={theme === themes.dark}
            />
            <form 
                className={styles['header__logout-button']} 
                onSubmit={(e) =>{
                    e.preventDefault();
                    handleLogOut();
                    navigate('../sign-in', { replace: true })
                }
            }>
                <Button type="submit">
                    Выйти
                </Button>
            </form>
        </div>
    )
}*/