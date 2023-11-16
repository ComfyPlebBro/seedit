import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './account-bar.module.css';

const AccountBar = () => {
  const account = useAccount();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { subplebbitAddress } = useParams();
  const [searchVisible, setSearchVisible] = useState(false);
  const searchBarRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  let submitLink;

  if (location.pathname.startsWith(`/p/${subplebbitAddress}/`)) {
    submitLink = `/p/${subplebbitAddress}/submit`;
  } else {
    submitLink = '/submit';
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (searchBarRef.current && event.target instanceof Node && !searchBarRef.current.contains(event.target)) {
      setSearchVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchVisible]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchInput = searchInputRef.current?.value;
    if (searchInput) {
      setSearchVisible(false);
      searchInputRef.current.value = '';
      navigate(`/p/${searchInput}`);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <span className={styles.user}>
          <Link to='/user' onClick={(e) => e.preventDefault()}>
            {account?.author?.shortAddress}
          </Link>
        </span>
        <span className={styles.separator}>|</span>
        <Link to={submitLink} className={styles.textButton}>
          {t('submit')}
        </Link>
        <span className={styles.separator}>|</span>
        <Link to='/settings' className={styles.iconButton} onClick={(e) => e.preventDefault()}>
          ✉️
        </Link>
        <span className={styles.separator}>|</span>
        <span className={styles.iconButton} onClick={() => setSearchVisible(true)}>
          🔎
        </span>
        <span className={styles.separator}>|</span>
        <Link to='/settings' className={styles.textButton}>
          {t('preferences')}
        </Link>
      </div>
      <form className={`${styles.searchBar} ${!searchVisible ? styles.searchBarHidden : styles.searchBarVisible}`} ref={searchBarRef} onSubmit={handleSearchSubmit}>
        <input type='text' placeholder={`"community.eth" ${t('or')} "12D3KooW..."`} ref={searchInputRef} />
        <input type='submit' value='' />
      </form>
    </>
  );
};

export default AccountBar;
