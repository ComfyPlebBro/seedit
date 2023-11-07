import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePublishComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import styles from './submit.module.css';
import useCurrentView from '../../hooks/use-current-view';
import challengesStore from '../../hooks/use-challenges';
import { alertChallengeVerificationFailed, isValidENS, isValidIPFS, isValidURL } from '../../lib/utils';

type SubmitStoreState = {
  subplebbitAddress: string | undefined;
  title: string | undefined;
  content: string | undefined;
  link: string | undefined;
  publishCommentOptions: any;
  setSubmitStore: (data: Partial<SubmitStoreState>) => void;
  resetSubmitStore: () => void;
};

const { addChallenge } = challengesStore.getState();

const useSubmitStore = create<SubmitStoreState>((set) => ({
  subplebbitAddress: undefined,
  title: undefined,
  content: undefined,
  link: undefined,
  publishCommentOptions: undefined,
  setSubmitStore: ({ subplebbitAddress, title, content, link }) =>
    set((state) => {
      const nextState = { ...state };
      if (subplebbitAddress !== undefined) nextState.subplebbitAddress = subplebbitAddress;
      if (title !== undefined) nextState.title = title;
      if (content !== undefined) nextState.content = content;
      if (link !== undefined) nextState.link = link;

      nextState.publishCommentOptions = {
        ...nextState,
        onChallenge: (...args: any) => addChallenge(args),
        onChallengeVerification: alertChallengeVerificationFailed,
        onError: (error: Error) => {
          console.error(error);
          alert(error.message);
        },
      };
      return nextState;
    }),
  resetSubmitStore: () => set({ subplebbitAddress: undefined, title: undefined, content: undefined, link: undefined, publishCommentOptions: undefined }),
}));

const Submit = () => {
  const { t } = useTranslation();
  const { isSubplebbitSubmitView } = useCurrentView();
  const params = useParams();
  const paramsSubplebbitAddress = params.subplebbitAddress;
  const subplebbit = useSubplebbit({ subplebbitAddress: paramsSubplebbitAddress });
  const navigate = useNavigate();

  const { subplebbitAddress, title, link, publishCommentOptions, setSubmitStore, resetSubmitStore } = useSubmitStore();

  const { index, publishComment } = usePublishComment(publishCommentOptions);

  const onPublish = () => {
    if (!title) {
      alert(`Missing title`);
      return;
    }
    if (link && !isValidURL(link)) {
      alert(`Invalid URL`);
      return;
    }
    if (!subplebbitAddress) {
      alert(`Missing community address`);
      return;
    }
    if (!isValidENS(subplebbitAddress) && !isValidIPFS(subplebbitAddress)) {
      alert(`Invalid community address`);
      return;
    }

    publishComment();
  };

  const subLocation = (
    <Link to={`/p/${subplebbitAddress}`} className={styles.location} onClick={(e) => e.preventDefault()}>
      {subplebbit?.title || subplebbit?.shortAddress}
    </Link>
  );

  useEffect(() => {
    if (typeof index === 'number') {
      resetSubmitStore();
      navigate(`/profile/${index}`);
    }
  }, [index, resetSubmitStore, navigate]);

  return (
    <div className={styles.content}>
      <h1>
        {t('submit_to_before')}
        {isSubplebbitSubmitView ? subLocation : 'seedit'}
        {t('submit_to_after')}
      </h1>
      <div className={styles.form}>
        <div className={styles.formContent}>
          <div className={styles.field}>
            <span className={styles.fieldTitleOptional}>url</span>
            <span className={styles.optional}> ({t('optional')})</span>
            <div className={styles.fieldContent}>
              <input
                className={`${styles.input} ${styles.inputUrl}`}
                type='text'
                onChange={(e) => setSubmitStore({ link: e.target.value || undefined, subplebbitAddress: !subplebbitAddress ? params.subplebbitAddress : undefined })}
              />
              <div className={styles.description}>{t('submit_url_description')}</div>
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldTitleRequired}>{t('title')}</span>
            <div className={styles.fieldContent}>
              <textarea
                className={`${styles.input} ${styles.inputTitle}`}
                onChange={(e) => setSubmitStore({ title: e.target.value || undefined, subplebbitAddress: !subplebbitAddress ? params.subplebbitAddress : undefined })}
              />
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldTitleOptional}>{t('text')}</span>
            <span className={styles.optional}> ({t('optional')})</span>
            <div className={styles.fieldContent}>
              <textarea
                className={`${styles.input} ${styles.inputText}`}
                onChange={(e) => setSubmitStore({ content: e.target.value || undefined, subplebbitAddress: !subplebbitAddress ? params.subplebbitAddress : undefined })}
              />
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldTitleRequired}>{t('submit_choose')}</span>
            <div className={styles.fieldContent}>
              <span className={styles.fieldSubtitle}>{t('community_address')}:</span>
              <input
                className={`${styles.input} ${styles.inputCommunity}`}
                type='text'
                placeholder='"community.eth" or "12D3KooW..."'
                defaultValue={isSubplebbitSubmitView ? subplebbitAddress : undefined}
                onChange={(e) => setSubmitStore({ subplebbitAddress: e.target.value || undefined })}
              />
            </div>
          </div>
          <div className={`${styles.field} ${styles.notice}`}>{t('submit_notice')}</div>
          <div>*{t('required')}</div>
          <div className={styles.submit}>
            <button className={styles.submitButton} onClick={onPublish}>
              {t('submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submit;
