import { useCallback, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StateSnapshot, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useAccount, useNotifications } from '@plebbit/plebbit-react-hooks';
import styles from './inbox.module.css';
import Reply from '../../components/reply/reply';
import { isInboxCommentRepliesView, isInboxPostRepliesView, isInboxUnreadView } from '../../lib/utils/view-utils';
import { useTranslation } from 'react-i18next';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const InboxTabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInInboxCommentRepliesView = isInboxCommentRepliesView(location.pathname);
  const isInInboxPostRepliesView = isInboxPostRepliesView(location.pathname);
  const isInInboxUnreadView = isInboxUnreadView(location.pathname);
  const isInAllView = !isInInboxCommentRepliesView && !isInInboxPostRepliesView && !isInInboxUnreadView;

  return (
    <div className={styles.inboxTabs}>
      <Link to='/inbox' className={isInAllView ? styles.selected : styles.choice}>
        {t('all')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/inbox/unread' className={isInInboxUnreadView ? styles.selected : styles.choice}>
        {t('unread')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/inbox/commentreplies' className={isInInboxCommentRepliesView ? styles.selected : styles.choice}>
        {t('comment_replies')}
      </Link>
      <span className={styles.separator}>|</span>
      <Link to='/inbox/postreplies' className={isInInboxPostRepliesView ? styles.selected : styles.choice}>
        {t('post_replies')}
      </Link>
    </div>
  );
};

const Inbox = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const { unreadNotificationCount } = account || {};
  const { notifications, markAsRead } = useNotifications();

  const location = useLocation();
  const isInInboxCommentRepliesView = isInboxCommentRepliesView(location.pathname);
  const isInInboxPostRepliesView = isInboxPostRepliesView(location.pathname);
  const isInInboxUnreadView = isInboxUnreadView(location.pathname);

  const filterRepliesToUserReplies = useCallback(() => notifications?.filter((comment) => comment.parentCid !== comment.postCid) || [], [notifications]);

  const filterRepliesToUserPosts = useCallback(() => notifications?.filter((comment) => comment.parentCid === comment.postCid) || [], [notifications]);

  const filterUnreadNotifications = useCallback(() => notifications?.filter((comment) => !comment.markedAsRead) || [], [notifications]);

  let comments;
  if (isInInboxCommentRepliesView) {
    comments = filterRepliesToUserReplies();
  } else if (isInInboxPostRepliesView) {
    comments = filterRepliesToUserPosts();
  } else if (isInInboxUnreadView) {
    comments = filterUnreadNotifications();
  } else {
    comments = notifications;
  }

  // save last virtuoso state on each scroll
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const lastVirtuosoState = lastVirtuosoStates?.[unreadNotificationCount];
  useEffect(() => {
    const setLastVirtuosoState = () =>
      virtuosoRef.current?.getState((snapshot) => {
        // TODO: not sure if checking for empty snapshot.ranges works for all scenarios
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[unreadNotificationCount] = snapshot;
        }
      });
    window.addEventListener('scroll', setLastVirtuosoState);
    // clean listener on unmount
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [unreadNotificationCount]);

  return (
    <div className={styles.content}>
      <InboxTabs />
      <div className={styles.markAllAsReadButton}>
        {account && notifications.length ? (
          <button onClick={markAsRead} disabled={!unreadNotificationCount} className={styles.markAsReadButton}>
            {t('mark_all_read')}
          </button>
        ) : (
          <div className={styles.noNotifications}>{t('nothing_found')}</div>
        )}
      </div>
      <Virtuoso
        increaseViewportBy={{ bottom: 1200, top: 600 }}
        totalCount={notifications?.length || 0}
        data={comments}
        itemContent={(index, notification) => (
          <div className={styles.notification}>
            <Reply index={index} isSingle={true} reply={notification} isNotification={true} />
          </div>
        )}
        useWindowScroll={true}
        ref={virtuosoRef}
        restoreStateFrom={lastVirtuosoState}
        initialScrollTop={lastVirtuosoState?.scrollTop}
      />
    </div>
  );
};

export default Inbox;
