import { FC, useState } from 'react';
import { Comment } from '@plebbit/plebbit-react-hooks';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './reply.module.css';
import useReplies from '../../hooks/use-replies';
import utils from '../../lib/utils';
import Expando from '../post/expando/';
import ExpandButton from '../post/expand-button/';
import Thumbnail from '../post/thumbnail/';

interface ReplyProps {
  key: number;
  reply: Comment;
}

const Reply: FC<ReplyProps> = ({ reply }) => {
  const {
    author: { shortAddress },
    cid,
    content,
    depth,
    downvoteCount,
    link,
    timestamp,
    upvoteCount,
  } = reply || {};
  const replies = useReplies(reply);
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);
  const commentMediaInfo = utils.getCommentMediaInfoMemoized(reply);
  const hasThumbnail = utils.hasThumbnail(commentMediaInfo, link);
  const { t } = useTranslation();
  let score = upvoteCount - downvoteCount;
  if ((upvoteCount === 0 && downvoteCount === 0) || (upvoteCount === 1 && downvoteCount === 0)) {
    score = 1;
  }
  const scoreTranslation = score === 1 ? t('reply_score_singular') : t('reply_score_plural', { count: score });

  return (
    <div className={styles.reply}>
      <div className={`${styles.replyWrapper} ${depth > 1 && styles.nested}`}>
        <div className={styles.midcol}>
          <div className={`${styles.arrow} ${styles.arrowUp}`} />
          <div className={`${styles.arrow} ${styles.arrowDown}`} />
        </div>
        <div className={styles.entry}>
          <p className={styles.tagline}>
            <span className={styles.expand}>[–]</span>
            <Link
              to='/u/address.eth'
              onClick={(e) => {
                e.preventDefault();
              }}
              className={styles.author}
            >
              {shortAddress}
            </Link>
            <span className={styles.score}>{scoreTranslation}</span>
            &nbsp;
            <span className={styles.time}>{utils.getFormattedTime(timestamp)}</span>
          </p>
          <div className={styles.usertext}>
            {hasThumbnail && <Thumbnail commentCid={cid} />}
            {hasThumbnail && <ExpandButton commentCid={cid} expanded={expanded} hasThumbnail={hasThumbnail} toggleExpanded={toggleExpanded} />}
            {link && (
              <>
                <a href={link} target='_blank' rel='noopener noreferrer'>
                  ({link})
                </a>
                <br />
                <br />
              </>
            )}
            {hasThumbnail && <Expando commentCid={cid} expanded={expanded} showContent={false} />}
            <div className={styles.md}>{content}</div>
          </div>
        </div>
        <ul className={styles.buttons}>
          <li className={styles.button}>
            <span>{t('reply_permalink')}</span>
          </li>
          <li className={styles.button}>
            <span>{t('reply_embed')}</span>
          </li>
          <li className={styles.button}>
            <span>{t('post_save')}</span>
          </li>
          <li className={styles.button}>
            <span>{t('post_report')}</span>
          </li>
          <li className={styles.button}>
            <span>{t('reply_reply')}</span>
          </li>
        </ul>
        {replies.map((reply, index) => (
          <Reply key={index} reply={reply} />
        ))}
      </div>
    </div>
  );
};

export default Reply;