import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAccount, useAccountComments, useAccountSubplebbits, AccountSubplebbit, useAuthor, useAuthorComments, useSubplebbits } from '@plebbit/plebbit-react-hooks';
import { getShortAddress } from '@plebbit/plebbit-js';
import styles from './author-sidebar.module.css';
import { getFormattedDuration } from '../../lib/utils/time-utils';
import { isAuthorView, isProfileView } from '../../lib/utils/view-utils';
import { findAuthorSubplebbits } from '../../lib/utils/user-utils';
import { useDefaultSubplebbitAddresses } from '../../lib/utils/addresses-utils';

interface AuthorModeratingListProps {
  accountSubplebbits: AccountSubplebbit[];
  authorSubplebbits: string[];
  isAuthor?: boolean;
}

const AuthorModeratingList = ({ accountSubplebbits, authorSubplebbits, isAuthor = false }: AuthorModeratingListProps) => {
  const subplebbitAddresses = isAuthor ? authorSubplebbits : Object.keys(accountSubplebbits);

  return (
    subplebbitAddresses.length > 0 && (
      <div className={styles.modList}>
        <div className={styles.modListTitle}>moderator of</div>
        <ul className={`${styles.modListContent} ${styles.modsList}`}>
          {subplebbitAddresses.map((address, index) => (
            <li key={index}>
              <Link to={`/p/${address}`}>p/{getShortAddress(address)}</Link>
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

const AuthorSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { authorAddress, commentCid } = useParams() || {};

  const isAuthorPage = isAuthorView(location.pathname);
  const isProfilePage = isProfileView(location.pathname);

  const profileAccount = useAccount();
  const { accountComments } = useAccountComments();
  const { accountSubplebbits } = useAccountSubplebbits();
  const profileOldestAccountTimestamp = accountComments?.[0]?.timestamp || Date.now();

  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();
  const accountSubscriptions = profileAccount?.subscriptions || [];
  const subscriptionsAndDefaults = [...accountSubscriptions, ...defaultSubplebbitAddresses];
  const subplebbits = useSubplebbits({ subplebbitAddresses: subscriptionsAndDefaults });

  const authorAccount = useAuthor({ authorAddress, commentCid });
  const { authorComments } = useAuthorComments({ authorAddress, commentCid });
  const authorOldestCommentTimestamp = authorComments?.[0]?.timestamp || Date.now();
  const authorSubplebbits = findAuthorSubplebbits(authorAddress, subplebbits.subplebbits);

  const address = isAuthorPage ? params?.authorAddress : isProfilePage ? profileAccount?.author?.shortAddress : '';
  const karma = isAuthorPage ? params?.authorAddress : isProfilePage ? profileAccount?.karma : '';
  const { postScore, replyScore } = karma || {};
  const oldestCommentTimestamp = isAuthorPage ? authorOldestCommentTimestamp : isProfilePage ? profileOldestAccountTimestamp : Date.now();
  const displayName = isAuthorPage ? authorAccount?.author?.displayName : isProfilePage ? profileAccount?.author?.displayName : '';

  const showUsernameNotice = () => {
    if (window.confirm('Go to the settings to set a display name.')) {
      navigate('/settings');
    } else {
      return;
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.titleBox}>
        <div className={styles.title}>
          {address}
          {isProfilePage && !displayName && <button onClick={showUsernameNotice}>?</button>}
        </div>
        {displayName && <div className={styles.displayName}>{displayName}</div>}
        {postScore ? (
          <>
            <div>
              <span className={styles.karma}>{postScore}</span> post karma
            </div>
            <div>
              <span className={styles.karma}>{replyScore}</span> comment karma
            </div>
          </>
        ) : null}
        <div className={styles.bottom}>
          <span className={styles.age}>plebbitor for at least {getFormattedDuration(oldestCommentTimestamp)}</span>
        </div>
      </div>
      {Object.keys(accountSubplebbits).length > 0 && (
        <AuthorModeratingList accountSubplebbits={accountSubplebbits} isAuthor={isAuthorPage} authorSubplebbits={authorSubplebbits} />
      )}
    </div>
  );
};

export default AuthorSidebar;
