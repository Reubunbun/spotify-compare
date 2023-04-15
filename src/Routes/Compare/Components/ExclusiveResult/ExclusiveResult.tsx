import { type FC } from 'react';
import { type TopItemReturn } from '../../../../../lib/Spotify';
import styles from './ExclusiveResult.module.css';

const ExclusiveResult: FC<TopItemReturn> = ({ name, imageURL, href }) => {
    const handleClickResult = () => {
        window.open(href, '_blank')?.focus();
    };

    return (
        <div className={styles.containerResult} onClick={handleClickResult}>
            <img src={imageURL || '/default.png'} />
            <p>{name}</p>
        </div>
    );
};

export default ExclusiveResult;
