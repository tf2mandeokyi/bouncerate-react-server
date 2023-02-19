import React, { useState } from 'react'
import Title from '../../components/title';
import MainPageScheduleTable from './schedule-table';

import './index.scss'


const Home : React.FC = () => {

    const [ maxBounceRate, setMaxBounceRate ] = useState<number>(30);

    return (
        <div className='page-content'>
            <Title>홈쇼핑 광고 편성표</Title>
            <div className='non-table'>
                <div className='expected-br-span'>예상 Bounce rate: N/A%</div>
                <div className='br-control'>
                    <div className='control-item'>
                        Bounce rate 최댓값
                        <div>
                            <input
                                type='number' value={ maxBounceRate }
                                onChange={ e => setMaxBounceRate(parseInt(e.target.value)) }
                            /> %
                        </div>
                    </div>
                </div>
            </div>
            <MainPageScheduleTable maxBounceRate={ maxBounceRate }/>
        </div>
    )
}

export default Home;