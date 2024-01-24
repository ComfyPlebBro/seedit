import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublishSubplebbitEditOptions, useAccount, useSubplebbit, usePublishSubplebbitEdit } from '@plebbit/plebbit-react-hooks';
import { RolesCollection } from '../../../lib/utils/user-utils';
import { useTranslation } from 'react-i18next';
import { create } from 'zustand';
import styles from './subplebbit-settings.module.css';
import { isValidURL } from '../../../lib/utils/url-utils';
import LoadingEllipsis from '../../../components/loading-ellipsis';
import Sidebar from '../../../components/sidebar';

const isElectron = window.electron && window.electron.isElectron;

type SubplebbitSettingsState = {
  title: string | undefined;
  description: string | undefined;
  address: string | undefined;
  suggested: any | undefined;
  rules: string[] | undefined;
  roles: RolesCollection | undefined;
  settings: any | undefined;
  subplebbitAddress: string | undefined;
  publishSubplebbitEditOptions: PublishSubplebbitEditOptions;
  setSubmitStore: (data: Partial<SubplebbitSettingsState>) => void;
  resetSubplebbitSettingsStore: () => void;
};

const useSubplebbitSettingsStore = create<SubplebbitSettingsState>((set) => ({
  title: undefined,
  description: undefined,
  address: undefined,
  suggested: undefined,
  rules: undefined,
  roles: undefined,
  settings: undefined,
  subplebbitAddress: undefined,
  publishSubplebbitEditOptions: {},
  setSubmitStore: ({ title, description, address, suggested, rules, roles, settings, subplebbitAddress }) =>
    set((state) => {
      const nextState = { ...state };
      if (title !== undefined) nextState.title = title;
      if (description !== undefined) nextState.description = description;
      if (address !== undefined) nextState.address = address;
      if (suggested?.avatarUrl !== undefined) {
        nextState.suggested = { ...state.suggested, avatarUrl: suggested.avatarUrl };
      }
      if (rules !== undefined) nextState.rules = rules;
      if (roles !== undefined) nextState.roles = roles;
      if (settings?.challenges !== undefined) {
        nextState.settings = { ...state.settings, challenges: settings.challenges };
      }
      if (subplebbitAddress !== undefined) nextState.subplebbitAddress = subplebbitAddress;

      nextState.publishSubplebbitEditOptions = {
        ...nextState,
      };

      return nextState;
    }),

  resetSubplebbitSettingsStore: () =>
    set({
      title: undefined,
      description: undefined,
      address: undefined,
      suggested: undefined,
      rules: undefined,
      roles: undefined,
      settings: undefined,
      subplebbitAddress: undefined,
      publishSubplebbitEditOptions: undefined,
    }),
}));

const Title = () => {
  const { t } = useTranslation();
  const { title, setSubmitStore } = useSubplebbitSettingsStore();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('title')}</div>
      <div className={styles.boxSubtitle}>e.g., books: made from trees or pixels. recommendations, news, or thoughts</div>
      <div className={styles.boxInput}>
        <input type='text' value={title ?? ''} onChange={(e) => setSubmitStore({ title: e.target.value })} />
      </div>
    </div>
  );
};

const Description = () => {
  const { t } = useTranslation();
  const { description, setSubmitStore } = useSubplebbitSettingsStore();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('description')}</div>
      <div className={styles.boxSubtitle}>shown in the sidebar of your community</div>
      <div className={styles.boxInput}>
        <textarea value={description ?? ''} onChange={(e) => setSubmitStore({ description: e.target.value })} />
      </div>
    </div>
  );
};

const Address = () => {
  const { t } = useTranslation();
  const { address, setSubmitStore } = useSubplebbitSettingsStore();

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('address')}</div>
      <div className={styles.boxSubtitle}>set a readable community address using ens.domains</div>
      <div className={styles.boxInput}>
        <input type='text' value={address ?? ''} onChange={(e) => setSubmitStore({ title: e.target.value })} />
      </div>
    </div>
  );
};

const Logo = () => {
  const { t } = useTranslation();
  const { suggested, setSubmitStore } = useSubplebbitSettingsStore();

  const [logoUrl, setLogoUrl] = useState(suggested?.avatarUrl);
  const [imageError, setImageError] = useState(false);

  // Update logoUrl when avatarUrl changes
  useEffect(() => {
    setLogoUrl(suggested?.avatarUrl);
    setImageError(false); // Reset the error state as well
  }, [suggested?.avatarUrl]);

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('logo')}</div>
      <div className={styles.boxSubtitle}>set a community logo using its direct image link (ending in .jpg, .png)</div>
      <div className={styles.boxInput}>
        <input
          type='text'
          value={logoUrl ?? ''}
          onChange={(e) => {
            setLogoUrl(e.target.value);
            setImageError(false);
            setSubmitStore({ suggested: { ...suggested, avatarUrl: e.target.value } });
          }}
        />
        {logoUrl && isValidURL(logoUrl) && (
          <div className={styles.logoPreview}>
            preview:
            {imageError ? <span className={styles.logoError}>no image found</span> : <img src={logoUrl} alt='logo preview' onError={() => setImageError(true)} />}
          </div>
        )}
      </div>
    </div>
  );
};

const Rules = () => {
  const { t } = useTranslation();
  const { rules, setSubmitStore } = useSubplebbitSettingsStore();
  const lastRuleRef = useRef(null);

  const handleRuleChange = (index: number, newRule: string) => {
    const updatedRules = [...(rules ?? [])];
    updatedRules[index] = newRule;
    setSubmitStore({ rules: updatedRules });
  };

  const addRule = () => {
    const newRules = rules ? [...rules, ''] : [''];
    setSubmitStore({ rules: newRules });

    setTimeout(() => {
      (lastRuleRef.current as any).focus();
    }, 0);
  };

  const deleteRule = (index: number) => {
    if (rules) {
      const filteredRules = rules.filter((_, i) => i !== index);
      setSubmitStore({ rules: filteredRules });
    }
  };

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('rules')}</div>
      <div className={styles.boxSubtitle}>shown in the sidebar of your community</div>
      <div className={styles.boxInput}>
        <button className={styles.addButton} onClick={addRule}>
          Add a Rule
        </button>
        {rules?.map((rule, index) => (
          <div className={styles.rule} key={index}>
            Rule #{index + 1}
            <span className={styles.deleteButton} title='Delete Rule' onClick={() => deleteRule(index)} />
            <br />
            <input ref={index === rules?.length - 1 ? lastRuleRef : null} type='text' value={rule} onChange={(e) => handleRuleChange(index, e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Moderators = () => {
  const { t } = useTranslation();
  const { roles } = useSubplebbitSettingsStore();

  const rolesList = roles ? Object.entries(roles).map(([address, { role }]) => ({ address, role })) : [];

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('moderators')}</div>
      <div className={styles.boxSubtitle}>let other users moderate and post without challenges</div>
      <div className={styles.boxInput}>
        <button className={styles.addButton}>add a moderator</button>
        {rolesList?.map(({ address, role }, index) => (
          <div className={styles.moderator} key={index}>
            Moderator #{index + 1}
            <span className={styles.deleteButton} title='delete moderator' />
            <br />
            <span className={styles.moderatorAddress}>
              User address:
              <br />
              <input type='text' value={address} />
              <br />
            </span>
            <span className={styles.moderatorRole}>
              Moderator role:
              <br />
              <select value={role}>
                <option value='moderator'>moderator</option>
                <option value='admin'>admin</option>
                <option value='owner'>owner</option>
              </select>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const challengesNames = ['text-math', 'captcha-canvas-v3', 'fail', 'blacklist', 'question', 'evm-contract-call'];

const ChallengeSettings = ({ challenge }: any) => {
  const { name } = challenge || {};

  return (
    <>
      {name === 'text-math' && (
        <>
          <div className={styles.challengeDescription}>Ask a plain text math question, insecure, use ONLY for testing.</div>
          <div className={styles.challengeOption}>
            Difficulty
            <div className={styles.challengeOptionDescription}>The math difficulty of the challenge between 1-3.</div>
            <input type='text' defaultValue='1' placeholder='1' />
          </div>
        </>
      )}
      {name === 'captcha-canvas-v3' && (
        <>
          <div className={styles.challengeDescription}>custom image captcha</div>
          <div className={styles.challengeOption}>
            Characters
            <div className={styles.challengeOptionDescription}>Amount of characters of the captcha.</div>
            <input type='text' />
          </div>
          <div className={styles.challengeOption}>
            Width
            <div className={styles.challengeOptionDescription}>Height of the captcha.</div>
            <input type='text' />
          </div>
          <div className={styles.challengeOption}>
            Height
            <div className={styles.challengeOptionDescription}>Width of the captcha.</div>
            <input type='text' />
          </div>
          <div className={styles.challengeOption}>
            Color
            <div className={styles.challengeOptionDescription}>Color of the captcha.</div>
            <input type='text' />
          </div>
        </>
      )}
      {name === 'fail' && (
        <>
          <div className={styles.challengeDescription}>A challenge that automatically fails with a custom error message.</div>
          <div className={styles.challengeOption}>
            Error
            <div className={styles.challengeOptionDescription}>The error to display to the author.</div>
            <input type='text' defaultValue="You're not allowed to publish." placeholder="You're not allowed to publish." />
          </div>
        </>
      )}
      {name === 'blacklist' && (
        <>
          <div className={styles.challengeDescription}>Blacklist author addresses.</div>
          <div className={styles.challengeOption}>
            Blacklist
            <div className={styles.challengeOptionDescription}>Comma separated list of author addresses to be blacklisted.</div>
            <input type='text' placeholder='address1.eth,address2.eth,address3.eth' />
          </div>
          <div className={styles.challengeOption}>
            Error
            <div className={styles.challengeOptionDescription}>The error to display to the author.</div>
            <input type='text' defaultValue="You're blacklisted." placeholder="You're blacklisted." />
          </div>
        </>
      )}
      {name === 'question' && (
        <>
          <div className={styles.challengeDescription}>Ask a question, like 'What is the password?'</div>
          <div className={styles.challengeOption}>
            Question
            <div className={styles.challengeOptionDescription}>The question to answer.</div>
            <input type='text' />
          </div>
          <div className={styles.challengeOption}>
            Answer
            <div className={styles.challengeOptionDescription}>The answer to the question.</div>
            <input type='text' />
          </div>
        </>
      )}
      {name === 'evm-contract-call' && (
        <>
          <div className={styles.challengeDescription}>The response from an EVM contract call passes a condition, e.g. a token balance challenge.</div>
          <div className={styles.challengeOption}>
            chainTicker
            <div className={styles.challengeOptionDescription}>The chain ticker</div>
            <input type='text' placeholder='eth' defaultValue='eth' />
          </div>
          <div className={styles.challengeOption}>
            Address
            <div className={styles.challengeOptionDescription}>The contract address.</div>
            <input type='text' placeholder='0x...' />
          </div>
          <div className={styles.challengeOption}>
            ABI
            <div className={styles.challengeOptionDescription}>The ABI of the contract method.</div>
            <textarea placeholder='{"constant":true,"inputs":[{"internalType":"address","name":"account...' autoCorrect='off' autoComplete='off' spellCheck='false' />
          </div>
          <div className={styles.challengeOption}>
            Condition
            <div className={styles.challengeOptionDescription}>The condition the contract call response must pass.</div>
            <textarea placeholder='>1000' autoCorrect='off' autoComplete='off' spellCheck='false' />
          </div>
          <div className={styles.challengeOption}>
            Error
            <div className={styles.challengeOptionDescription}>The error to display to the author.</div>
            <input type='text' defaultValue="Contract call response doesn't pass condition." placeholder="Contract call response doesn't pass condition." />
          </div>
        </>
      )}
    </>
  );
};

const Challenges = () => {
  const { t } = useTranslation();
  const { settings } = useSubplebbitSettingsStore();
  const challenges = settings?.challenges || [];
  const [showSettings, setShowSettings] = useState<boolean[]>([]);

  const toggleSettings = (index: number) => {
    const newShowSettings = [...showSettings];
    newShowSettings[index] = !newShowSettings[index];
    setShowSettings(newShowSettings);
  };

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>{t('challenges')}</div>
      <div className={styles.boxSubtitle}>choose one or more challenges to prevent spam</div>
      <div className={styles.boxInput}>
        <button className={styles.addButton}>add a challenge</button>
        {challenges.length === 0 && <span className={styles.noChallengeWarning}>Warning: vulnerable to spam attacks.</span>}
        {challenges.map((challenge: any, index: number) => (
          <div key={index} className={styles.challenge}>
            Challenge #{index + 1}
            <span className={styles.deleteButton} title='delete challenge' />
            <br />
            <select value={challenge?.name}>
              {challengesNames.map((challenge) => (
                <option key={challenge} value={challenge}>
                  {challenge}
                </option>
              ))}
            </select>
            <button className={styles.challengeEditButton} onClick={() => toggleSettings(index)}>
              {showSettings[index] ? 'hide settings' : 'show settings'}
            </button>
            {showSettings[index] && <ChallengeSettings challenge={challenge} />}
          </div>
        ))}
      </div>
    </div>
  );
};

const FullSettings = () => {
  const { title, description, address, suggested, rules, roles, settings, subplebbitAddress, setSubmitStore } = useSubplebbitSettingsStore();
  const [text, setText] = useState('');

  useEffect(() => {
    const fullSettings = JSON.stringify({ title, description, address, suggested, rules, roles, settings, subplebbitAddress }, null, 2);
    setText(fullSettings);
  }, [title, description, address, suggested, rules, roles, settings, subplebbitAddress]);

  const handleChange = (newText: string) => {
    setText(newText);
    try {
      const newSettings = JSON.parse(newText);
      setSubmitStore(newSettings);
    } catch (e) {
      console.error('Invalid JSON format');
    }
  };

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>full settings data</div>
      <div className={styles.boxSubtitle}>quickly copy or paste the community settings</div>
      <div className={`${styles.boxInput} ${styles.fullSettings}`}>
        <textarea onChange={(e) => handleChange(e.target.value)} autoCorrect='off' autoComplete='off' spellCheck='false' value={text} />
      </div>
    </div>
  );
};

const SubplebbitSettings = () => {
  const { t } = useTranslation();

  const account = useAccount();
  const { subplebbitAddress } = useParams<{ subplebbitAddress: string }>();
  const subplebbit = useSubplebbit({ subplebbitAddress });
  const userRole = subplebbit?.roles?.[account.author?.address]?.role;
  const { address, createdAt, description, rules, settings, suggested, roles, title, updatedAt } = subplebbit || {};
  const isAdmin = userRole === 'admin' || userRole === 'owner' || settings;

  const { publishSubplebbitEditOptions, setSubmitStore } = useSubplebbitSettingsStore();
  const { publishSubplebbitEdit } = usePublishSubplebbitEdit(publishSubplebbitEditOptions);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // set the store with the initial data
  useEffect(() => {
    setSubmitStore({
      title: title ?? '',
      description: description ?? '',
      address,
      suggested: suggested ?? {},
      rules: rules ?? [],
      roles: roles ?? {},
      settings: settings ?? {},
      subplebbitAddress,
    });
  }, [subplebbitAddress, setSubmitStore, title, description, address, suggested, rules, roles, settings]);

  const [showLoading, setShowLoading] = useState(false);
  const saveSubplebbit = async () => {
    try {
      setShowLoading(true);
      await publishSubplebbitEdit();
      setShowLoading(false);
      alert(`saved`);
    } catch (e) {
      if (e instanceof Error) {
        console.warn(e);
        alert(`failed editing subplebbit: ${e.message}`);
      } else {
        console.error('An unknown error occurred:', e);
      }
      setShowLoading(false);
    }
  };

  useEffect(() => {
    document.title = `${t('preferences')} - seedit`;
  }, [t]);

  return (
    <div className={styles.content}>
      <div className={styles.sidebar}>
        <Sidebar address={subplebbitAddress} createdAt={createdAt} description={description} roles={roles} rules={rules} title={title} updatedAt={updatedAt} />
      </div>
      {!settings && <div className={styles.infobar}>can't connect to community node - only the owner of a community can edit its settings.</div>}
      <Title />
      <Description />
      <Address />
      <Logo />
      <Rules />
      <Moderators />
      {/* subplebbit.settings is private, only shows to the sub owner */}
      {settings?.challenges && <Challenges />}
      <FullSettings />
      <div className={styles.saveOptions}>
        <button disabled={!isElectron || !isAdmin || showLoading} onClick={saveSubplebbit}>
          {t('save_options')}
        </button>
        {showLoading && <LoadingEllipsis string={t('saving')} />}
      </div>
    </div>
  );
};

export default SubplebbitSettings;
