import { useState } from 'react';
import { setAccount, useAccount, useResolvedAuthorAddress } from '@plebbit/plebbit-react-hooks';
import { useTranslation } from 'react-i18next';
import styles from './address-settings.module.css';

const AddressSettings = () => {
  const { t } = useTranslation();
  const account = useAccount();

  const [cryptoState, setCryptoState] = useState({
    cryptoAddress: '',
    checkingCryptoAddress: false,
    showResolvingMessage: false,
    resolveString: t('crypto_address_verification'), // Default message
    resolveClass: '',
  });

  const [savedCryptoAddress, setSavedCryptoAddress] = useState(false);

  const author = { ...account?.author, address: cryptoState.cryptoAddress };
  const { resolvedAddress, state, error, chainProvider } = useResolvedAuthorAddress({ author, cache: false });

  const checkCryptoAddress = () => {
    if (!cryptoState.cryptoAddress || !cryptoState.cryptoAddress.includes('.')) {
      alert(t('enter_crypto_address'));
      return;
    }

    let resolveString = '';
    let resolveClass = '';

    if (state === 'failed') {
      resolveString = error instanceof Error ? `failed to resolve crypto address, error: ${error.message}` : 'cannot resolve crypto address, unknown error';
      resolveClass = styles.red;
    } else if (state === 'resolving') {
      resolveString = `resolving from ${chainProvider?.urls}`;
      resolveClass = styles.yellow;
    } else if (resolvedAddress && resolvedAddress === account?.signer?.address) {
      resolveString = t('crypto_address_yours');
      resolveClass = styles.green;
    } else if (resolvedAddress && resolvedAddress !== account?.signer?.address) {
      resolveString = t('crypto_address_not_yours');
      resolveClass = styles.red;
    } else {
      resolveString = t('crypto_address_verification');
      resolveClass = '';
    }

    setCryptoState((prevState) => ({
      ...prevState,
      showResolvingMessage: true,
      resolveString,
      resolveClass,
    }));
  };

  const saveCryptoAddress = async () => {
    if (!cryptoState.cryptoAddress || !cryptoState.cryptoAddress.includes('.')) {
      alert(t('enter_crypto_address'));
      return;
    } else if (resolvedAddress && resolvedAddress !== account?.signer?.address) {
      alert(t('crypto_address_not_yours'));
      return;
    } else if (cryptoState.cryptoAddress && !resolvedAddress) {
      alert(t('crypto_address_not_resolved'));
      return;
    } else if (resolvedAddress && resolvedAddress === account?.signer?.address) {
      try {
        await setAccount({ ...account, author: { ...account?.author, address: cryptoState.cryptoAddress } });
        setSavedCryptoAddress(true);

        setTimeout(() => {
          setSavedCryptoAddress(false);
        }, 2000);

        setCryptoState((prevState) => ({
          ...prevState,
          savedCryptoAddress: true,
          cryptoAddress: '',
          checkingCryptoAddress: false,
        }));
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
          console.log(error);
        } else {
          console.error('An unknown error occurred:', error);
        }
      }
      setSavedCryptoAddress(true);
      setCryptoState((prevState) => ({
        ...prevState,
        checkingCryptoAddress: false,
        showResolvingMessage: false,
        resolveString: t('crypto_address_verification'),
        resolveClass: '',
      }));
    }
  };

  const [showCryptoAddressInfo, setShowCryptoAddressInfo] = useState(false);

  return (
    <div className={styles.addressSettings}>
      <div className={styles.cryptoAddressSetting}>
        <div className={styles.usernameInput}>
          <input
            type='text'
            placeholder='address.eth'
            value={cryptoState.cryptoAddress}
            onChange={(e) => setCryptoState((prevState) => ({ ...prevState, cryptoAddress: e.target.value }))}
          />
          <button className={styles.infoButton} onClick={() => setShowCryptoAddressInfo(!showCryptoAddressInfo)}>
            {showCryptoAddressInfo ? 'x' : '?'}
          </button>
          <button className={styles.button} onClick={saveCryptoAddress}>
            {t('save')}
          </button>
          {showCryptoAddressInfo && (
            <div className={styles.cryptoAddressInfo}>
              <a href='https://app.ens.domains/' target='_blank' rel='noopener noreferrer'>
                app.ens.domains
              </a>
              {` > address.eth > records > edit records > add record > record name: "plebbit-author-address" > record value: ${account?.signer?.address} > save`}
            </div>
          )}
          {savedCryptoAddress && <span className={styles.saved}>{t('saved')}</span>}
        </div>
        <div className={styles.checkCryptoAddress}>
          <button className={styles.button} onClick={checkCryptoAddress}>
            {t('check')}
          </button>{' '}
          <span className={cryptoState.resolveClass}>{cryptoState.resolveString}</span>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default AddressSettings;
