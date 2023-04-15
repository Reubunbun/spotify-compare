import { type FC } from 'react';
import { type CompareItem } from '../../../../../lib/Constants';
import styles from './CommonResult.module.css';

const CommonResult: FC<CompareItem> = ({ myRank, theirRank, name, imageURL, href }) => {
    const handleClickResult = () => {
        window.open(href, '_blank')?.focus();
    };

    return (
        <div className={styles.containerResult} onClick={handleClickResult}>
            <img src={imageURL || '/default.png'} />
            <div>
                <p className={styles.name}>{name}</p>
                <p className={styles.rank}>Your Rank: {myRank}</p>
                <p className={styles.rank}>Their Rank: {theirRank}</p>
            </div>
        </div>
    );
};

export default CommonResult;
